const express = require("express");
const passport = require("../config/passport");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Login route with JWT
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Authentication error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!user) {
      return res.status(401).json({
        error: info.message || "Authentication failed",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: user._id,
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      process.env.SECRET || "thisshouldbeabettersecret!",
      { expiresIn: "7d" } // Token expires in 7 days
    );

    // Role-based redirect URLs for frontend
    const redirectUrls = {
      superadmin: "/dashboard/superadmin",
      institute: `/institute/dashboard/${user._id}`,
      college: "/dashboard/college",
      department: `/department/dashboard/${user._id}`,
      faculty: `/faculty/dashboard/${user._id}`,
      student: `/students/dashboard/${user._id}`,
    };

    const redirectUrl = redirectUrls[user.role] || "/dashboard";

    // Set token in httpOnly cookie for browser security
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only use secure in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax",
    });

    // Return JSON response with user data and redirect URL
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      redirectUrl,
    });
  })(req, res, next);
});

// Logout route
router.post("/logout", (req, res) => {
  // Clear the token cookie
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out successfully" });
});

// Check authentication status
router.get("/status", (req, res) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.json({ authenticated: false });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.SECRET || "thisshouldbeabettersecret!"
    );

    res.json({
      authenticated: true,
      user: {
        _id: decoded._id,
        id: decoded._id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      },
    });
  } catch (error) {
    console.error("Status check error:", error);
    res.json({ authenticated: false });
  }
});

module.exports = router;
