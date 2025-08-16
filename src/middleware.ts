import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const secret = process.env.NEXTAUTH_SECRET;

const PROTECTED_ROUTES = [
  "/lists",
];

const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/reset-password",
];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret });

  const url = req.nextUrl.clone();

  if (PROTECTED_ROUTES.some(route => url.pathname.startsWith(route))) {
    if (!token) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  if (AUTH_ROUTES.some(route => url.pathname.startsWith(route))) {
    if (token) {
      url.pathname = "/lists";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}