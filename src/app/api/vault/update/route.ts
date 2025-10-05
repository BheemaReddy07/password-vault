import dbConnect from "@/lib/mongodb";
import Vault from "@/models/Vault";
import { NextResponse } from "next/server";

export async function PUT(req :Request){
    try {
        await dbConnect();
        const {id,data,iv} = await req.json();
        if(!id || !data || !iv){
            return NextResponse.json({message:"Please provide all the fields"},{status:400});
        }
        const updated = await Vault.findByIdAndUpdate(id,{data,iv},{new:true});
        if(!updated){
            return NextResponse.json({message:"Vault item not found"},{status:404});
        }
        return NextResponse.json({message:"Vault item updated successfully",updated},{status:200});
    } catch (error) {
        return NextResponse.json({ error: "Failed to update vault item" }, { status: 500 });
    }
}