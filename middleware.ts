import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Already onboarded, trying to revisit onboarding → send home
    if (token?.onboardingComplete && pathname === "/onboarding") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Not yet onboarded → force to onboarding (except if already there)
    if (token && !token.onboardingComplete && pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // If false, withAuth redirects to the signIn page (pages.signIn = "/login")
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    // Protect all routes except login, NextAuth internals, and static assets
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
