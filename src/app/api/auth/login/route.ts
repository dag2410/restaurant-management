import authApiRequest from "@/apiRequests/auth";
import { LoginBodyType } from "@/schemaValidations/auth.schema";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { HttpError } from "@/lib/http";

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBodyType;
  const cookiesStore = await cookies();

  try {
    const { payload } = await authApiRequest.sLogin(body);  

    const { accessToken, refreshToken } = payload.data;

    const decodeAccessToken = jwt.decode(accessToken) as { exp: number };
    cookiesStore.set("accessToken", accessToken, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      expires: new Date(decodeAccessToken.exp * 1000),
    });
    cookiesStore.set("refreshToken", refreshToken, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      expires: decodeAccessToken.exp * 1000,
    });

    return Response.json(payload);
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json(error.payload, {
        status: error.status,
      });
    } else {
      return Response.json(
        {
          message: "Đã xảy ra lỗi không xác định",
        },
        {
          status: 500,
        },
      );
    }
  }
}
