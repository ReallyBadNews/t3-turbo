import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { nextUrl: url, geo } = req;
  const country = geo?.country || "US";

  url.searchParams.set("country", country);

  return NextResponse.rewrite(url);
}
