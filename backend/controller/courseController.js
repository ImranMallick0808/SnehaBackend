
const Student = require("../models/studentModel");
const Course = require("../models/courseModel");
const errorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const sendToken = require("../utils/sendToken");
const getDataUri = require("../utils/dataUri");
const cloudinary = require("cloudinary");



// Controller for adding a new course

exports.addCourse = catchAsyncError(async (req, res, next) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No image uploaded" });
  }

  const { courseName, courseDescription } = req.body;

  // Upload image to Cloudinary if provided
  const fileUri = getDataUri(req.file);
  const result = await cloudinary.uploader.upload(fileUri);

  // Create course with image URL
  const course = await Course.create({
    courseName,
    courseDescription,
    courseImage: result.secure_url,
    imagePublicUrl: result.public_id,
  });

  res.status(201).json({
    success: true,
    course,
  });
});
//all course 
exports.getAllCourse = catchAsyncError(async (req, res) => {
  const course= await Course.find({});

  res.status(200).json({
    success: true,
    course,
  });
});

//edit course
exports.editCourse = catchAsyncError(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  if (!course) {
    return next(new errorHandler("Course not found", 404));
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    course,
  });
});
//get single course
exports.getSingleCourse = catchAsyncError(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new errorHandler("Course not found", 404));
  }
  res.status(200).json({
    success: true,
    course,
  });
});

exports.deleteCourse = catchAsyncError(async (req, res, next) => {
  const courseId = req.params.id;

  // Find the course by ID
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  // Check if there is an image URL in the course document and delete it from Cloudinary
  if (course.imageUrl) {
    const publicId = course.imageUrl.split("/").pop().split(".")[0]; // Extract public ID from the image URL
    await cloudinary.uploader.destroy(publicId); // Delete image from Cloudinary
  }

  // Delete the course from the database
  await Course.deleteOne({ _id: courseId });

  res.status(200).json({
    success: true,
    message: "Course deleted successfully",
  });
});

//delete course  from student
exports.deleteCourseFromStudent = catchAsyncError(async (req, res, next) => {
  const { studentId, courseId } = req.params;

  // Find the student
  const student = await Student.findById(studentId).populate("courses");

  if (!student) {
    return next(new errorHandler("Student not found", 404));
  }

  // Check if the course exists in the student's course list
  const courseIndex = student.courses.findIndex(
    (c) => c.courseId?.toString() === courseId
  );

  if (courseIndex === -1) {
    return next(new errorHandler("Course not found in student's record", 404));
  }

  // Remove the course from the array
  student.courses.splice(courseIndex, 1);

  // Save the updated student document
  await student.save();

  res.status(200).json({
    success: true,
    message: "Course removed successfully",
    student,
  });
});

// add course to student
exports.addCourseToStudent = catchAsyncError(async (req, res, next) => {
  const {
    studentId,
    courseId,
    courseName,
    courseAddDate,
    levelStartFrom,
    courseMode,
    monthlyFees,
  } = req.body;

  const student = await Student.findById(studentId).populate("courses");
  const course = await Course.findById(courseId);

  if (!student) {
    return next(new errorHandler("Student not found", 404));
  }

  if (!course) {
    return next(new errorHandler("Course not found", 404));
  }

  // Check if the student is already enrolled in the course
  const isCourseEnrolled = student.courses.some(
    (c) => c.courseId?.toString() === courseId
  );
  if (isCourseEnrolled) {
    return next(
      new errorHandler("Student is already enrolled in this course", 400)
    );
  }

  // Add course to student's course array with courseName and addDate
  student.courses.push({
    courseId,
    courseName: course.courseName,
    courseAddDate: courseAddDate || new Date(),
    levelStartFrom,
    courseMode,
    monthlyFees,
  });

  await student.save();
  res.status(200).json({
    success: true,
    message: "Course added successfully",
    student,
  });
});
