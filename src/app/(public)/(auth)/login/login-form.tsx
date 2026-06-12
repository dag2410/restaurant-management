"use client";

import { useAppContext } from "@/components/app-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { handleErrorApi } from "@/lib/utils";
import { useLoginMutation } from "@/queries/useAuth";
import { LoginBody, LoginBodyType } from "@/schemaValidations/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearTokens = searchParams.get("clearTokens");
  const { setIsAuth } = useAppContext();
  const loginMutation = useLoginMutation();
  const form = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (clearTokens) {
      setIsAuth(false);
    }
  }, [clearTokens, setIsAuth]);

  async function onSubmit(values: LoginBodyType) {
    if (loginMutation.isPending) return;
    try {
      await loginMutation.mutateAsync(values);
      toast.success("Đăng nhập thành công");
      router.push("/manage/dashboard");
    } catch (error: any) {
      handleErrorApi({
        error,
        setError: form.setError,
      });
    }
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Đăng nhập</CardTitle>

        <CardDescription>Nhập email và mật khẩu để đăng nhập</CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={form.handleSubmit(onSubmit, (err) => {
            console.warn("Validation errors", err);
          })}
          className="space-y-4"
          noValidate
        >
          {/* EMAIL */}
          <Field>
            <FieldLabel>Email</FieldLabel>

            <FieldContent>
              <Input
                type="email"
                placeholder="m@example.com"
                {...form.register("email")}
              />
            </FieldContent>

            {form.formState.errors.email && (
              <FieldError>{form.formState.errors.email.message}</FieldError>
            )}
          </Field>

          {/* PASSWORD */}
          <Field>
            <FieldLabel>Mật khẩu</FieldLabel>

            <FieldContent>
              <Input type="password" {...form.register("password")} />
            </FieldContent>

            {form.formState.errors.password && (
              <FieldError>{form.formState.errors.password.message}</FieldError>
            )}
          </Field>

          <Button type="submit" className="w-full">
            Đăng nhập
          </Button>

          <Button type="button" variant="outline" className="w-full">
            Đăng nhập bằng Google
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
