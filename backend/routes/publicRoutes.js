const express = require("express");
const { getAllCourse } = require("../controller/courseController");

const router = express.Router();

//get all course
router.route("/allCourse").get(getAllCourse);

module.exports = router;
