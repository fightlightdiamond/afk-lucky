import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // 1. Validate email
    if (!email) {
      return NextResponse.json(
        { error: "Email là bắt buộc!" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email không hợp lệ!" },
        { status: 400 }
      );
    }

    // 2. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        message: "Nếu email tồn tại, chúng tôi đã gửi link reset mật khẩu.",
      });
    }

    // 3. Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 4. Save reset token to database
    await prisma.passwordReset.upsert({
      where: { email },
      update: {
        token: resetToken,
        created_at: new Date(),
      },
      create: {
        email,
        token: resetToken,
        created_at: new Date(),
      },
    });

    // 5. In a real app, you would send email here
    // For demo purposes, we'll just log the reset link
    const resetLink = `${
      process.env.NEXTAUTH_URL || "http://localhost:3001"
    }/reset-password?token=${resetToken}&email=${email}`;

    console.log("🔗 Reset Password Link:", resetLink);
    console.log("📧 Email:", email);
    console.log("🔑 Token:", resetToken);

    // 6. Return success message
    return NextResponse.json({
      message: "Nếu email tồn tại, chúng tôi đã gửi link reset mật khẩu.",
      // For demo only - remove in production
      resetLink: process.env.NODE_ENV === "development" ? resetLink : undefined,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi. Vui lòng thử lại!" },
      { status: 500 }
    );
  }
}
