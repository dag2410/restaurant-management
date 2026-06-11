import { EntityError } from "@/lib/http";
import { clsx, type ClassValue } from "clsx";
import { UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import jwt from "jsonwebtoken";
import authApiRequest from "@/apiRequests/auth";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const normalizePath = (path: string) => {
  return path.startsWith("/") ? path.slice(1) : path;
};

export const handleErrorApi = ({
  error,
  setError,
  duration,
}: {
  error: any;
  setError?: UseFormSetError<any>;
  duration?: number;
}) => {
  if (error instanceof EntityError && setError) {
    error.payload.errors.forEach((item) => {
      setError(item.field, {
        type: "server",
        message: item.message,
      });
    });
  } else {
    toast.error(error.message || "Đã có lỗi xảy ra", {
      duration: duration || 3000,
    });
  }
};

const isBrowser = typeof window !== "undefined";

export const getAccessTokenFromLocalStorage = () => {
  return isBrowser ? localStorage.getItem("accessToken") : null;
};

export const getRefreshTokenFromLocalStorage = () => {
  return isBrowser ? localStorage.getItem("refreshToken") : null;
};

export const setAccessTokenToLocalStorage = (value: string) => {
  return isBrowser && localStorage.setItem("accessToken", value);
};

export const setRefreshTokenToLocalStorage = (value: string) => {
  return isBrowser && localStorage.setItem("refreshToken", value);
};

export const removeTokenToLocalStorage = () => {
  isBrowser && localStorage.removeItem("accessToken");
  isBrowser && localStorage.removeItem("refreshToken");
};

export const checkAndRefreshToken = async (param?: {
  onError?: () => void;
  onSuccess?: () => void;
}) => {
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
  if (decodeRefreshToken.exp <= now) {
    removeTokenToLocalStorage();
    return param?.onError && param?.onError();
  }
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
      param?.onSuccess && param?.onSuccess();
    } catch (error) {
      param?.onError && param?.onError();
    }
  }
};
