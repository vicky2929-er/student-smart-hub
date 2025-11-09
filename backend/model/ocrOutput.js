const mongoose = require("mongoose");

const ocrOutputSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    course: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: null,
    },
    issuer: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Helpful compound index for querying by student and recency
ocrOutputSchema.index({ student: 1, createdAt: -1 });

module.exports = mongoose.model("OcrOutput", ocrOutputSchema);


