const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const College = require("../model/college");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Get college profile by ID
router.get("/profile/:id", requireAuth, async (req, res) => {
  try {
    const college = await College.findById(req.params.id)
      .populate("institute", "name")
      .populate("departments", "name");
    
    if (!college) {
      return res.status(404).json({ error: "College not found" });
    }

    res.json({
      success: true,
      college: {
        _id: college._id,
        name: college.name,
        code: college.code,
        email: college.email,
        contactNumber: college.contactNumber,
        address: college.address,
        website: college.website,
        type: college.type,
        institute: college.institute,
        departments: college.departments,
        status: college.status,
        createdAt: college.createdAt,
        updatedAt: college.updatedAt
      }
    });
  } catch (error) {
    console.error("Get college profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update college profile
router.put("/profile/:id", requireAuth, async (req, res) => {
  try {
    const {
      name,
      contactNumber,
      address,
      website,
      type
    } = req.body;

    const college = await College.findById(req.params.id);
    
    if (!college) {
      return res.status(404).json({ error: "College not found" });
    }

    // Update fields
    if (name) college.name = name;
    if (contactNumber) college.contactNumber = contactNumber;
    if (address) college.address = address;
    if (website) college.website = website;
    if (type) college.type = type;

    await college.save();

    const updatedCollege = await College.findById(req.params.id)
      .populate("institute", "name")
      .populate("departments", "name");

    res.json({
      success: true,
      message: "Profile updated successfully",
      college: updatedCollege
    });
  } catch (error) {
    console.error("Update college profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
