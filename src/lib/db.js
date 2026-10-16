import mongoose from "mongoose"
import dns from "node:dns";


dns.setServers(["8.8.8.8", "1.1.1.1"]);

const MONGODB_URI = process.env.MONGODB_URI
const DB_NAME = process.env.DB_NAME;

if(!MONGODB_URI){
   throw new Error("PLease add the Database Connection URL  !!")
}

const connectDB = async()=>{
   try{
     const connectionInstance = await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`)
      console.log(`MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`)    
     
   }catch(error){
        console.error("Error in connecting to MongoDB:", error.message);
        process.exit(1);
   }
  }
export default connectDB