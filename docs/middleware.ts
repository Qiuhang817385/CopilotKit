import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle /_cn/* routes - rewrite to /(root)_cn/*
  if (pathname === "/_cn") {
    const url = request.nextUrl.clone();
    url.pathname = "/(root)_cn";
    return NextResponse.rewrite(url);
  }

  if (pathname.startsWith("/_cn/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace("/_cn/", "/(root)_cn/");
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match /_cn and /_cn/*
    "/_cn",
    "/_cn/:path*",
  ],
};
