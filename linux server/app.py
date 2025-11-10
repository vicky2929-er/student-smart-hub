from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import traceback
import requests
import tempfile
from urllib.parse import urlparse
import time

# OCR Imports
import pytesseract
from PIL import Image
import ocrmypdf 

# AI and NLP Imports
import google.generativeai as genai

# --- NEW: MongoDB Imports ---
from pymongo import MongoClient
from pymongo.server_api import ServerApi

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Increase request timeout for long OCR operations
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
import signal

class TimeoutError(Exception):
    pass

def timeout_handler(signum, frame):
    raise TimeoutError("Request timeout")

# Set longer timeout for requests
signal.signal(signal.SIGALRM, timeout_handler)

# --- Configure API Keys and Database URI from Environment Variables ---
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
MONGO_URI = os.environ.get("MONGO_URI")

# Configure Gemini
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("WARNING: GEMINI_API_KEY environment variable not found.")

# Configure MongoDB Client
mongo_client = None
if MONGO_URI:
    try:
        mongo_client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
        mongo_client.admin.command('ping')
        print("Successfully connected to MongoDB!")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        mongo_client = None
else:
    print("WARNING: MONGO_URI environment variable not found. Database features will be disabled.")

# --- Helper & AI Functions ---
def load_json(filename):
    if not os.path.exists(filename):
        with open(filename, 'w') as f: json.dump({}, f)
        return {}
    try:
        with open(filename, 'r') as f: return json.load(f)
    except json.JSONDecodeError: return {}

def save_json(data, filename):
    with open(filename, 'w') as f: json.dump(data, f, indent=2)

def call_gemini(prompt, is_json_output=True):
    try:
        config = {"temperature": 0.2}
        # Remove response_mime_type as it's not supported in this version
        model = genai.GenerativeModel("gemini-2.5-flash", generation_config=config)
        
        # Add explicit JSON request in prompt if needed
        if is_json_output:
            prompt += "\n\nPlease respond with valid JSON only."
        
        response = model.generate_content(prompt)
        print(f"Gemini API response: {response.text[:200]}...")  # Debug log
        
        if is_json_output:
            # Try to extract JSON from response
            response_text = response.text.strip()
            # Remove markdown code blocks if present
            if response_text.startswith('```json'):
                response_text = response_text.replace('```json', '').replace('```', '').strip()
            elif response_text.startswith('```'):
                response_text = response_text.replace('```', '').strip()
            
            return json.loads(response_text)
        else:
            return response.text
            
    except json.JSONDecodeError as e:
        print(f"JSON decode error from Gemini response: {e}")
        print(f"Raw response: {response.text}")
        # Try to find JSON in the response
        try:
            import re
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except:
            pass
        return None
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        print(f"Error type: {type(e).__name__}")
        traceback.print_exc()
        return None

def parse_and_classify_with_gemini(text: str) -> dict:
    """
    Uses the Gemini LLM to parse certificate text AND classify it.
    """
    categories = [
        "Workshop", "Conference", "Hackathon", "Internship", "Course",
        "Competition", "CommunityService", "Leadership"
    ]
    
    prompt = f"""
    Analyze the following text from a certificate. Your task is to perform two actions:
    1.  **Extract Details:** Identify the full name, course/achievement title, issuing organization, and issue date.
    2.  **Classify Document:** Classify the document into ONE of the following categories based on its content: {json.dumps(categories)}. If it does not fit any of these, classify it as "Others".

    Return a single, valid JSON object with keys: "name", "course", "issuer", "date", and "category".
    If a detail cannot be found, use the value "Not found".

    Text to analyze:
    ---
    {text}
    ---
    """
    return call_gemini(prompt)

def extract_granular_skills(course_title):
    prompt = f'Extract the specific skills from this course title: "{course_title}". Return a JSON object with one key, "skills", an array of strings.'
    result = call_gemini(prompt)
    return result.get('skills', []) if result else []

def download_document_from_url(document_url):
    """
    Downloads a document from the given URL and saves it to a temporary file.
    Returns the file path and original filename.
    """
    try:
        # Parse URL to get filename
        parsed_url = urlparse(document_url)
        original_filename = os.path.basename(parsed_url.path)
        if not original_filename:
            original_filename = "document"
        
        # Download the file
        response = requests.get(document_url, stream=True, timeout=30)
        response.raise_for_status()
        
        # Use system temp directory instead of creating our own
        temp_dir = tempfile.gettempdir()
        print(f"Using temp directory: {temp_dir}")
        
        # Get file extension from content-type if not in filename
        if '.' not in original_filename:
            content_type = response.headers.get('content-type', '')
            if 'pdf' in content_type:
                original_filename += '.pdf'
            elif 'image' in content_type:
                if 'jpeg' in content_type or 'jpg' in content_type:
                    original_filename += '.jpg'
                elif 'png' in content_type:
                    original_filename += '.png'
                else:
                    original_filename += '.jpg'  # default
        
        temp_filepath = os.path.join(temp_dir, original_filename)
        
        # Save the downloaded content
        with open(temp_filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        return temp_filepath, original_filename
    
    except Exception as e:
        print(f"Error downloading document from URL: {e}")
        traceback.print_exc()
        return None, None

def save_to_mongodb(data_to_save):
    if not mongo_client:
        print("MongoDB client not available. Skipping database save.")
        return False
    try:
        # --- CHANGE: Point to the 'test' database ---
        db = mongo_client['test']          
        collection = db['ocroutput']      # Collection name remains the same
        collection.insert_one(data_to_save)
        print("Successfully saved parsed data to MongoDB in 'SIH' database.")
        return True
    except Exception as e:
        print(f"Error saving to MongoDB: {e}")
        traceback.print_exc()
        return False

def generate_roadmap_for_student(student_id, parsed_data, skills):
    """
    Generate a learning roadmap based on student's current skills and certificate data
    """
    try:
        category = parsed_data.get('category', 'Others')
        course = parsed_data.get('course', '')
        current_skills = skills
        
        # Generate career titles based on category and skills
        career_roadmaps = []
        
        if category.lower() in ['course', 'workshop'] and any('security' in skill.lower() or 'ethical' in skill.lower() or 'cyber' in skill.lower() for skill in current_skills):
            # Cybersecurity focused roadmaps
            career_roadmaps.extend([
                {
                    "career_title": "Cybersecurity Analyst",
                    "existing_skills": [skill.lower() for skill in current_skills[:4]],
                    "sequenced_roadmap": [
                        "network security fundamentals",
                        "incident response and forensics",
                        "security information and event management (siem)",
                        "threat intelligence and analysis"
                    ]
                },
                {
                    "career_title": "Penetration Tester",
                    "existing_skills": [skill.lower() for skill in current_skills[:4]],
                    "sequenced_roadmap": [
                        "advanced penetration testing methodologies",
                        "web application security testing",
                        "network penetration testing",
                        "mobile application security testing"
                    ]
                }
            ])
        elif category.lower() in ['course', 'workshop'] and any('web' in skill.lower() or 'development' in skill.lower() or 'programming' in skill.lower() for skill in current_skills):
            # Web development focused roadmaps
            career_roadmaps.extend([
                {
                    "career_title": "Full Stack Developer",
                    "existing_skills": [skill.lower() for skill in current_skills[:4]],
                    "sequenced_roadmap": [
                        "advanced javascript frameworks (react/vue/angular)",
                        "backend api development (node.js/python/java)",
                        "database design and optimization",
                        "cloud deployment and devops"
                    ]
                },
                {
                    "career_title": "Frontend Developer",
                    "existing_skills": [skill.lower() for skill in current_skills[:4]],
                    "sequenced_roadmap": [
                        "advanced css and responsive design",
                        "modern javascript frameworks",
                        "web performance optimization",
                        "progressive web applications (pwa)"
                    ]
                }
            ])
        else:
            # Generic technology roadmap
            career_roadmaps.append({
                "career_title": f"{category} Specialist",
                "existing_skills": [skill.lower() for skill in current_skills[:4]],
                "sequenced_roadmap": [
                    f"advanced {course.lower() if course else 'technical'} concepts",
                    "industry best practices and standards",
                    "project management and collaboration",
                    "continuous learning and certification"
                ]
            })
        
        # Create the roadmap structure matching the specified format
        roadmap = {
            'student_id': student_id,
            'generated_date': time.strftime('%Y-%m-%d %H:%M:%S'),
            'potential_roadmaps': career_roadmaps
        }
        
        return roadmap
        
    except Exception as e:
        print(f"Error generating roadmap: {e}")
        return None

def save_roadmap_to_mongodb(roadmap_data):
    """
    Save roadmap data to MongoDB 'roadmap' collection in 'SIH' database
    """
    if not mongo_client:
        print("MongoDB client not available. Skipping roadmap save.")
        return False
    try:
        db = mongo_client['test']
        collection = db['roadmap']
        
        # Check if roadmap already exists for this student
        student_id = roadmap_data.get('student_id')
        if student_id:
            # Update existing roadmap or insert new one
            result = collection.replace_one(
                {'student_id': student_id}, 
                roadmap_data, 
                upsert=True
            )
            if result.upserted_id:
                print(f"Successfully created new roadmap for student {student_id} in MongoDB.")
            else:
                print(f"Successfully updated roadmap for student {student_id} in MongoDB.")
        else:
            collection.insert_one(roadmap_data)
            print("Successfully saved roadmap to MongoDB.")
        return True
    except Exception as e:
        print(f"Error saving roadmap to MongoDB: {e}")
        traceback.print_exc()
        return False

# --- API Endpoints (remain the same) ---
@app.route('/get_student_data', methods=['GET'])
def get_student_data():
    detailed_data = load_json('student_detailed_data.json')
    skills_data = load_json('student_skills.json')
    return jsonify({'detailed_data': detailed_data, 'skills_data': skills_data})

@app.route('/update_student_data', methods=['POST'])
def update_student_data():
    data = request.get_json()
    if 'detailed_data' in data: save_json(data['detailed_data'], 'student_detailed_data.json')
    if 'skills_data' in data: save_json(data['skills_data'], 'student_skills.json')
    return jsonify({'status': 'success', 'message': 'Data files updated.'})

@app.route('/get_roadmap/<student_id>', methods=['GET'])
def get_roadmap(student_id):
    roadmaps = load_json('roadmaps.json')
    student_roadmap = roadmaps.get(student_id)
    if not student_roadmap: return jsonify({'error': 'Roadmap not found.'}), 404
    return jsonify(student_roadmap)

# --- Main Processing Endpoint (Updated) ---
@app.route('/process_certificate', methods=['POST'])
def process_certificate_endpoint():
    if 'certificate' not in request.files or 'student_id' not in request.form:
        return jsonify({'error': 'Missing certificate file or student_id'}), 400
    
    cert_file = request.files['certificate']
    student_id = request.form['student_id']

    # 1. OCR - save to temp directory
    temp_dir = tempfile.gettempdir()
    filepath = os.path.join(temp_dir, f"{student_id}_{cert_file.filename}")
    cert_file.save(filepath)

    try:
        if filepath.lower().endswith('.pdf'):
            text_output_path = filepath + ".txt"
            ocrmypdf.ocr(filepath, filepath, deskew=True, sidecar=text_output_path, progress_bar=False, force_ocr=True)
            with open(text_output_path, 'r') as f: extracted_text = f.read()
            os.remove(text_output_path)
        else:
            extracted_text = pytesseract.image_to_string(Image.open(filepath))
    except Exception as e:
        traceback.print_exc(); return jsonify({'error': f'OCR failed: {e}'}), 500

    # 2. AI Parsing and Classification
    parsed_data = parse_and_classify_with_gemini(extracted_text)
    if not parsed_data: return jsonify({'error': 'AI parsing and classification failed.'}), 500
        
    granular_skills = extract_granular_skills(parsed_data.get('course', ''))
    parsed_data['skills'] = granular_skills
    parsed_data['student_id'] = student_id 

    # --- FIX: Send a COPY of the data to MongoDB ---
    # This prevents the original 'parsed_data' dictionary from being mutated
    # with the non-serializable ObjectId.
    data_for_mongo = parsed_data.copy()
    save_to_mongodb(data_for_mongo)

    # 4. Save to local JSON files (using the original, clean 'parsed_data')
    detailed_data = load_json('student_detailed_data.json')
    student_skills = load_json('student_skills.json')
    if student_id not in detailed_data: detailed_data[student_id] = []
    detailed_data[student_id].append(parsed_data)
    if student_id not in student_skills: student_skills[student_id] = []
    for skill in granular_skills:
        if skill.lower() not in [s.lower() for s in student_skills[student_id]]:
            student_skills[student_id].append(skill)
    save_json(detailed_data, 'student_detailed_data.json')
    save_json(student_skills, 'student_skills.json')
    
    # 5. Roadmap Generation Logic (remains the same)
    # ...

    return jsonify({
        'status': 'success',
        'message': f'Certificate processed, classified, and stored for student {student_id}.',
        'parsed_data': parsed_data,
        'updated_detailed_data': detailed_data,
        'updated_skills_data': student_skills
    })

# --- New API Endpoint for URL-based Document Processing ---
@app.route('/process_certificate_url', methods=['POST'])
def process_certificate_url_endpoint():
    """
    Process a certificate from a URL with JSON payload containing document_url and student_id
    """
    try:
        data = request.get_json()
        
        if not data or 'document_url' not in data or 'student_id' not in data:
            return jsonify({'error': 'Missing document_url or student_id in JSON payload'}), 400
        
        document_url = data['document_url']
        student_id = data['student_id']
        
        print(f"Processing document from URL: {document_url} for student: {student_id}")
        
        # Check if required environment variables are set
        if not GEMINI_API_KEY:
            return jsonify({'error': 'GEMINI_API_KEY environment variable not set'}), 500
        
        if not MONGO_URI:
            print("WARNING: MONGO_URI not set, will skip MongoDB storage")
    
    except Exception as e:
        print(f"Error in initial request processing: {e}")
        traceback.print_exc()
        return jsonify({'error': f'Request processing failed: {str(e)}'}), 500
    
    # 1. Download document from URL
    temp_filepath, original_filename = download_document_from_url(document_url)
    if not temp_filepath:
        return jsonify({'error': 'Failed to download document from URL'}), 500
    
    try:
        # 2. OCR Processing - keep file in temp directory
        final_filepath = temp_filepath  # Use the temp file directly, no need to move it
        
        # Extract text based on file type
        try:
            if final_filepath.lower().endswith('.pdf'):
                text_output_path = final_filepath + ".txt"
                ocrmypdf.ocr(final_filepath, final_filepath, deskew=True, sidecar=text_output_path, progress_bar=False, force_ocr=True)
                with open(text_output_path, 'r') as f: 
                    extracted_text = f.read()
                os.remove(text_output_path)
            else:
                extracted_text = pytesseract.image_to_string(Image.open(final_filepath))
        except Exception as e:
            traceback.print_exc()
            return jsonify({'error': f'OCR failed: {e}'}), 500
        
        # 3. AI Parsing and Classification
        print(f"=== DEBUG: OCR COMPLETE ===")
        print(f"Extracted text length: {len(extracted_text)}")
        print(f"Extracted text preview: {extracted_text[:300]}...")
        print(f"=== CALLING GEMINI API ===")
        
        if len(extracted_text.strip()) == 0:
            return jsonify({'error': 'OCR extracted no text from the document'}), 500
        
        parsed_data = parse_and_classify_with_gemini(extracted_text)
        print(f"=== GEMINI API RESULT: {parsed_data} ===")
        
        if not parsed_data:
            return jsonify({'error': 'AI parsing and classification failed. Check server logs for Gemini API details.'}), 500
        
        # 4. Extract granular skills
        granular_skills = extract_granular_skills(parsed_data.get('course', ''))
        parsed_data['skills'] = granular_skills
        parsed_data['student_id'] = student_id
        parsed_data['document_url'] = document_url  # Store original URL
        
        # 5. Save to MongoDB
        data_for_mongo = parsed_data.copy()
        save_to_mongodb(data_for_mongo)
        
        # 6. Save to local JSON files
        detailed_data = load_json('student_detailed_data.json')
        student_skills = load_json('student_skills.json')
        
        if student_id not in detailed_data:
            detailed_data[student_id] = []
        detailed_data[student_id].append(parsed_data)
        
        if student_id not in student_skills:
            student_skills[student_id] = []
        
        for skill in granular_skills:
            if skill.lower() not in [s.lower() for s in student_skills[student_id]]:
                student_skills[student_id].append(skill)
        
        save_json(detailed_data, 'student_detailed_data.json')
        save_json(student_skills, 'student_skills.json')
        
        # 7. Generate and save roadmap
        roadmap_data = generate_roadmap_for_student(student_id, parsed_data, granular_skills)
        if roadmap_data:
            # Save to local JSON file
            roadmaps = load_json('roadmaps.json')
            roadmaps[student_id] = roadmap_data
            save_json(roadmaps, 'roadmaps.json')
            
            # Save to MongoDB roadmap collection
            save_roadmap_to_mongodb(roadmap_data)
        
        # 8. Clean up temporary files
        try:
            if os.path.exists(temp_filepath):
                os.remove(temp_filepath)
        except:
            pass  # Ignore cleanup errors
        
        return jsonify({
            'status': 'success',
            'message': f'Certificate from URL processed, classified, and stored for student {student_id}.',
            'parsed_data': parsed_data,
            'document_url': document_url,
            'extracted_text_preview': extracted_text[:200] + '...' if len(extracted_text) > 200 else extracted_text
        })
    
    except Exception as e:
        # Clean up on error
        try:
            if temp_filepath and os.path.exists(temp_filepath):
                os.remove(temp_filepath)
            if 'final_filepath' in locals() and os.path.exists(final_filepath):
                os.remove(final_filepath)
        except:
            pass
        
        traceback.print_exc()
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

# --- GET Endpoint for URL-based Document Processing (for easy CMD testing) ---
@app.route('/process_certificate_get', methods=['GET'])
def process_certificate_get_endpoint():
    """
    Process a certificate from a URL using GET parameters for easy command line testing
    """
    document_url = request.args.get('document_url')
    student_id = request.args.get('student_id')
    
    if not document_url or not student_id:
        return jsonify({'error': 'Missing document_url or student_id parameters'}), 400
    
    # Call the existing POST endpoint logic
    try:
        # Simulate the POST request data
        fake_request_data = {
            'document_url': document_url,
            'student_id': student_id
        }
        
        # Use the same processing logic as the POST endpoint
        print(f"Processing document from URL: {document_url} for student: {student_id}")
        
        # Check if required environment variables are set
        if not GEMINI_API_KEY:
            return jsonify({'error': 'GEMINI_API_KEY environment variable not set'}), 500
        
        if not MONGO_URI:
            print("WARNING: MONGO_URI not set, will skip MongoDB storage")
    
        # Download document from URL
        temp_filepath, original_filename = download_document_from_url(document_url)
        if not temp_filepath:
            return jsonify({'error': 'Failed to download document from URL'}), 500
        
        try:
            # OCR Processing - keep file in temp directory
            final_filepath = temp_filepath  # Use the temp file directly, no need to move it
            
            # Extract text based on file type
            try:
                if final_filepath.lower().endswith('.pdf'):
                    text_output_path = final_filepath + ".txt"
                    ocrmypdf.ocr(final_filepath, final_filepath, deskew=True, sidecar=text_output_path, progress_bar=False, force_ocr=True)
                    with open(text_output_path, 'r') as f: 
                        extracted_text = f.read()
                    os.remove(text_output_path)
                else:
                    extracted_text = pytesseract.image_to_string(Image.open(final_filepath))
            except Exception as e:
                traceback.print_exc()
                return jsonify({'error': f'OCR failed: {e}'}), 500
            
            # AI Parsing and Classification
            print(f"=== DEBUG: OCR COMPLETE ===")
            print(f"Extracted text length: {len(extracted_text)}")
            print(f"Extracted text preview: {extracted_text[:300]}...")
            print(f"=== CALLING GEMINI API ===")
            
            if len(extracted_text.strip()) == 0:
                return jsonify({'error': 'OCR extracted no text from the document'}), 500
            
            parsed_data = parse_and_classify_with_gemini(extracted_text)
            print(f"=== GEMINI API RESULT: {parsed_data} ===")
            
            if not parsed_data:
                return jsonify({'error': 'AI parsing and classification failed. Check server logs for Gemini API details.'}), 500
            
            # Extract granular skills
            granular_skills = extract_granular_skills(parsed_data.get('course', ''))
            parsed_data['skills'] = granular_skills
            parsed_data['student_id'] = student_id
            parsed_data['document_url'] = document_url
            
            # Save to MongoDB
            data_for_mongo = parsed_data.copy()
            save_to_mongodb(data_for_mongo)
            
            # Save to local JSON files
            detailed_data = load_json('student_detailed_data.json')
            student_skills = load_json('student_skills.json')
            
            if student_id not in detailed_data:
                detailed_data[student_id] = []
            detailed_data[student_id].append(parsed_data)
            
            if student_id not in student_skills:
                student_skills[student_id] = []
            
            for skill in granular_skills:
                if skill.lower() not in [s.lower() for s in student_skills[student_id]]:
                    student_skills[student_id].append(skill)
            
            save_json(detailed_data, 'student_detailed_data.json')
            save_json(student_skills, 'student_skills.json')
            
            # Generate and save roadmap
            roadmap_data = generate_roadmap_for_student(student_id, parsed_data, granular_skills)
            if roadmap_data:
                # Save to local JSON file
                roadmaps = load_json('roadmaps.json')
                roadmaps[student_id] = roadmap_data
                save_json(roadmaps, 'roadmaps.json')
                
                # Save to MongoDB roadmap collection
                save_roadmap_to_mongodb(roadmap_data)
            
            # Clean up temporary files
            try:
                if os.path.exists(temp_filepath):
                    os.remove(temp_filepath)
            except:
                pass
            
            return jsonify({
                'status': 'success',
                'message': f'Certificate from URL processed, classified, and stored for student {student_id}.',
                'parsed_data': parsed_data,
                'document_url': document_url,
                'extracted_text_preview': extracted_text[:200] + '...' if len(extracted_text) > 200 else extracted_text
            })
        
        except Exception as e:
            # Clean up on error
            try:
                if temp_filepath and os.path.exists(temp_filepath):
                    os.remove(temp_filepath)
                if 'final_filepath' in locals() and os.path.exists(final_filepath):
                    os.remove(final_filepath)
            except:
                pass
            
            traceback.print_exc()
            return jsonify({'error': f'Processing failed: {str(e)}'}), 500
            
    except Exception as e:
        print(f"Error in initial request processing: {e}")
        traceback.print_exc()
        return jsonify({'error': f'Request processing failed: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=True)

