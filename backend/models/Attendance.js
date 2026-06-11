const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    employeeName: { type: String, required: true },
    department: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    status: {
      type: String,
      enum: ["Present", "Absent", "Half Day", "Leave"],
      default: "Present",
    },
    checkIn:  { type: String, default: "" }, // "09:15"
    checkOut: { type: String, default: "" }, // "18:00"
  },
  { timestamps: true }
);

// One record per employee per date
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
