import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req:Request){
    try {
        await dbConnect();
        const {email,password} = await req.json();
        if(!email || !password){
            return NextResponse.json({message:"Please provide all the fields"},{status:400});
        }  
        const existingUser = await User.findOne({email});
        if(existingUser){
            return NextResponse.json({message:"User already exists"},{status:400});
        }
        const hashedPassword  = await bcrypt.hash(password,10);
        const newUser  = new User({email,password:hashedPassword});
        await newUser.save();
        return NextResponse.json({message:"User created successfully",userId : newUser._id},{status:201});
    } catch (error) {
        return NextResponse.json({message:"Internal Server Error"},{status:500});   
    }
}    