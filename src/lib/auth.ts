import { NextAuthOptions, DefaultSession, getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

// Extend NextAuth types
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: {
        id: string;
        name: UserRole;
        permissions: string[];
      };
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: {
      id: string;
      name: UserRole;
      permissions: string[];
    };
  }
}


export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter email and password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            role: true,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: `${user.first_name} ${user.last_name}`.trim() || user.email,
          role: {
            id: user.role?.id || "",
            name: (user.role?.name as UserRole) || UserRole.USER,
            permissions: user.role?.permissions || [],
          },
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("🔑 JWT Callback:", {
        hasUser: !!user,
        tokenId: token.id,
        userRole: user?.role,
      });

      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name || user.email;

        console.log("✅ JWT Token updated:", {
          id: token.id,
          email: token.email,
          role: token.role,
        });
      }
      return token;
    },
    async session({ session, token }) {
      console.log("🎫 Session Callback:", {
        hasToken: !!token,
        tokenRole: token.role,
        sessionUserId: session.user?.id,
      });

      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as {
          id: string;
          name: UserRole;
          permissions: string[];
        };

        console.log("✅ Session updated:", {
          userId: session.user.id,
          userRole: session.user.role,
        });
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export const getAuthSession = () => getServerSession(authOptions);
