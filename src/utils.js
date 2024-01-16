import mongoose from "mongoose";

export function setupMongoose(mongoUrl) {
  mongoose
    .connect(mongoUrl)
    .then(() => {
      console.log("Connected to database");
    })
    .catch((err) => {
      console.log(err);
    });
}
