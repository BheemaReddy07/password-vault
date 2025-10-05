import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Vault from "@/models/Vault";

export async function POST(req : Request){
    try {
        await dbConnect();
        const {userId , data, iv} = await req.json();
        if(!userId || !data || !iv){
            return NextResponse.json({message:"Please provide all the fields"},{status:400});
        }
        const entry = await Vault.create({userId,data,iv});
        return NextResponse.json({message:"Data added successfully",entry},{status:201});
    } catch (error) {
        return NextResponse.json({ error: "Failed to add vault item" }, { status: 500 });
    }
}