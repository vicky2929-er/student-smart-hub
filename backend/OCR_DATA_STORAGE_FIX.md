# OCR Data Storage Fix

## Date: November 9, 2025

## Problem
The Flask API was being called correctly and processing certificates, but the parsed data (category, course, skills, etc.) was **not being saved to the database**. The data was only returned in the API response but never persisted.

## Root Cause
In `backend/routes/faculty.js`, the review achievement endpoint:
1. ✅ Called Flask API correctly (POST request)
2. ✅ Received parsed certificate data
3. ❌ Only logged and returned the data - **never saved it to database**

## Solution Applied

### 1. Import OcrOutput Model
Added `OcrOutput` model import to both faculty and student routes:
```javascript
const OcrOutput = require("../model/ocrOutput");
```

### 2. Save Parsed Data to Database
Updated `backend/routes/faculty.js` (after line 396) to save Flask API response:
```javascript
// Save parsed data to OcrOutput collection
if (response.data && response.data.parsed_data) {
  try {
    const parsedData = response.data.parsed_data;
    
    // Create OcrOutput document
    const ocrOutput = new OcrOutput({
      student: studentId,
      course: parsedData.course || null,
      date: parsedData.date && parsedData.date !== "Not found" ? new Date(parsedData.date) : null,
      issuer: parsedData.issuer && parsedData.issuer !== "Not found" ? parsedData.issuer : null,
      name: parsedData.name && parsedData.name !== "Not found" ? parsedData.name : null,
      skills: parsedData.skills || [],
      category: parsedData.category || null,
    });
    
    await ocrOutput.save();
    
    // Add reference to student's ocrOutputs array
    await Student.updateOne(
      { _id: studentId },
      { $push: { ocrOutputs: ocrOutput._id } }
    );
  } catch (saveError) {
    console.error("Error saving OCR output:", saveError.message);
    // Don't fail the whole request if OCR save fails
  }
}
```

### 3. New API Endpoints to View OCR Data

#### Faculty Endpoint:
**GET** `/api/faculty/student/:studentId/ocr-outputs`
- Faculty can view OCR outputs for their students
- Requires authentication
- Returns array of parsed certificate data

#### Student Endpoint:
**GET** `/api/students/:id/ocr-outputs`
- Students can view their own OCR outputs
- Requires authentication
- Returns array of parsed certificate data

## Database Schema
The `OcrOutput` model stores:
- `student` - Reference to Student
- `course` - Course name from certificate
- `date` - Date from certificate
- `issuer` - Issuer/organization name
- `name` - Name on certificate
- `skills` - Array of extracted skills
- `category` - Category classification (e.g., "CommunityService", "Internship", "Course")
- `createdAt` - Auto timestamp

## Testing the Fix

### Step 1: Approve a Certificate
1. Login as faculty (dhaval@test.com / admin123)
2. Go to Faculty Reviews
3. Approve a pending certificate
4. Check backend logs - should see:
   ```
   Flask API response: {...}
   OCR output saved to database: <id>
   OCR output reference added to student
   ```

### Step 2: View Saved OCR Data

#### Using API:
```powershell
# Login first to get token
$loginBody = @{email='dhaval@test.com'; password='admin123'} | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri 'http://localhost:3030/api/auth/login' -Method POST -Body $loginBody -ContentType 'application/json'
$token = $loginResponse.token

# Fetch OCR outputs for student
$headers = @{Authorization="Bearer $token"}
$ocrData = Invoke-RestMethod -Uri 'http://localhost:3030/api/faculty/student/6910487553d1a1996c8c447f/ocr-outputs' -Headers $headers

# View the data
$ocrData | ConvertTo-Json -Depth 10
```

#### Expected Response:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "...",
      "student": "6910487553d1a1996c8c447f",
      "course": "CERTIFICATE OF APPRECIATION",
      "date": null,
      "issuer": null,
      "name": null,
      "skills": [],
      "category": "CommunityService",
      "createdAt": "2025-11-09T...",
      "updatedAt": "2025-11-09T..."
    }
  ]
}
```

## What Happens Now (Complete Flow)

1. **Student uploads certificate** → Stored in UploadCare CDN
2. **Faculty reviews and approves** → Achievement status = "Approved"
3. **Backend calls Flask API** → POST to http://12.10.7.212:5003/process_certificate_url
4. **Flask API processes** → OCR extraction + category classification
5. **Flask API returns parsed data** → Backend receives response
6. **NEW: Backend saves to database** → Creates OcrOutput document
7. **NEW: Backend links to student** → Adds reference to student.ocrOutputs array
8. **Data is now persistent** → Can be retrieved anytime via API

## Files Modified
- ✅ `backend/routes/faculty.js` - Added OcrOutput import and save logic
- ✅ `backend/routes/students.js` - Added OcrOutput import and endpoint
- ✅ Added new endpoint: GET `/api/faculty/student/:studentId/ocr-outputs`
- ✅ Added new endpoint: GET `/api/students/:id/ocr-outputs`

## Server Status
- ✅ Backend running on port 3030 (nodemon auto-restart)
- ✅ Changes automatically detected and applied
- ✅ Ready to test

## Next Steps
1. Test by approving a pending certificate
2. Check backend logs for "OCR output saved to database"
3. Call the new endpoint to verify data is stored
4. Optionally: Create frontend component to display OCR data to students/faculty
