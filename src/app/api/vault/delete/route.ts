import dbConnect from "@/lib/mongodb";
import Vault from "@/models/Vault";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function DELETE(req: Request) {
    try {
        await dbConnect();

        const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const userId = decoded.userId;

        const { id } = await req.json();
        if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });

        const entry = await Vault.findOneAndDelete({ _id: id, userId });
        if (!entry) return NextResponse.json({ message: "Vault item not found" }, { status: 404 });

        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error) {
        console.error("Delete vault error:", error);
        return NextResponse.json({ error: "Failed to delete vault item" }, { status: 500 });
    }
}
