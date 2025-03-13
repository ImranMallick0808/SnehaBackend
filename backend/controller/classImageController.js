const ClassImage=require("../models/classImageModel")
const catchAsyncError = require("../middleware/catchAsyncError");
const getDataUri = require("../utils/dataUri");
const cloudinary = require("cloudinary");



exports.addClassImage = catchAsyncError(async (req, res, next) => {

  if (!req.file) {
    return res.status(400).json({ success: false, message: "No image uploaded" });
  }

  const {  className } = req.body; 

  const fileUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`; 

  const result = await cloudinary.uploader.upload(fileUri);


  const classImage = await ClassImage.create({
    className,
    classImage: result.secure_url,
    classPublicUrl: result.public_id,
  });

  res.status(201).json({
    success: true,
    classImage,
  });
});


exports.getClassImage = catchAsyncError(async (req, res, next) => {
  // Find all gallery images in the database
  const classImage = await ClassImage.find();

  if (classImage.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No gallery images found"
    });
  }

  
  res.status(200).json({
    success: true,
    classImage
  });
});
 