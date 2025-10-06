import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Vault from "@/models/Vault";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
    try {
        await dbConnect();

        const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
        if (!token) return NextResponse.json({ items: [] }, { status: 401 });

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const userId = decoded.userId;

        const items = await Vault.find({ userId }).sort({ createdAt: -1 });
        return NextResponse.json({ items });
    } catch (err) {
        console.error("Vault fetch error:", err);
        return NextResponse.json({ items: [] }, { status: 500 });
    }
}
