import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import prisma from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "mojicart_super_secret_jwt_key_2026";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
  sellerId?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signJwtToken(payload: TokenPayload, expiresIn: string = "7d"): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyJwtToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getSessionUser(req?: Request) {
  let token: string | undefined;

  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("mojicart_token")?.value;
    } catch {
      // In certain contexts cookies() might not be available
    }
  }

  if (!token) return null;

  const decoded = verifyJwtToken(token);
  if (!decoded || !decoded.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    include: {
      sellerProfile: true,
      addresses: true,
    },
  });

  if (!user || user.status === "SUSPENDED") return null;

  return user;
}

export const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "OPERATIONS_ADMIN",
  "CATALOG_MANAGER",
  "ORDER_MANAGER",
  "SUPPORT_STAFF",
  "FINANCE_MANAGER",
];

export function isAdmin(role: string): boolean {
  return ADMIN_ROLES.includes(role);
}

export function isSeller(role: string): boolean {
  return role === "SELLER" || role === "SUPER_ADMIN";
}
