import http from "@/lib/http";
import {
  LoginBodyType,
  LoginResType,
  LogoutBodyType,
  RefreshTokenBodyType,
  RefreshTokenResType,
} from "@/schemaValidations/auth.schema";

const authApiRequest = {
  sLogin: (body: LoginBodyType) => http.post<LoginResType>("/auth/login", body),
  login: (body: LoginBodyType) =>
    http.post<LoginResType>("/api/auth/login", body, {
      baseUrl: "",
    }),
  sLogout: (
    body: LogoutBodyType & {
      accessToken: string;
    },
  ) =>
    http.post(
      "/auth/logout",
      {
        refreshToken: body.refreshToken,
      },
      {
        headers: {
          Authorization: `Bearer ${body.accessToken}`,
        },
      },
    ),
  logout: () =>
    http.post("/api/auth/logout", null, {
      baseUrl: "",
      // client gọi đến route handler của nextjs nên không cần phải truyền accessToken trong header
      // vì nó đã được set trong cookie và sẽ tự động được gửi kèm theo request
    }),

  SRefreshToken: (body: RefreshTokenBodyType) =>
    http.post<RefreshTokenResType>("/auth/refresh-token", body),

  refreshToken: () => {
    http.post<RefreshTokenResType>("/api/auth/refresh-token", null, {
      baseUrl: "",
    });
  },
};

export default authApiRequest;
