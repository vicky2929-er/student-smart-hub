# Document Processing API

This Flask application processes certificates and documents using OCR and AI classification.

## New API Endpoint

### POST /process_certificate_url

Processes a document from a URL with JSON payload.

**Endpoint:** `POST http://your-server:5003/process_certificate_url`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
    "document_url": "https://example.com/path/to/certificate.pdf",
    "student_id": "STUDENT_123"
}
```

**Response:**
```json
{
    "status": "success",
    "message": "Certificate from URL processed, classified, and stored for student STUDENT_123.",
    "parsed_data": {
        "name": "John Doe",
        "course": "Python Programming",
        "issuer": "Tech Institute",
        "date": "2024-01-15",
        "category": "Course",
        "skills": ["Python", "Programming", "Web Development"],
        "student_id": "STUDENT_123",
        "document_url": "https://example.com/path/to/certificate.pdf"
    },
    "document_url": "https://example.com/path/to/certificate.pdf",
    "extracted_text_preview": "Certificate of Completion..."
}
```

## Setup for Ubuntu Server

### Quick Fix for PyOpenSSL Error

If you encounter the PyOpenSSL/OpenSSL compatibility error, run the fix script:

```bash
chmod +x fix_dependencies.sh
./fix_dependencies.sh
```

### Manual Setup

1. Install system dependencies:
```bash
sudo apt update
sudo apt install tesseract-ocr python3-pip build-essential libssl-dev libffi-dev python3-dev
```

2. Fix PyOpenSSL compatibility (if needed):
```bash
pip3 uninstall -y pyOpenSSL cryptography pymongo
pip3 install --upgrade pip
pip3 install cryptography==41.0.7
pip3 install pyOpenSSL==23.3.0
pip3 install pymongo==4.6.0
```

3. Install remaining dependencies:
```bash
pip3 install -r requirements.txt
```

4. Set environment variables:
```bash
export GEMINI_API_KEY="your_gemini_api_key"
export MONGO_URI="your_mongodb_connection_string"
```

5. Run the application:
```bash
python3 app.py
```

### Alternative: Using Virtual Environment (Recommended)

```bash
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
export GEMINI_API_KEY="your_gemini_api_key"
export MONGO_URI="your_mongodb_connection_string"
python3 app.py
```

## Testing with curl

```bash
curl -X POST http://localhost:5003/process_certificate_url \
  -H "Content-Type: application/json" \
  -d '{
    "document_url": "https://example.com/certificate.pdf",
    "student_id": "TEST_001"
  }'
```

## Features

- Downloads documents from URLs (PDF, JPG, PNG)
- OCR text extraction using Tesseract and OCRmyPDF
- AI-powered document classification using Google Gemini
- Skill extraction from course titles
- MongoDB storage
- Local JSON file storage
- Automatic cleanup of temporary files
