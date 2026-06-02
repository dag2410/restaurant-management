import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const privatePaths = ["/orders", "/manage"];
const unAuthPaths = ["/login"];
// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuth = Boolean(request.cookies.get("accessToken")?.value);

  if (privatePaths.some((path) => pathname.startsWith(path)) && !isAuth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (unAuthPaths.some((path) => pathname.startsWith(path)) && isAuth) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  console.log("Middleware running for path:", pathname);

  return NextResponse.next();
}

export const config = {
  matcher: ["/orders", "/manage/:path*", "/login"],
};
