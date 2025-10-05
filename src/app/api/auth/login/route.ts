import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req:Request){
    try {
        await dbConnect();
        const {email,password} = await req.json();
        if(!email || !password){
            return NextResponse.json({message:"Missing email or password"},{status:400});
        }
        const user = await User.findOne({email});
        if(!user){
            return NextResponse.json({message:"Invalid credentials"},{status:400});
        }
        const ismatch = await bcrypt.compare(password,user.password);
        if(!ismatch){
            return NextResponse.json({message:"Invalid credentials"},{status:400});
        }
        return NextResponse.json({message:"Login successful",userId:user._id},{status:200});
    } catch (error) {
        return NextResponse.json({message:"Internal Server Error"},{status:500});
    }
}