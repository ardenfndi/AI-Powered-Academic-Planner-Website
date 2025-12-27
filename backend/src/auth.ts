import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type AuthedRequest = Request & { userId?: string; role?: string };

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const COOKIE_NAME = "planner_token";
const ONE_WEEK_MS = 1000 * 60 * 60 * 24 * 7;

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: ONE_WEEK_MS,
};

export function issueAuthToken(res: Response, userId: string, role: string = "user") {
  const token = jwt.sign({ sub: userId, role }, JWT_SECRET, { expiresIn: "7d" });
  res.cookie(COOKIE_NAME, token, cookieOptions);
  return token;
}

export function clearAuthToken(res: Response) {
  res.clearCookie(COOKIE_NAME, cookieOptions);
}

function extractToken(req: Request) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice("Bearer ".length);
  if (req.cookies && req.cookies[COOKIE_NAME]) return req.cookies[COOKIE_NAME] as string;
  return null;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub?: string; role?: string };
    if (!payload?.sub) throw new Error("Invalid token");
    req.userId = payload.sub;
    req.role = payload.role;
    next();
  } catch (err) {
    clearAuthToken(res);
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (req.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  next();
}

export function getUserIdFromRequest(req: AuthedRequest): string | null {
  const token = extractToken(req);
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub?: string };
    return payload?.sub ?? null;
  } catch {
    return null;
  }
}
