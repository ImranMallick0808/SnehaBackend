// models/Student.js
const mongoose = require("mongoose");



const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Please Enter Name"] },
    schoolName: { type: String, required: [true, "Please Enter School Name"] },
    class: { type: String, required: [true, "Please Enter Class"] },
    dateOfBirth: { type: Date, required: [true, "Please enter Date of Birth"] },
    gender: { type: String, required: [true, "Please enter gender"] },
    siblings: String,
    age: { type: Number, required: [true, "Please enter your age"] },
    hobbies: String,
    fatherName: { type: String, required: [true, "Please enter father name"] },
    fatherOccupation: { type: String, required: [true, "Please Enter Father Occupation"] },
    motherName: String,
    motherOccupation: String,
    address:{ type: String, required: [true, "Please Enter Address"] },
    city: String,
    pinCode:{ type: Number, required: [true, "Please Enter Pin"] },
    state: String,
    mobileNo:{ type: Number, required: [true, "Please Enter Number"] },
    whatsappNo: { type: Number, required: [true, "Please Enter WhatApps Number"] },
    email_id: { type: String, required: [true, "Please Enter Email"] },
    courses: [
      { 
        courseId:String,
        courseName: String,
        courseAddDate: Date,
        levelStartFrom: String,
        courseMode:String,
        monthlyFees: Number,
      }
    ],

    branch: { type: String, required: [true, "Please Select a Branch"] },
    roll:{ type: String, required: [true, "Please Enter Roll"] },
    levelStartFrom:{ type: String, required: [true, "Please Enter"] },
    source: String,
   
    nameoftheRecipients: String,
    date: Date,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    admin: { type: mongoose.Schema.ObjectId, ref: "Admin", required: true },
    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
      },
    ],
    monthlyFees: [
      {
        month: {
          type: Number,
          min: 1,
          max: 12,
        },
        year: {
          type: Number,
        },
        status: {
          type: String,
          enum: ["paid", "unpaid"],
          default: "unpaid",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
