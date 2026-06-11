const express = require("express");
const router  = express.Router();
const { getPerformanceScores } = require("../controllers/performanceController");

router.get("/", getPerformanceScores);

module.exports = router;
