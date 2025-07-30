import mongoose from "mongoose"

const DB_NAME = "TICKETR"

const connectDb= async ()=>{
  try {
    const connectInstance = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
    console.log(`mongodb connected || db connection successfull ${connectInstance.connection.host}`)
  } catch (error) {
      console.log("database connection failed",error)
      process.exit(1)
  }
}

export default connectDb