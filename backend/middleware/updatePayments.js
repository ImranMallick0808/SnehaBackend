// updatePayments.js
const cron = require("node-cron");
const Student = require("../models/studentModel");
const moment = require("moment"); // For date formatting



// Function to add unpaid fees for all students
const addUnpaidFeesForAllStudents = async () => {
  try {
    // Get all active students
    const students = await Student.find({ status: "active" });

    for (const student of students) {
      const currentMonth = moment().month() + 1;
      const currentYear = moment().year(); 

      const registrationMonth = moment(student.date).month() + 1; 
      const registrationYear = moment(student.date).year(); 

      const unpaidMonths = [];

      if (
        registrationYear < currentYear ||
        (registrationYear === currentYear && registrationMonth <= currentMonth)
      ) {
        for (let month = registrationMonth+1; month <= currentMonth; month++) {  
  
          let year = currentYear;
          if (month > 12) {
            month = 1; // Reset to January
            year++;
          }

          const existingFee = student.monthlyFees.find(
            (fee) => fee.month === month && fee.year === year
          )
          if (!existingFee) {
            unpaidMonths.push({
              month,
              year,
              status: "unpaid", 
            });
          }
        }

        if (unpaidMonths.length > 0) {
          student.monthlyFees.push(...unpaidMonths);
          await student.save();
        }
      }
    }
  } catch (err) {
    console.error("Error adding unpaid fees:", err);
  }
};
const resetPayment = () => {
  cron.schedule("* * * * *", async () => { 
    try {
      await addUnpaidFeesForAllStudents();
    } catch (error) {
      console.error("Error updating unpaid fees:", error);
    }
  });
};

module.exports = resetPayment;
