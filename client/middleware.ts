import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getPrimaryRole, type UserRole } from "@/lib/auth/roles";
import { isRoleAllowedForPath } from "@/lib/auth/permissions";
import { decodeJwtPayload, getRolesFromJwtPayload } from "@/lib/auth/jwt";

const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/invite/accept",
  "/privacy",
  "/terms",
]);

function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith("/iasp-assessment") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api")
  );
}

function getAuthToken(request: NextRequest): string | null {
  const cookies = request.cookies.getAll();
  const tokenCookie = cookies.find(
    (cookie) =>
      cookie.name.includes("CognitoIdentityServiceProvider") &&
      cookie.name.endsWith(".idToken") &&
      cookie.value.length > 0,
  );
  return tokenCookie?.value ?? null;
}

function resolveRoleFromRequest(request: NextRequest): UserRole {
  const devRole = process.env.NEXT_PUBLIC_DEV_USER_ROLE;
  if (
    devRole === "patient" ||
    devRole === "caregiver" ||
    devRole === "nurse" ||
    devRole === "doctor" ||
    devRole === "coordinator" ||
    devRole === "admin"
  ) {
    return devRole;
  }

  const token = getAuthToken(request);
  if (!token) return "patient";

  const roles = getRolesFromJwtPayload(decodeJwtPayload(token));
  return getPrimaryRole(roles) ?? "patient";
}

const COORDINATOR_PATH_REDIRECTS: Record<string, string> = {
  "/coordinator": "/dashboard",
  "/coordinator/home": "/dashboard",
  "/coordinator/leads": "/leads",
  "/coordinator/patients": "/patients",
  "/coordinator/schedule": "/schedule",
  "/coordinator/tasks": "/care/tasks",
  "/coordinator/staff": "/staff",
  "/coordinator/alerts": "/alerts",
  "/coordinator/settings": "/settings",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const redirectPath = COORDINATOR_PATH_REDIRECTS[pathname];
  if (redirectPath) {
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if (pathname.startsWith("/coordinator/patients/")) {
    const patientId = pathname.slice("/coordinator/patients/".length);
    return NextResponse.redirect(new URL(`/patients/${patientId}`, request.url));
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = getAuthToken(request);
  const devRole = process.env.NEXT_PUBLIC_DEV_USER_ROLE;

  // Require auth unless dev role override is active (UI testing)
  if (!token && !devRole) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = resolveRoleFromRequest(request);
  if (!isRoleAllowedForPath(role, pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|fonts|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|otf|woff2?)).*)",
  ],
};
