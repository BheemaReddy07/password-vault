import dbConnect from "@/lib/mongodb";
import Vault from "@/models/Vault";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function PUT(req: Request) {
    try {
        await dbConnect();

        const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const userId = decoded.userId;

        const { id, data, iv } = await req.json();
        if (!id || !data || !iv) {
            return NextResponse.json({ message: "Missing fields" }, { status: 400 });
        }

        const entry = await Vault.findOneAndUpdate(
            { _id: id, userId },
            { data, iv, updatedAt: new Date() },
            { new: true }
        );

        if (!entry) return NextResponse.json({ message: "Vault item not found" }, { status: 404 });

        return NextResponse.json({ message: "Updated successfully", entry });
    } catch (error) {
        console.error("Update vault error:", error);
        return NextResponse.json({ error: "Failed to update vault item" }, { status: 500 });
    }
}
