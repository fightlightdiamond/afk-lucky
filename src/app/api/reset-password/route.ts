import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, email, password } = await req.json();

    // 1. Validate input
    if (!token || !email || !password) {
      return NextResponse.json(
        { error: "Token, email và mật khẩu là bắt buộc!" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự!" },
        { status: 400 }
      );
    }

    // 2. Find reset token
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        email,
        token,
      },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: "Token không hợp lệ hoặc đã hết hạn!" },
        { status: 400 }
      );
    }

    // 3. Check if token is expired (1 hour)
    const tokenAge = Date.now() - resetRecord.created_at!.getTime();
    if (tokenAge > 3600000) {
      // 1 hour in milliseconds
      // Delete expired token
      await prisma.passwordReset.delete({
        where: {
          email_token: {
            email,
            token,
          },
        },
      });

      return NextResponse.json(
        { error: "Token đã hết hạn. Vui lòng yêu cầu reset mật khẩu mới!" },
        { status: 400 }
      );
    }

    // 4. Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Người dùng không tồn tại!" },
        { status: 404 }
      );
    }

    // 5. Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 6. Update user password
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        updated_at: new Date(),
      },
    });

    // 7. Delete used reset token
    await prisma.passwordReset.delete({
      where: {
        email_token: {
          email,
          token,
        },
      },
    });

    return NextResponse.json({
      message: "Mật khẩu đã được cập nhật thành công!",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi. Vui lòng thử lại!" },
      { status: 500 }
    );
  }
}
