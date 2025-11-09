const mongoose = require("mongoose");

const roadmapSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  potential_roadmaps: [
    {
      career_title: {
        type: String,
        required: true,
        trim: true,
      },
      existing_skills: [
        {
          type: String,
          trim: true,
        },
      ],
      match_score: {
        type: Number,
        min: 0,
        max: 1,
      },
      sequenced_roadmap: [
        {
          type: String,
          trim: true,
        },
      ],
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

const Roadmap = mongoose.model("Roadmap", roadmapSchema);

module.exports = Roadmap;
