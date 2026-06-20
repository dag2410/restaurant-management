import guestApiRequest from "@/apiRequests/guest";
import { HttpError } from "@/lib/http";
import { GuestLoginBodyType } from "@/schemaValidations/guest.schema";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const body = (await request.json()) as GuestLoginBodyType;
  const cookiesStore = await cookies();

  try {
    const { payload } = await guestApiRequest.sLogin(body);

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
      expires: new Date(decodeAccessToken.exp * 1000),
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
