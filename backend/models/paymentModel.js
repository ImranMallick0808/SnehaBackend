/*const mongoose = require('mongoose');

    const paymentSchema = new mongoose.Schema({
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
      },
      month: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
      },
      year: {
        type: Number,
        required: true,
      },
      monthlyFees: {
        type: Number,
        default: 0,
      },
      admissionFees: {
        type: Number,
        default: 0,
      },
      studyMaterialFees: {
        type: Number,
        default: 0,
      },
      lateFine: {
        type: Number,
        default: 0,
      },
      examFees: {
        type: Number,
        default: 0,
      },
      reAdmissionFees: {
        type: Number,
        default: 0,
      },
      otherFees: {
        type: Number,
        default: 0,
      },
      totalAmountPaid: {
        type: Number,
        required: true,
        default: 0,
      },
      status: {
        type: String,
        enum: ['paid', 'unpaid'],
        required: true,
      },
      paymentMode: {
        type: String,
        required: true,
      },
      paymentDate: {
        type: Date,
        default: Date.now,
      },
      paymentDoneBy:{
        type:String,
        required:true,
      }
    }, {
      timestamps: true,
    });
  
    

module.exports = mongoose.model("Payment", paymentSchema);

*/

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    monthlyFees: {
      type: Number,
    },
    otherFees: {
      admissionFees: { type: Number, default: 0 },
      studyMaterialFees: { type: Number, default: 0 },
      lateFine: { type: Number, default: 0 },
      examFees: { type: Number, default: 0 },
      reAdmissionFees: { type: Number, default: 0 },
      otherFees: { type: Number, default: 0 },
    },
    totalAmountPaid: {
      type: Number,
      default: 0,
    },
    paymentMode: {
      type: String,
    },
    paymentDoneBy: {
      type: String,
    },
    receiptNumber: {
      type: Number,
      unique: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
