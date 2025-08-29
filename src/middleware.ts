import {getToken, JWT} from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const secret = process.env.NEXTAUTH_SECRET;

const PUBLIC_APP_ROUTES = ["/sign-in", "/sign-up", "/reset-password",];
const PROTECTED_APP_ROUTES = ["/lists",];
const PUBLIC_API_ROUTES = ["/api/auth",];
const PROTECTED_API_ROUTES = ["/api/lists",];

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const token = await getToken({ req, secret });

  const appResponse = handleAppRoutes(url, token);
  if (appResponse) {
    return appResponse;
  }

  const apiResponse = handleApiRoutes(url, token);
  if (apiResponse) {
    return apiResponse;
  }

  return NextResponse.next();
}

const handleAppRoutes = (url: NextRequest["nextUrl"], token: JWT | null) : NextResponse | undefined => {
  if (PROTECTED_APP_ROUTES.some(route => url.pathname.startsWith(route))) {
    if (!token) {
      url.pathname = "/sign-in";
      return NextResponse.redirect(url);
    }
  }

  if (PUBLIC_APP_ROUTES.some(route => url.pathname.startsWith(route))) {
    if (token) {
      url.pathname = "/lists";
      return NextResponse.redirect(url);
    }
  }
}

const handleApiRoutes = (url: NextRequest["nextUrl"], token: JWT | null) => {
  if (PROTECTED_API_ROUTES.some(route => url.pathname.startsWith(route))) {
    if (!token) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401 });
    }
  }

  if (PUBLIC_API_ROUTES.some(route => url.pathname.startsWith(route))) {
    // Do nothing, public API routes are accessible without token
  }
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};