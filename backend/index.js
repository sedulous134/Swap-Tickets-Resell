import dotenv from "dotenv"
import app from "./app.js"
import connectDb from "./db/index.js"
// import Razorpay from "razorpay"
// import bodyParser from "body-parser"

dotenv.config({path: './env'})

connectDb()
.then(()=>{
  app.listen(process.env.PORT || 8001 , ()=>{
    console.log(`server is listening at port ${process.env.PORT}`)
  })
  app.on("error",()=>{
    console.log("server crashed ",error);
  })
})
.catch((error)=>{
  console.log("MongoDb connection failed", error)
})