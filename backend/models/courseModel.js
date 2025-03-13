const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: [true, "Please write course name"],
  },
  courseDescription: {
    type: String,
    required: [true, "Please Provide description"],
  },
   courseImage:{ //secure url
   type:String,
   required:[true]
  },
  imagePublicUrl:{
    type:String,
    required:[true]
  }
},{ timestamps: true });

module.exports = mongoose.model("Course", courseSchema);
