// Utility functions for UploadCare URL handling

/**
 * Convert UploadCare URL from generic domain to custom domain
 * @param {string} url - The original UploadCare URL
 * @returns {string} - URL with custom domain
 */
const convertUploadCareUrl = (url) => {
  if (!url) return url;
  const customDomain = process.env.UPLOADCARE_CUSTOM_DOMAIN || '2f7db9p6w8.ucarecd.net';
  if (url.includes('ucarecdn.com')) {
    return url.replace('ucarecdn.com', customDomain);
  }
  return url;
};

/**
 * Convert URLs in an achievement object
 * @param {Object} achievement - Achievement object with potential fileUrl
 * @returns {Object} - Achievement object with converted URL
 */
const convertAchievementUrls = (achievement) => {
  if (!achievement) return achievement;
  return {
    ...achievement,
    fileUrl: convertUploadCareUrl(achievement.fileUrl)
  };
};

/**
 * Convert URLs in an array of achievements
 * @param {Array} achievements - Array of achievement objects
 * @returns {Array} - Array with converted URLs
 */
const convertAchievementArrayUrls = (achievements) => {
  if (!achievements || !Array.isArray(achievements)) return achievements;
  return achievements.map(achievement => {
    // Handle both Mongoose documents and plain objects
    const achObj = achievement.toObject ? achievement.toObject() : achievement;
    return convertAchievementUrls(achObj);
  });
};

/**
 * Convert URLs in a student object (including achievements)
 * @param {Object} student - Student object with achievements
 * @returns {Object} - Student object with converted URLs
 */
const convertStudentUrls = (student) => {
  if (!student) return student;
  
  const studentObj = student.toObject ? student.toObject() : student;
  
  if (studentObj.achievements && Array.isArray(studentObj.achievements)) {
    studentObj.achievements = convertAchievementArrayUrls(studentObj.achievements);
  }
  
  return studentObj;
};

module.exports = {
  convertUploadCareUrl,
  convertAchievementUrls,
  convertAchievementArrayUrls,
  convertStudentUrls
};
