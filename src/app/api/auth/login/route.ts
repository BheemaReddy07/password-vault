import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
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
        const token = jwt.sign( { userId: user._id, email: user.email },process.env.JWT_SECRET!,{expiresIn:'7d'});
            const response = NextResponse.json({ success: true });
            response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
    });

    return response;
    } catch (error) {
        return NextResponse.json({message:"Internal Server Error"},{status:500});
    }
}