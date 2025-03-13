const express = require("express");


const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");





const {
  registerAdmin,
  registerStudent,
  login,
  logout,
  getAllStudent,
  getSingleStudent,
  getAllAdmin,
  deleteAdmin,
  updateStudentStatus,
  getAllInactiveStudent,
  editStudent,
  getUnpaidMonths,
   deleteStudent,
} = require("../controller/adminController");
const { addCourseToStudent, addCourse, editCourse, deleteCourse, deleteCourseFromStudent, getSingleCourse } = require("../controller/courseController");

const {
  

  getYearlyFees,
  getMonthlyFees,
  getLastMonthFees,
  getMonthlyPaymentHistory,
  addPayment,
} = require("../controller/paymentController");

const singleUpload = require("../middleware/multer");
const { addGalleyImage, deleteGalleryImage, getAllGalleryImages, getGalleryImage } = require("../controller/galleryController");
const { addClassImage, getClassImage } = require("../controller/classImageController");
const { createBranch, getAllBranch, editBranch, getStudentsByBranch } = require("../controller/branchController");
const { sendSms } = require("../controller/smsController");


const router = express.Router();


//super admin
router.route("/registerAdmin").post(isAuthenticatedUser,authorizeRoles("admin"), registerAdmin);
router.route("/admins").get(isAuthenticatedUser,authorizeRoles("admin"),getAllAdmin)

router.route("/admins/:id").delete(isAuthenticatedUser,authorizeRoles("admin"),deleteAdmin)

//admin
router.route("/login").post(login);

router.route("/logout").get(isAuthenticatedUser, logout);

router.route("/register").post(isAuthenticatedUser, registerStudent);
//all student
router.route("/allStudent").get(isAuthenticatedUser, getAllStudent);
//single student
router
  .route("/getSingleStudent/:id")
  .get(isAuthenticatedUser,getSingleStudent)
 ;



//get branch
//router.route("/branches").get(isAuthenticatedUser,getBranches);
router.route("/allBranch").get(getAllBranch)
//Student by branch
router.route("/getStudentsByBranch/:branch").get(isAuthenticatedUser,getStudentsByBranch);

//addcoure


router.route("/addCourse").post(isAuthenticatedUser,singleUpload, addCourse);  

//delete
router
  .route("/course/:id").get(getSingleCourse)
  .put(isAuthenticatedUser, editCourse)
  .delete(isAuthenticatedUser, deleteCourse);

//add course to student
router.route("/addCourseToStudent").post(isAuthenticatedUser,addCourseToStudent);
//delete course from student
router
  .route("/students/:studentId/courses/:courseId")
  .delete(isAuthenticatedUser,deleteCourseFromStudent);


//gallery
//router.route("/addImage").post(singleUpload,addGalleyImage)
router.route("/addImage").post(
  (req, res, next) => {
    singleUpload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  isAuthenticatedUser,
  addGalleyImage
);


router.route("/deleteImage/:id").delete(isAuthenticatedUser,deleteGalleryImage)

router.route("/images").get(getAllGalleryImages)

router.route("/addClassImage").post(isAuthenticatedUser,singleUpload,addClassImage)

router.route("/getClassImages").get(getClassImage)


//payment
router.route("/addPayment").post(isAuthenticatedUser,addPayment);


//router.route("/student/:id").get(isAuthenticatedUser,getStudentWithPayments);

router.route("/monthlyFees/:month/:year").get(isAuthenticatedUser,getMonthlyFees);

router.route("/yearlyFees/:year").get(isAuthenticatedUser,getYearlyFees);
router.route("/monthlyPaymentHistory/:month/:year").get(isAuthenticatedUser,getMonthlyPaymentHistory);
router.route("/lastMonthFees").get(isAuthenticatedUser,getLastMonthFees)

//branch
router.route("/addBranch").post(isAuthenticatedUser,createBranch)

router.route("/editBranch/:id").put(isAuthenticatedUser,editBranch)



//sms
router.route("/sendSms").post(isAuthenticatedUser,sendSms)


router.route("/updateStudentStatus/:id").put(isAuthenticatedUser,updateStudentStatus)

router.route("/getAllInactiveStudent").get(getAllInactiveStudent)

router.route("/editStudent/:id").put(editStudent).delete(isAuthenticatedUser,deleteStudent)
router.route("/getUnpaid/:id").get(getUnpaidMonths)

module.exports = router;
