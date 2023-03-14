import app from "./app.js";
import dotenv from "dotenv";
import connectToDatabase from "./config/database/dbConnecion.js";
import cloudinary from "cloudinary";

// handling Uncaught Exceptions
// eg.: try {console.log(sd);} without handling Uncaught Exceptions
process.on("uncaughtException", (errr) => {
  console.log(`Error: ${errr.message}`);
  console.log(`Shutting down the server due to Uncaught Exceptions`);

  process.exit(1);
});
// console.log(sd)

// config
dotenv.config({ path: "./config/config.env" });

const port = process.env.PORT;

// db connection
connectToDatabase();

// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// cloudinary.v2.api.create_upload_preset({
//   name: ,
//   tag: ,
//   folder: ,
// })

const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// handling unhandled promise rejection
// example:- try giving wrong DB_URI
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Unhandled Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});
