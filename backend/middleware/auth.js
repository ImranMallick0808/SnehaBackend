const catchAsyncError = require("./catchAsyncError");
const errorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new errorHandler("Please login to access this resources", 401));
  }
  const decodeData = jwt.verify(token, process.env.JWT_SECRET);
  req.admin = await Admin.findById(decodeData.id);
  next();
});
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return next(
        new errorHandler(
          `Role: ${req.admin.role} is not allowed to access this resource`,
          403
        )
      );
    }

    next();
  };
};


