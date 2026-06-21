"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GuestLoginBody,
  GuestLoginBodyType,
} from "@/schemaValidations/guest.schema";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useGuestLoginMutation } from "@/queries/useGuest";
import { useAppContext } from "@/components/app-provider";
import { handleErrorApi } from "@/lib/utils";

export default function GuestLoginForm() {
  const { setRole } = useAppContext();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const tableNumber = Number(params.number);
  const token = searchParams.get("token");
  const loginMutation = useGuestLoginMutation();

  const form = useForm<GuestLoginBodyType>({
    resolver: zodResolver(GuestLoginBody),
    defaultValues: {
      name: "",
      token: token ?? "",
      tableNumber,
    },
  });

  useEffect(() => {
    if (!token) {
      router.push("/");
    }
  }, [token, router]);

  async function onSubmit(values: GuestLoginBodyType) {
    if (loginMutation.isPending) return;
    try {
      const result = await loginMutation.mutateAsync(values);
      setRole(result.payload.data.guest.role);
      router.push("/guest/menu");
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      });
    }
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Đăng nhập gọi món</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-2 max-w-[600px] flex-shrink-0 w-full"
          noValidate
          onSubmit={form.handleSubmit(onSubmit, console.log)}
        >
          <div className="grid gap-4">
            {/* TÊN KHÁCH HÀNG */}
            <Field>
              <div className="grid gap-2">
                <FieldLabel htmlFor="name">Tên khách hàng</FieldLabel>
                <FieldContent>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nhập tên của bạn"
                    {...form.register("name")}
                  />
                </FieldContent>
                <FieldError errors={[form.formState.errors.name]} />
              </div>
            </Field>

            <Button type="submit" className="w-full">
              Đăng nhập
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
