import { verifyJWT } from "@/auth/varifyJWT";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(){
   try{
     await connectDB()
     const user= verifyJWT()

     if(!user){
       let response =  NextResponse.json({
      success:false,
        message:"Unauthorized"
      },{status:401})

       return response

     }

    

     await User.findByIdAndUpdate(user._id,{
        $unset: {
        refreshToken: 1,
      },
     })
     
        const response = NextResponse.json({
       success: true,
        data: {},
        message: "User logged out successfully",
      },{status:200})

       // Clear access token cookie
    response.cookies.set("accessToken", "", {
      httpOnly: true,
      secure: true,
   
    });

    // Clear refresh token cookie
    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure:true,

    });

    return response

   }catch(error){
    return NextResponse.json({
      success:false,
      message:"Logout Error".error
    },{status:500})
   }
}