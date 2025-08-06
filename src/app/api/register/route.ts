import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password, phoneNumber } =
      await req.json();

    // 1. Validate required fields
    if (!firstName || !email || !password) {
      return NextResponse.json(
        { error: "Tên, email và mật khẩu là bắt buộc!" },
        { status: 400 }
      );
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email không hợp lệ!" },
        { status: 400 }
      );
    }

    // 3. Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự!" },
        { status: 400 }
      );
    }

    // 4. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email đã được sử dụng!" },
        { status: 409 }
      );
    }

    // 5. Check if phone number already exists (if provided)
    if (phoneNumber) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone_number: phoneNumber },
      });

      if (existingPhone) {
        return NextResponse.json(
          { error: "Số điện thoại đã được sử dụng!" },
          { status: 409 }
        );
      }
    }

    // 6. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 7. Create user
    const user = await prisma.user.create({
      data: {
        first_name: firstName,
        last_name: lastName || "",
        email,
        password: hashedPassword,
        phone_number: phoneNumber || null,
        sex: true, // default to true
        is_active: true,
        coin: BigInt(1000), // default coins
        locale: "vi",
        group_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // 8. Generate JWT token
    const payload = {
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`.trim(),
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "7d" });

    // 9. Return user info + token (exclude password)
    return NextResponse.json({
      user: {
        id: user.id.toString(),
        email: user.email,
        name: payload.name,
      },
      token,
      message: "Đăng ký thành công!",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại!" },
      { status: 500 }
    );
  }
}
