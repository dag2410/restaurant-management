"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginBody, LoginBodyType } from "@/schemaValidations/auth.schema";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

export default function LoginForm() {
  const form = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: LoginBodyType) {
    console.log(values);
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Đăng nhập</CardTitle>

        <CardDescription>Nhập email và mật khẩu để đăng nhập</CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
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
