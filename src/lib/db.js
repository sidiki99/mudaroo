// import mongoose from "mongoose"
// import dns from "node:dns";


// dns.setServers(["8.8.8.8", "1.1.1.1"]);

// const MONGODB_URI = process.env.MONGODB_URI
// const DB_NAME = process.env.DB_NAME;

// if(!MONGODB_URI){
//    throw new Error("PLease add the Database Connection URL  !!")
// }

// const connectDB = async()=>{
//    try{
//      const connectionInstance = await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`)
//       console.log(`MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`)    
     
//    }catch(error){
//         console.error("Error in connecting to MongoDB:", error.message);
//         process.exit(1);
//    }
//   }
// export default connectDB



import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "mudaroo";

if (!MONGODB_URI) {
  throw new Error("Please add MONGODB_URI to your .env.local file");
}

// Reuse the connection cache across API requests and Next.js hot reloads.
const cached =
  globalThis.mongooseCache ||
  (globalThis.mongooseCache = {
    conn: null,
    promise: null,
  });

const connectDB = async () => {
  // 1. Reuse an already established connection.
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // 2. If a connection is already being established, reuse its promise.
  if (!cached.promise) {
    const baseUri = MONGODB_URI.replace(/\/+$/, "");
    const mongoUri = `${baseUri}/${DB_NAME}`;

    cached.promise = mongoose
      .connect(mongoUri)
      .then((mongooseInstance) => {
        console.log(
          `MongoDB connected !! DB HOST: ${mongooseInstance.connection.host}`
        );

        return mongooseInstance;
      })
      .catch((error) => {
        // Allow a future request to retry after a connection failure.
        cached.promise = null;
        throw error;
      });
  }

  // 3. Wait for the existing or newly started connection.
  cached.conn = await cached.promise;

  return cached.conn;
};

export default connectDB;
