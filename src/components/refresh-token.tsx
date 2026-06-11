"use client";

import {
  getAccessTokenFromLocalStorage,
  getRefreshTokenFromLocalStorage,
  setAccessTokenToLocalStorage,
  setRefreshTokenToLocalStorage,
} from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import jwt from "jsonwebtoken";
import authApiRequest from "@/apiRequests/auth";
// Những page sau sẽ không check refresh token
const UNAUTHENTICATED_PATH = ["/login", "/register", "refresh-token"];

export default function RefreshToken() {
  const pathname = usePathname();
  useEffect(() => {
    if (UNAUTHENTICATED_PATH.includes(pathname)) return;
    let interval: any = null;
    const checkAndRefreshToken = async () => {
      const accessToken = getAccessTokenFromLocalStorage();
      const refreshToken = getRefreshTokenFromLocalStorage();
      if (!accessToken || !refreshToken) return null;
      const decodeAccessToken = jwt.decode(accessToken) as {
        exp: number;
        iat: number;
      };
      const decodeRefreshToken = jwt.decode(refreshToken) as {
        exp: number;
        iat: number;
      };

      const now = Math.round(new Date().getTime() / 1000);
      //  trường hợp refresh token hết hạn thì không xử lí nữa
      if (decodeRefreshToken.exp <= now) return;
      //   Ví dụ accessToken có thời gian hết hạn là 10s thì sẽ kiểm tra 1/3 thời gian
      //   Thời gian hết hạn của access dựa trên công thức: exp-iat
      if (
        decodeAccessToken.exp - now <
        decodeAccessToken.exp - decodeAccessToken.iat / 3
      ) {
        try {
          const res = await authApiRequest.refreshToken();
          setAccessTokenToLocalStorage(res.payload.data.accessToken);
          setRefreshTokenToLocalStorage(res.payload.data.refreshToken);
        } catch (error) {
          clearInterval(interval);
        }
      }
    };
    // timeout phải bé hơn thời gian hết hạn của access
    // ví dụ access hết hạn sau 10s thì interval cho 1s
    checkAndRefreshToken();
    interval = setInterval(checkAndRefreshToken, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [pathname]);

  return null;
}
