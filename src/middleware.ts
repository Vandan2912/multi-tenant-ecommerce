import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const hostname = req.headers.get("host") ?? "";

  // Strip www — store1.vandanpatel.in and www.store1.vandanpatel.in both resolve to same tenant
  const domain = hostname.replace(/^www\./, "");

  const res = NextResponse.next();
  res.headers.set("x-tenant-domain", domain);
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};