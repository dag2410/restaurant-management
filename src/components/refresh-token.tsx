"use client";

import { checkAndRefreshToken } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
// Những page sau sẽ không check refresh token
const UNAUTHENTICATED_PATH = ["/login", "/register", "refresh-token"];

export default function RefreshToken() {
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (UNAUTHENTICATED_PATH.includes(pathname)) return;
    let interval: any = null;

    // timeout phải bé hơn thời gian hết hạn của access
    // ví dụ access hết hạn sau 10s thì interval cho 1s
    checkAndRefreshToken({
      onError: () => {
        clearInterval(interval);
        router.push("/login");
      },
    });
    interval = setInterval(
      () =>
        checkAndRefreshToken({
          onError: () => {
            clearInterval(interval);
            router.push("/login");
          },
        }),
      1000,
    );

    return () => {
      clearInterval(interval);
    };
  }, [pathname, router]);

  return null;
}
