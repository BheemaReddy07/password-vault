import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) return NextResponse.json({ user: null }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.json({
      user: { _id: decoded.userId, email: decoded.email },
    });
  } catch (err) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
