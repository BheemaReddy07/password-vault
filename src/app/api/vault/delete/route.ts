import dbConnect from "@/lib/mongodb";
import Vault from "@/models/Vault";
import { NextResponse } from "next/server";

export async function DELETE(req:Request){
    try {
        await dbConnect();
        const {id} = await req.json();
        if(!id){
            return NextResponse.json({message:"Id is required"},{status:400});
        }
        await Vault.findByIdAndDelete(id);
        return NextResponse.json({message:"Vault item deleted successfully"},{status:200});

    } catch (error) {
        return NextResponse.json({ error: "Failed to delete vault item" }, { status: 500 });
    }
}