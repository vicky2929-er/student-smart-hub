const express = require("express");
const router = express.Router();
const Roadmap = require("../model/roadmap");
const Student = require("../model/student");
const { requireAuth } = require("../middleware/auth");

// Test route to verify roadmap API is working
router.get("/test", (req, res) => {
  res.json({ message: "Roadmap API is working", timestamp: new Date() });
});

router.get("/student/:studentId", requireAuth, async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ student_id: req.params.studentId })
      .populate("student_id")
      .sort({ created_at: -1 });
    res.json(roadmaps);
  } catch (error) {
    console.error("Error fetching student roadmaps:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { student_id, potential_roadmaps, generated_date } = req.body;
    const student = await Student.findById(student_id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const roadmap = new Roadmap({
      student_id,
      potential_roadmaps,
      generated_date: generated_date || new Date().toISOString().slice(0, 19).replace('T', ' ')
    });
    await roadmap.save();
    await roadmap.populate("student_id");
    res.status(201).json(roadmap);
  } catch (error) {
    console.error("Error creating roadmap:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get roadmap by ID
router.get("/:roadmapId", requireAuth, async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.roadmapId)
      .populate("student_id");
    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }
    res.json(roadmap);
  } catch (error) {
    console.error("Error fetching roadmap:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update roadmap
router.put("/:roadmapId", requireAuth, async (req, res) => {
  try {
    const { potential_roadmaps } = req.body;
    const roadmap = await Roadmap.findByIdAndUpdate(
      req.params.roadmapId,
      { 
        potential_roadmaps, 
        updated_at: new Date() 
      },
      { new: true }
    ).populate("student_id");
    
    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }
    res.json(roadmap);
  } catch (error) {
    console.error("Error updating roadmap:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete roadmap
router.delete("/:roadmapId", requireAuth, async (req, res) => {
  try {
    const roadmap = await Roadmap.findByIdAndDelete(req.params.roadmapId);
    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }
    res.json({ message: "Roadmap deleted successfully" });
  } catch (error) {
    console.error("Error deleting roadmap:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
