const fetch = require("node-fetch");  
const catchAsyncError = require("../middleware/catchAsyncError");
const errorHandler = require("../utils/errorHandler");
const Student=require("../models/studentModel")


exports.sendSms = catchAsyncError(async (req, res, next) => {
    
   
    const { id, message } = req.body;

    if (!id || !message) {
        return next(new errorHandler("Both 'id' and 'message' are required", 400));
      }
    
 

  try {


    const user = await Student.findById(id);
    if (!user) {
      return next(new errorHandler("User not found", 404));
    }

    if (!user.whatsappNo) {
      return next(
        new errorHandler("User does not have a registered WhatsApp number", 400)
      );
    }



    // Construct the API URL
    const apiUrl = `https://www.msgwapi.com/api/whatsapp/send?receiver=${user.whatsappNo}&msgtext=${encodeURIComponent(message)}&token=${process.env.WHATSAPP_API_TOKEN}`;

    // Send the message using fetch
    const response = await fetch(apiUrl);

    
    if (!response.ok) {
      const errorData = await response.json(); 
      console.error("API response error:", errorData);
      return next(new errorHandler("Failed to send message via WhatsApp API", 500));
    }

    // Parse the response JSON
    const responseData = await response.json();

    // Check API response for success
    if (!responseData.success) {
      console.error("API response error:", responseData);
      return next(new errorHandler("Failed to send message", 500));
    }

    
    res.status(200).json({
      success: true,
      message: `Message sent successfully to`,
    });
  } catch (error) {
    console.error("Error sending message:", error.message);
    return next(new errorHandler("Failed to send message", 500));
  }
});
