const Admin = require("../models/adminModel");
const Student = require("../models/studentModel");
const errorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const sendToken = require("../utils/sendToken");
const moment = require("moment");
//register admin
exports.registerAdmin = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).send({
      success: false,
      message: "All fields are required",
    });
  }
  const existingUser = await Admin.findOne({ email });
  if (existingUser) {
    return res.status(409).send({
      success: false,
      message: "User already exists",
    });
  }

  // Create new admin (hash password before saving)
  const admin = await Admin.create({
    name,
    email,
    password,
  });

  res.status(201).send({
    success: true,
    message: "Admin registered successfully",
    admin,
  });
});

//admin login
exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new errorHandler("Please Enter Email & Password", 400));
  }
  const admin = await Admin.findOne({ email }).select("+password");
  if (!admin) {
    return next(new errorHandler("Invalid email or password", 401));
  }
  const isPasswordMatched = await admin.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new errorHandler("Invalid email or password", 401));
  }

  sendToken(admin, 200, res);
});
//get all amdin

exports.getAllAdmin = catchAsyncError(async (req, res) => {
  const admin = await Admin.find({});

  res.status(200).json({
    success: true,
    admin,
  });
});

// Delete Admin by ID
exports.deleteAdmin = catchAsyncError(async (req, res) => {
  const { id } = req.params;

  const admin = await Admin.findByIdAndDelete(id);

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: "Admin not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Admin deleted successfully",
  });
});

//logout admin
exports.logout = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logout",
  });
});

//student register
/*exports.registerStudent = catchAsyncError(async (req, res, next) => {
  req.body.admin = req.admin.id;
    const student = await Student.create({
    ...req.body, 
              
  });


  res.status(201).json({
    success: true,
    student,
  });
});*/
//new 
/*
//student register
exports.registerStudent = catchAsyncError(async (req, res, next) => {
  req.body.admin = req.admin.id;
  const newRoll = await Student.findOne()
  .sort({ roll: -1 }) // Sort by roll number in descending order
  .select("roll"); // Only retrieve the roll field

let nextnewRoll;

if (newRoll?.roll) {
  // Extract the numeric part of the roll number
  const lastRollNumber = parseInt(newRoll.roll.split("-")[1], 10);

  // Increment the numeric part
  nextnewRoll = `BSA-${lastRollNumber + 1}`;
} else {
  // Start with the first roll number
  nextnewRoll = "BSA-100";
}

// Handle invalid roll numbers
if (!nextnewRoll) {
  return next(new errorHandler("Failed to generate a valid roll number.", 500));
}

// Log the generated roll number for debugging
console.log("Generated Roll Number:", nextnewRoll);

// Assign the roll number to req.body
req.body.roll = nextnewRoll;

    const student = await Student.create({
    ...req.body, 
              
  });


  res.status(201).json({
    success: true,
    student,
    roll: nextnewRoll,
  });
});*/

//student register
exports.registerStudent = catchAsyncError(async (req, res, next) => {
  req.body.admin = req.admin.id;
  const { dateOfBirth, date} = req.body;
  const formattedDob = moment(dateOfBirth, "DD/MM/YYYY").toISOString();
  const formattedAdmissionDate = moment(date, "DD/MM/YYYY").toISOString();
  const newRoll = await Student.findOne()
  .sort({ roll: -1 }) // Sort by roll number in descending order
  .select("roll"); // Only retrieve the roll field

let nextnewRoll;

if (newRoll?.roll) {
  // Extract the numeric part of the roll number
  const lastRollNumber = parseInt(newRoll.roll.split("-")[1], 10);

  // Increment the numeric part
  nextnewRoll = `BSA-${lastRollNumber + 1}`;
} else {
  // Start with the first roll number
  nextnewRoll = "BSA-100";
}

// Handle invalid roll numbers
if (!nextnewRoll) {
  return next(new errorHandler("Failed to generate a valid roll number.", 500));
}

// Log the generated roll number for debugging
console.log("Generated Roll Number:", nextnewRoll);

// Assign the roll number to req.body
req.body.roll = nextnewRoll;
req.body.dateOfBirth= formattedDob;
    req.body.date = formattedAdmissionDate;
    const student = await Student.create({
    ...req.body, 
              
  });


  res.status(201).json({
    success: true,
    student,
    roll: nextnewRoll,
  });
});
//edit student

exports.editStudent = catchAsyncError(async (req, res, next) => {
 
  let student = await Student.findById(req.params.id);
  if (!student) {
    return next(new errorHandler("Student not found", 404));
  }
  student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true, 
    runValidators: true, 
    useFindAndModify: false, 
  });
  res.status(200).json({
    success: true,
    student,
  });
});
exports.deleteStudent= catchAsyncError(async (req, res) => {
  const { id } = req.params;

  const student= await Student.findByIdAndDelete(id);

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Student deleted successfully",
  });
});
//get all active student student
/*exports.getAllStudent = catchAsyncError(async (req, res, next) => {
  const allStudent = await Student.find({ status: "active" }).populate("payments").populate('monthlyFees');

  res.status(200).json({
    success: true,
    message: "All active student",
    allStudent,
  });
});*/
//new

exports.getAllStudent = catchAsyncError(async (req, res, next) => {
  const { page = 1, limit = 10, search = "", branch = "" } = req.query;
  const skip = (page - 1) * limit;

  const searchQuery = {
    status: "active",
    ...(branch && { branch }), // Include branch filter if provided
    $or: [
      { name: { $regex: search, $options: "i" } },
      { roll: { $regex: search, $options: "i" } },
    ],
  };

  try {
    const allStudent = await Student.find(searchQuery)
      .populate("payments")
      .populate("monthlyFees")
      .populate("branch")
      .skip(skip)
      .limit(parseInt(limit));

    const totalStudents = await Student.countDocuments(searchQuery);
    const totalStudentsCount = await Student.countDocuments(); 

    res.status(200).json({
      success: true,
      message: "All active students fetched successfully",
      allStudent,
      totalStudents,
      totalStudentsCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching students",
      error: error.message,
    });
  }
});



////get all inactive student student
exports.getAllInactiveStudent = catchAsyncError(async (req, res, next) => {
  const allStudent = await Student.find({ status: "inactive" }).populate(
    "name"
  );

  res.status(200).json({
    success: true,
    message: "All inactive student",
    allStudent,
  });
});

//get single student
exports.getSingleStudent = catchAsyncError(async (req, res, next) => {
  const student = await Student.findById(req.params.id)
    .populate("courses")
    .populate("payments");
  if (!student) {
    return next(new errorHandler("Student not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Student is hare",
    student,
  });
});


// Function to update student status
exports.updateStudentStatus = catchAsyncError(async (req, res, next) => {
  const studentId = req.params.id;
  const { status } = req.body;

  // Validate the status value (must be 'active' or 'inactive')
  if (!["active", "inactive"].includes(status)) {
    return next(
      new errorHandler(
        'Invalid status value. Must be "active" or "inactive".',
        400
      )
    );
  }

  // Find the student by ID and update their status
  const updatedStudent = await Student.findByIdAndUpdate(
    studentId,
    { status },
    { new: true } 
  );
  if (!updatedStudent) {
    return next(new errorHandler("Student not found", 404));
  }

  res.status(200).json({
    success: true,
    message: `Student status updated to ${status}`,
    student: updatedStudent,
  });
});

//get branch
exports.getBranches = catchAsyncError(async (req, res, next) => {
  const branches = await Student.distinct("branch");

  if (!branches || branches.length === 0) {
    return next(new errorHandler("No branches found", 404));
  }

  res.status(200).json({
    success: true,
    branches,
  });
});


//unpaid  month
exports.getUnpaidMonths = catchAsyncError(async (req, res, next) => {
  const studentId = req.params.id;

  const student = await Student.findById(studentId).populate("payments");

  if (!student) {
    return next(new errorHandler("Student not found", 404));
  }

  let unpaidMonthCount = 0;
  let unpaidMonthNames = [];

  student.payments.forEach((payment) => {
  
    payment.monthlyFees.forEach((month) => {
      if (month.status === "unpaid") {
        unpaidMonthCount++;
      
        const monthDate = new Date(month.year, month.month - 1);
        const monthName = monthDate.toLocaleString("default", { month: "long", year: "numeric" });
        unpaidMonthNames.push(monthName);
      }
    });
  });

  res.status(200).json({
    success: true,
    unpaidMonthCount,
    unpaidMonthNames,
  });
});
