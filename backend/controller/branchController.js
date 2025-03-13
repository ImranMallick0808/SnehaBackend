const Branch = require("../models/branchModel");
const catchAsyncError = require("../middleware/catchAsyncError");
const errorHandler = require("../utils/errorHandler");


//add new branch
exports.createBranch= catchAsyncError(async (req, res, next) => {
    const { branchName } = req.body;
    const branch = await Branch.create({
      branchName
    });
  
    res.status(201).json({
        success:true,
        branch
    });
  });


// edit branch
exports.editBranch = catchAsyncError(async (req, res, next) => {
  
  let branch = await Branch.findById(req.params.id);
  if (!branch) {
    return next(new errorHandler("Branch Not Found", 404));
  }

  branch = await Branch.findByIdAndUpdate(req.params.id, req.body, {
    new: true,  
    runValidators: true,  
    useFindAndModify: false,
  });

  


  if (!branch) {
    return next(new errorHandler("Failed to update branch", 500));
  }

  res.status(200).json({
    success: true,
    branch,
  });
});



//get all branch

exports.getAllBranch = catchAsyncError(async (req, res) => {
  const branch= await Branch.find({});

  res.status(200).json({
    success: true,
    branch,
  });
});




//get student by branch
exports.getStudentsByBranch = catchAsyncError(async (req, res, next) => {
  const branch = req.params.branch;

  const students = await Student.find({ branch });
  if (!students || students.length === 0) {
    return next(new errorHandler("No students found for this branch", 404));
  }

  res.status(200).json({
    success: true,
    students,
  });
});
