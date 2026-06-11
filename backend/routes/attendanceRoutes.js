const express = require("express");
const router  = express.Router();
const {
  getAttendance,
  markAttendance,
  markBulkAttendance,
  getSummary,
} = require("../controllers/attendanceController");

router.get("/",        getAttendance);
router.get("/summary", getSummary);
router.post("/",       markAttendance);
router.post("/bulk",   markBulkAttendance);

module.exports = router;
