import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();

    // 1. Tìm user theo email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return NextResponse.json({ error: "Sai email hoặc mật khẩu!" }, { status: 401 });
    }

    // 2. So sánh password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return NextResponse.json({ error: "Sai email hoặc mật khẩu!" }, { status: 401 });
    }

    // 3. Tạo token (JWT)
    const payload = {
        id: user.id,
        email: user.email,
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "7d" });

    // 4. Trả về user info + token (bạn có thể loại bỏ password)
    return NextResponse.json({
        user: { id: user.id, email: user.email, name: payload.name },
        token,
    });
}
