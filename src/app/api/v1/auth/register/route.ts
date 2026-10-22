import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, signJwtToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, email, phone, password, role = "CUSTOMER", storeName, gstin, pan } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const assignedRole = role === "SELLER" ? "SELLER" : "CUSTOMER";

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: phone?.trim() || null,
        passwordHash: hashedPassword,
        role: assignedRole,
        status: assignedRole === "SELLER" ? "PENDING_VERIFICATION" : "ACTIVE",
        isEmailVerified: true,
      },
    });

    let seller = null;
    if (assignedRole === "SELLER") {
      const slug = (storeName || `${name}'s Store`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      seller = await prisma.seller.create({
        data: {
          userId: user.id,
          storeName: storeName || `${name}'s Store`,
          storeSlug: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
          gstin: gstin || null,
          pan: pan || null,
          status: "PENDING", // Needs admin approval
          commissionRate: 10.0,
        },
      });
    }

    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      sellerId: seller?.id,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        sellerId: seller?.id,
        sellerStatus: seller?.status,
      },
      token,
    });

    response.cookies.set("mojicart_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
