import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Vault from "@/models/Vault";
import User from "@/models/User";
export async function POST(req : Request){
    try {
       await dbConnect();
         const {userId} = await req.json();
            if(!userId){    
                return NextResponse.json({message:"UserId is required"},{status:400});
            }   
            const items = await Vault.find({userId});
            return NextResponse.json({items},{status:200});

    } catch (error) {
        console.error("List vault error:", error);
        return NextResponse.json({ error: "Failed to fetch vault items" }, { status: 500 });
    }
}