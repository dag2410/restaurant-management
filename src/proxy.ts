import { Role } from "@/constants/type";
import { decodeToken } from "@/lib/utils";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const managePaths = ["/manage"];
const guestPaths = ["/guest"];
const privatePaths = [...managePaths, ...guestPaths];
const unAuthPaths = ["/login"];
// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // 1. Chưa đăng nhập thì không cho vào private paths
  if (privatePaths.some((path) => pathname.startsWith(path)) && !refreshToken) {
    const url = new URL("/login", request.url);
    url.searchParams.set("clearTokens", "true");
    return NextResponse.redirect(url);
  }

  // 2. Trường hợp đã đăng nhập
  if (refreshToken) {
    // 2.1 Đăng nhập rồi thì sẽ không cho vào login nữa
    if (unAuthPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // 2.2 Trường hợp đăng nhập rồi nhưng mà accessToken lại hết hạn
    if (
      privatePaths.some((path) => pathname.startsWith(path)) &&
      !accessToken
    ) {
      const url = new URL("/refresh-token", request.url);
      url.searchParams.set("refreshToken", refreshToken);
      url.searchParams.set("redirect", pathname);

      return NextResponse.redirect(url);
    }

    // 2.3 Vào không đúng route thì redirect về trang chủ
    // Guest nhưng cố vào route owner
    // Không phải là guest nhưng cố vào route của owner
    const role = decodeToken(refreshToken)?.role;
    if (
      (role === Role.Guest &&
        managePaths.some((path) => pathname.startsWith(path))) ||
      (role !== Role.Guest &&
        guestPaths.some((path) => pathname.startsWith(path)))
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  console.log("Middleware running for path:", pathname);

  return NextResponse.next();
}

export const config = {
  matcher: ["/orders", "/manage/:path*", "/login", "/guest/:path*"],
};
