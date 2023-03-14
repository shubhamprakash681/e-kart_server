import mongoose from "mongoose";

const connectToDatabase = () => {
  mongoose.set("strictQuery", false);

  mongoose
    .connect(process.env.DB_URI, {
      useNewUrlParser: "true",
      useUnifiedTopology: "true",
      // useCreateIndex: "true"
    })
    .then((data) => {
      console.log(
        `MongoDb database connnection successful with cluster: ${data.connection.host}`
      );
    });
  // making it unhandled here
  // .catch((err) => {
  //   console.log(err);
  // });
};

export default connectToDatabase;
