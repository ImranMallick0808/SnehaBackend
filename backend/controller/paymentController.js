
const Payment = require("../models/paymentModel");
const Student = require("../models/studentModel");
const errorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const sendToken = require("../utils/sendToken");


// Get a student along with their payments
/*
exports.getStudentWithPayments = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
  
    const student = await Student.findById(id).populate("payments");
    if (!student) {
      next(new errorHandler("Student not found", 404));
    }
  
    res.status(201).json({
      success: true,
      student,
    });
  });*/

exports.getMonthlyFees = async (req, res) => {
    const { month, year } = req.params;
    try {
      const payments = await Payment.aggregate([
        { $match: { month: parseInt(month), year: parseInt(year) } },
        { $group: { _id: null, totalMonthlyFees: { $sum: "$amountPaid" } } },
      ]);
  
      res
        .status(200)
        .json({ totalMonthlyFees: payments[0]?.totalMonthlyFees || 0 });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch monthly fees", error });
    }
  };


  exports.getYearlyFees = async (req, res) => {
    const { year } = req.params;
  
    try {
      const feesSummary = await Payment.aggregate([
        {
          $match: {
            "monthlyFees.year": parseInt(year),
          },
        },
        {
          $unwind: "$monthlyFees",
        },
        {
          $match: {
            "monthlyFees.month": { $gte: 1, $lte: 12 },
            "monthlyFees.year": parseInt(year),
          },
        },
        {
          $group: {
            _id: { month: "$monthlyFees.month" },
            totalMonthlyFees: { $sum: "$monthlyFees.monthlyFees" },  
            totalAmountPaid: { $sum: "$totalAmountPaid" },  
          },
        },
        {
          $project: {
            month: "$_id.month",
            totalMonthlyFees: 1,
            totalAmountPaid: 1,
            _id: 0,
          },
        },

        { $sort: { month: 1 } },
      ]);
      const completeFeesSummary = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const monthData = feesSummary.find((m) => m.month === month);
        return {
          month,
          totalMonthlyFees: monthData ? monthData.totalMonthlyFees : 0,
          totalAmountPaid: monthData ? monthData.totalAmountPaid : 0,
        };
      });
  
      res.status(200).json({ feesSummary: completeFeesSummary });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch yearly fees", error });
    }
  };
exports.getLastMonthFees = async (req, res) => {
  const now = new Date();

  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() , 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth()+1, 0, 23, 59, 59, 999); 

  try {
    const feesSummary = await Payment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfLastMonth,
            $lte: endOfLastMonth,
          },
        },
      },
     
      {
        $group: {
          _id: null,
          totalMonthlyFees: { $sum: "$monthlyFees" },
          totalAmountPaid: { $sum: "$totalAmountPaid" },
         
        },
      },
    
      
    ]);

   
    const summary = feesSummary.length > 0 
      ? feesSummary[0] 
      : { totalMonthlyFees: 0, totalAmountPaid: 0,};

    res.status(200).json({ lastMonthFees: summary });
  } catch (error) {
    console.error("Error fetching last month's fees:", error);
    res.status(500).json({ message: "Failed to fetch last month's fees", error });
  }
};

//
/*
exports.getMonthlyPaymentHistory = async (req, res) => {
  const { month, year } = req.params; 

  try {
    const startOfMonth = new Date(year, month - 1, 1);  
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);  
    const payments = await Payment.find({
      createdAt: {
        $gte: startOfMonth,  
        $lte: endOfMonth,   
      },
    })
      .populate("student", "name")  
      .exec();

      

    res.status(200).json({ payments });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payment history for the month", error });
  }
};*/

exports.getMonthlyPaymentHistory = async (req, res) => {
  const { month, year } = req.params; // Parameters for month and year
  const { page = 1, limit = 5} = req.query; // Pagination query parameters

  try {
    const startOfMonth = new Date(year, month - 1, 1); // Start of the specified month
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999); // End of the specified month

    // Define the base match query
    const matchQuery = {
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    };

    // Count total matching records
    const totalRecords = await Payment.countDocuments(matchQuery);

    // Perform query with pagination
    const payments = await Payment.find(matchQuery)
      .populate("student", "name") // Populate the student name field
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .exec();

    // Calculate the total amount paid for the filtered records
    const totalAmountPaid = await Payment.aggregate([
      { $match: { createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, totalAmountPaid: { $sum: "$totalAmountPaid" } } },
    ]);

    // Prepare the response
    res.status(200).json({
      success: true,
      payments,
      totalAmountPaid: totalAmountPaid[0]?.totalAmountPaid || 0,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment history",
      error: error.message,
    });
  }
};




exports.addPayment = catchAsyncError(async (req, res, next) => {
  const {
    studentId,
    month,
    year,
    monthlyFees,
    admissionFees = 0,
    studyMaterialFees = 0,
    lateFine = 0,
    examFees = 0,
    reAdmissionFees = 0,
    otherFees = 0,
    paymentMode,
    paymentDoneBy,
  } = req.body;

  const student = await Student.findById(studentId);
  if (!student) {
    return next(new errorHandler("Student not found", 404));
  }

  if (month < 1 || month > 12) {
    return next(new errorHandler("Invalid month. Must be between 1 and 12.", 400));
  }
  const currentYear = new Date().getFullYear()+1;
  if (year > currentYear + 1 || year < currentYear - 5) {
    return next(new errorHandler("Invalid year.", 400));
  }

  let feeEntry;
if (monthlyFees > 0) {

  feeEntry = student.monthlyFees.find(
    (fee) => fee.month === month && fee.year === year
  );

  if (!feeEntry) {
  
    feeEntry = {
      month,
      year,
      monthlyFees,
      status: "paid", 
    };
    student.monthlyFees.push(feeEntry); 
  } else {
  
    if (feeEntry.status === "paid") {
      return next(new errorHandler("This month's fee has already been paid.", 400));
    }
    feeEntry.status = "paid";
    feeEntry.paymentDate = new Date(); 
  }
  await student.save(); 
}

  const totalAmountPaid =
    monthlyFees +
    admissionFees +
    studyMaterialFees +
    lateFine +
    examFees +
    reAdmissionFees +
    otherFees;


  const latestPayment = await Payment.findOne()
    .sort({ receiptNumber: -1 })
    .select("receiptNumber");
  const nextReceiptNumber = latestPayment?.receiptNumber
    ? latestPayment.receiptNumber + 1
    : 100;


  if (isNaN(nextReceiptNumber)) {
    return next(new errorHandler("Failed to generate a valid receipt number.", 500));
  }

 
  const payment = await Payment.create({
    student: studentId,
    monthlyFees: monthlyFees,
    otherFees: {
      admissionFees,
      studyMaterialFees,
      lateFine,
      examFees,
      reAdmissionFees,
      otherFees,
    },
    totalAmountPaid,
    paymentMode,
    paymentDoneBy,
    receiptNumber: nextReceiptNumber,
  });

  // Update the student's payments array with the new payment's ID
  const updatedStudent = await Student.findByIdAndUpdate(
    studentId,
    { $push: { payments: payment._id } },
    { new: true }
  );

  res.status(201).json({
    success: true,
    message: "Payment record added successfully",
    payment,
    updatedStudent,
  });
});

