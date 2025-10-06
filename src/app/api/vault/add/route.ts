import dbConnect from "@/lib/mongodb";
import Vault from "@/models/Vault";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
    try {
        await dbConnect();

        const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const userId = decoded.userId;

        const { data, iv } = await req.json();
        if (!data || !iv) {
            return NextResponse.json({ message: "Missing data or iv" }, { status: 400 });
        }

        const entry = await Vault.create({ userId, data, iv });
        return NextResponse.json({ message: "Data added successfully", entry }, { status: 201 });
    } catch (error) {
        console.error("Add vault error:", error);
        return NextResponse.json({ error: "Failed to add vault item" }, { status: 500 });
    }
}
