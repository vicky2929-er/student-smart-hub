const jwt = require("jsonwebtoken");

// Pure JWT-based authentication middleware
const requireAuth = (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header (Bearer token)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Check for token in cookies as fallback
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.SECRET || "thisshouldbeabettersecret!"
    );

    // Add user info to request object
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT Authentication error:", error.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check if user has required role
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({ error: "Insufficient permissions" });
  };
};

module.exports = { requireAuth, requireRole };
