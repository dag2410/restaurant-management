import authApiRequest from "@/apiRequests/auth";
import { LoginBodyType } from "@/schemaValidations/auth.schema";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookiesStore = await cookies();
  const accessToken = cookiesStore.get("accessToken")?.value;
  const refreshToken = cookiesStore.get("refreshToken")?.value;
  cookiesStore.delete("accessToken");
  cookiesStore.delete("refreshToken");

  if (!accessToken || !refreshToken) {
    return Response.json(
      {
        message: "Không tìm thấy access token hoặc refresh token",
      },
      {
        status: 200,
      },
    );
  }
  try {
    const result = await authApiRequest.sLogout({
      accessToken,
      refreshToken,
    });

    return Response.json(result.payload);
  } catch (error) {
    return Response.json(
      {
        message: "Lỗi khi gọi API logout server Backend",
      },
      {
        status: 200,
      },
    );
  }
}
