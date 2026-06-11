"use client";

import { getRefreshTokenFromLocalStorage } from "@/lib/utils";
import { useLogoutMutation } from "@/queries/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef } from "react";

export default function LogoutPage() {
  const { mutateAsync } = useLogoutMutation();
  const router = useRouter();
  const ref = useRef<any>(null);
  const searchParams = useSearchParams();
  const refreshTokenFromUrl = searchParams.get("refreshToken");

  useEffect(() => {
    if (
      ref.current ||
      refreshTokenFromUrl !== getRefreshTokenFromLocalStorage()
    ) {
      return;
    }
    ref.current = mutateAsync;
    mutateAsync().then((res) => {
      router.push("/login");
      setTimeout(() => {
        ref.current = null;
      }, 1000);
    });
  }, [mutateAsync, router, refreshTokenFromUrl]);
  return <div>Logout...</div>;
}
