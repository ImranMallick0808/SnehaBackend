const Gallery = require("../models/galleryModel");
const errorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const getDataUri = require("../utils/dataUri");
const cloudinary = require("cloudinary");




exports.addGalleyImage = catchAsyncError(async (req, res, next) => {

  if (!req.file) {
    return res.status(400).json({ success: false, message: "No image uploaded" });
  }

  const { description } = req.body; 

  const fileUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`; // Convert the file to a data URI

  const result = await cloudinary.uploader.upload(fileUri);


  const gallery = await Gallery.create({
    description,
    galleryImage: result.secure_url,
    galleryPublicUrl: result.public_id,
  });

  res.status(201).json({
    success: true,
    gallery,
  });
});





exports.deleteGalleryImage = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;


  const gallery = await Gallery.findById(id);
  if (!gallery) {
    return res.status(404).json({
      success: false,
      message: "Gallery image not found"
    });
  }

  // 2. Delete the image from Cloudinary
  try {
    await cloudinary.uploader.destroy(gallery.galleryPublicUrl);
  } catch (error) {
    return next(new errorHandler("Failed to delete image from Cloudinary", 500));
  }

  // 3. Delete the gallery record from MongoDB
  await Gallery.findByIdAndDelete(id);


  res.status(200).json({
    success: true,
    message: "Gallery image deleted successfully"
  });
});


exports.getAllGalleryImages = catchAsyncError(async (req, res, next) => {
  
  const galleries = await Gallery.find();


  if (galleries.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No gallery images found"
    });
  }

  res.status(200).json({
    success: true,
    galleries
  });
});
 
