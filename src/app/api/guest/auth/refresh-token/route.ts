import authApiRequest from "@/apiRequests/auth";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { HttpError } from "@/lib/http";
import guestApiRequest from "@/apiRequests/guest";

export async function POST(request: Request) {
  const cookiesStore = await cookies();
  const refreshToken = cookiesStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return Response.json(
      {
        message: "Không tìm thấy refresh token",
      },
      {
        status: 401,
      },
    );
  }
  try {
    const { payload } = await guestApiRequest.SRefreshToken({
      refreshToken,
    });

    const tokenData = payload.data;
    const decodeAccessToken = jwt.decode(tokenData.accessToken) as {
      exp: number;
    };
    const decodeRefreshToken = jwt.decode(tokenData.refreshToken) as {
      exp: number;
    };
    cookiesStore.set("accessToken", tokenData.accessToken, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      expires: new Date(decodeAccessToken.exp * 1000),
    });
    cookiesStore.set("refreshToken", tokenData.refreshToken, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      expires: new Date(decodeRefreshToken.exp * 1000),
    });

    return Response.json(payload);
  } catch (error: any) {
    if (error instanceof HttpError) {
      return Response.json(error.payload, {
        status: error.status,
      });
    } else {
      return Response.json(
        {
          message: error.message ?? "Đã xảy ra lỗi không xác định",
        },
        {
          status: 401,
        },
      );
    }
  }
}
