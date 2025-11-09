# Flask API Integration Fix

## Date: [Current Session]

## Problem
The backend was calling the Flask API with incorrect method and endpoint:
- **Wrong**: GET request to `/process_certificate_get` endpoint
- **Actual Flask API**: POST request to `/process_certificate_url` endpoint

## Root Cause
The backend code in `routes/faculty.js` was:
1. Using `axios.get()` instead of `axios.post()`
2. Appending `/process_certificate_get` to the FLASK_API_URL
3. Sending data as query parameters instead of JSON body

## Solution Applied
Updated `backend/routes/faculty.js` (lines ~380-395):

### Before:
```javascript
const apiEndpoint = `${flaskApiUrl}/process_certificate_get`;
const response = await axios.get(apiEndpoint, {
  params: {
    document_url: processedUrl,
    student_id: studentId
  },
  // ...
});
```

### After:
```javascript
const response = await axios.post(flaskApiUrl, {
  document_url: processedUrl,
  student_id: studentId
}, {
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});
```

## Changes Made
1. ✅ Changed from GET to POST method
2. ✅ Removed `/process_certificate_get` path (FLASK_API_URL already contains full path)
3. ✅ Changed to send data in JSON body instead of query parameters
4. ✅ Updated headers to include `Content-Type: application/json`

## Configuration
The `.env` file contains:
```
FLASK_API_URL=http://12.10.7.212:5003/process_certificate_url
```

This is the complete endpoint - no additional path needed.

## Testing Results
- ✅ Flask API tested with curl/PowerShell - Working
- ✅ Backend server restarted with fixes - Running on port 3030
- ✅ Ready for end-to-end testing

## Expected Behavior
When faculty approves a student certificate:
1. Backend receives approval request
2. Backend updates achievement status to "Approved"
3. Backend calls Flask API with POST to `http://12.10.7.212:5003/process_certificate_url`
4. Flask API processes certificate image (OCR + classification)
5. Flask API returns parsed data (category, course, skills, etc.)
6. Backend returns success response to frontend

## Next Steps
1. Start frontend application
2. Login as faculty (dhaval@test.com / admin123)
3. Review and approve a pending student certificate
4. Verify Flask API is called and processes the certificate
5. Check that parsed data is stored correctly

## Related Files
- `backend/routes/faculty.js` - Review achievement endpoint
- `backend/.env` - Flask API configuration
- `backend/FLASK_API_INTEGRATION.md` - Original integration documentation
