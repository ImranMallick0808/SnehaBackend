// const express = require("express");
// const errorHandler = require("./middleware/error");
// const cookieParser = require("cookie-parser");
// const cors = require("cors");
// const app = express();

// const path = require("path");//this

// const allowedOrigins = [
//   "http://localhost:5173", // For development
//   "https://snehaacademy.org", // Production
//     "https://www.snehaacademy.org",
// ];
//   // Configure CORS
// const corsOptions = {
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true); // Allow the origin
//     }else {
//       console.error(`Blocked by CORS: ${origin}`);
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
//   allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
//   credentials: true, // Allow credentials (cookies, authorization headers)
// };

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.use(cors(corsOptions));


// app.options("*", cors(corsOptions));






// //routes import
// const provateRoutes = require("./routes/privateRoutes");
// const publicRoutes = require("./routes/publicRoutes");

// app.use("/api/v1", provateRoutes);
// app.use("/api/v1", publicRoutes);

// if (process.env.NODE_ENV === "production") {
//   const frontendPath = path.join(__dirname, "../frontend/build");
//   app.use(express.static(frontendPath));

//   // Handle React routing, return all requests to React app
//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
//   //  res.sendFile(path.join(frontendPath, "index.html"));
//   });
// }


// //middleware for error
// app.use(errorHandler);
// module.exports = app;
const express = require("express");
const errorHandler = require("./middleware/error");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDataBase = require("./config/database");
const cloudinary = require("cloudinary").v2;
const resetPayment = require("./middleware/updatePayments");
const path = require("path");

// Load environment variables
dotenv.config({ path: "backend/config/config.env" });

// Initialize Express App
const app = express();

// Allowed Origins for CORS
const allowedOrigins = [
  "http://localhost:5173", // Development
  "https://snehaacademy.org", // Production
  "https://www.snehaacademy.org",
];

// Configure CORS
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the origin
    } else {
      console.error(`Blocked by CORS: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Connect to Database
connectDataBase();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Import Routes
const privateRoutes = require("./routes/privateRoutes");
const publicRoutes = require("./routes/publicRoutes");

app.use("/api/v1", privateRoutes);
app.use("/api/v1", publicRoutes);

// Serve Frontend in Production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/build");
  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
  });
}

// Middleware for Error Handling
app.use(errorHandler);

// Start the Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Auto Update Payments
resetPayment();

// Handle Uncaught Exceptions
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting Down the Server due to Uncaught Exception");
  process.exit(1);
});

// Handle Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to Unhandled Promise Rejection");
  server.close(() => {
    process.exit(1);
  });
});

