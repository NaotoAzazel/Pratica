import mongoose from "mongoose";
import fs from "fs";

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

export const getJSONData = (path) => JSON.parse(fs.readFileSync(path));