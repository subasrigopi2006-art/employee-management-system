const mongoose = require("mongoose");

const performanceReviewSchema = new mongoose.Schema({
  rating:    { type: String, enum: ["Excellent", "Good", "Average", "Poor"], required: true },
  score:     { type: Number, min: 1, max: 10, required: true },
  comment:   { type: String, default: "" },
  reviewedBy:{ type: String, default: "Admin" },
  reviewedAt:{ type: Date, default: Date.now },
});

const employeeSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    email:       { type: String, required: true, unique: true, trim: true, lowercase: true },
    department:  { type: String, required: true },
    salary:      { type: Number, required: true, min: 0 },
    performance: {
      type:    String,
      enum:    ["Excellent", "Good", "Average", "Poor"],
      default: "Good",
    },
    performanceHistory: [performanceReviewSchema],
    avatar:   { type: String },
    password: { type: String, required: true },  // plain for demo
    role:     { type: String, enum: ["admin", "employee"], default: "employee" },
  },
  { timestamps: true }
);

// Auto-generate avatar initials from name
employeeSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.avatar) {
    this.avatar = this.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  next();
});

module.exports = mongoose.model("Employee", employeeSchema);
