// import { verifyJWT } from "@/auth/varifyJWT";
// import connectDB from "@/lib/db";
// import { NextResponse } from "next/server";

// export async function GET(){
//    try{
//      await connectDB()
//      const user= verifyJWT()

//      if(!user){
//        return NextResponse.json({
//       success:false,
//         message:"Unauthorized"
//       },{status:401})
//      }
     
//       return NextResponse.json({
//       success:true,
//         message:"User fetched successfully",
//         data:user
//       },{status:201})

//    }catch(error){
//     return NextResponse.json({
//       success:false,
//       message:"Error to fetch Current User".error
//     },{status:500})
//    }
// }


import { verifyJWT } from "@/auth/varifyJWT";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await verifyJWT();

    return NextResponse.json(
      {
        success: true,
        message: "User fetched successfully",
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Current user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch current user",
      },
      { status: error.status || 500 }
    );
  }
}
