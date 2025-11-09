const uploadcare = require('@uploadcare/upload-client');
const multer = require("multer");
const path = require("path");

// Configure UploadCare client
const uploadcareClient = new uploadcare.UploadClient({
  publicKey: process.env.UPLOADCARE_PUBLIC_KEY,
  secretKey: process.env.UPLOADCARE_SECRET_KEY,
});

console.log("✅ UploadCare configured for file uploads");

// Memory storage for multer (since we'll upload to UploadCare)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only images, PDFs, and documents are allowed"));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit (UploadCare supports larger files)
  },
  fileFilter: fileFilter,
});

// Helper function to upload file to UploadCare
const uploadToUploadCare = async (fileBuffer, fileName, mimeType) => {
  try {
    const result = await uploadcareClient.uploadFile(fileBuffer, {
      fileName: fileName,
      contentType: mimeType,
      store: 'auto', // Store files automatically
      metadata: {
        subsystem: 'student-certificates',
        uploadedAt: new Date().toISOString()
      }
    });

    // Replace the generic domain with your project-specific domain
    let fileUrl = result.cdnUrl;
    const customDomain = process.env.UPLOADCARE_CUSTOM_DOMAIN || '2f7db9p6w8.ucarecd.net';
    if (fileUrl.includes('ucarecdn.com')) {
      fileUrl = fileUrl.replace('ucarecdn.com', customDomain);
    }

    return {
      success: true,
      fileUrl: fileUrl,
      fileId: result.uuid,
      originalUrl: result.originalFilename,
      size: result.size,
      mimeType: result.mimeType
    };
  } catch (error) {
    console.error('UploadCare upload error:', error);
    throw new Error(`Failed to upload to UploadCare: ${error.message}`);
  }
};

// Helper function to delete file from UploadCare
const deleteFromUploadCare = async (fileId) => {
  try {
    if (!fileId) return { success: false, message: 'No file ID provided' };
    
    await uploadcareClient.deleteFile({ uuid: fileId });
    return { success: true, message: 'File deleted successfully' };
  } catch (error) {
    console.error('UploadCare delete error:', error);
    return { success: false, message: error.message };
  }
};

// Helper function to get file info from UploadCare
const getFileInfo = async (fileId) => {
  try {
    const fileInfo = await uploadcareClient.fileInfo({ uuid: fileId });
    return {
      success: true,
      data: fileInfo
    };
  } catch (error) {
    console.error('UploadCare file info error:', error);
    return { success: false, message: error.message };
  }
};

// Helper function to convert URL to use project-specific domain
const convertUploadCareUrl = (url) => {
  if (!url) return url;
  const customDomain = process.env.UPLOADCARE_CUSTOM_DOMAIN || '2f7db9p6w8.ucarecd.net';
  if (url.includes('ucarecdn.com')) {
    return url.replace('ucarecdn.com', customDomain);
  }
  return url;
};

module.exports = { 
  uploadcareClient, 
  upload, 
  uploadToUploadCare, 
  deleteFromUploadCare, 
  getFileInfo,
  convertUploadCareUrl
};
