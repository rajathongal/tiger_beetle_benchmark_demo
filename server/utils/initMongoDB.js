import mongoose from "mongoose";

export default async () => {
  const connection = await mongoose.connect(process.env.MONGODB_URI, {
    dbName: "tigerBeetle"
  });

  return connection.connection.db;
};
 