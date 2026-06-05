"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useForm } from "react-hook-form";
import {
  ChangePasswordBody,
  ChangePasswordBodyType,
} from "@/schemaValidations/account.schema";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { useChangePasswordMutation } from "@/queries/useAccount";
import { toast } from "sonner";
import { handleErrorApi } from "@/lib/utils";

export default function ChangePasswordForm() {
  const changePasswordMutation = useChangePasswordMutation();
  const form = useForm<ChangePasswordBodyType>({
    resolver: zodResolver(ChangePasswordBody),
    defaultValues: {
      oldPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ChangePasswordBodyType) => {
    if (changePasswordMutation.isPending) return;
    try {
      const result = await changePasswordMutation.mutateAsync(values);
      toast(result.payload.message);
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      });
    }
  };

  const reset = () => {
    form.reset();
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      onReset={reset}
      noValidate
      className="grid auto-rows-max items-start gap-4 md:gap-8"
    >
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6">
            {/* Mật khẩu cũ */}
            <Field>
              <FieldLabel htmlFor="oldPassword">Mật khẩu cũ</FieldLabel>

              <FieldContent>
                <Input
                  autoComplete="current-password"
                  id="oldPassword"
                  type="password"
                  className="w-full"
                  {...form.register("oldPassword")}
                />
              </FieldContent>

              {form.formState.errors.oldPassword && (
                <FieldError>
                  {form.formState.errors.oldPassword.message}
                </FieldError>
              )}
            </Field>

            {/* Mật khẩu mới */}
            <Field>
              <FieldLabel htmlFor="password">Mật khẩu mới</FieldLabel>

              <FieldContent>
                <Input
                  autoComplete="new-password"
                  id="password"
                  type="password"
                  className="w-full"
                  {...form.register("password")}
                />
              </FieldContent>

              {form.formState.errors.password && (
                <FieldError>
                  {form.formState.errors.password.message}
                </FieldError>
              )}
            </Field>

            {/* Nhập lại mật khẩu */}
            <Field>
              <FieldLabel htmlFor="confirmPassword">
                Nhập lại mật khẩu mới
              </FieldLabel>

              <FieldContent>
                <Input
                  autoComplete="new-password"
                  id="confirmPassword"
                  type="password"
                  className="w-full"
                  {...form.register("confirmPassword")}
                />
              </FieldContent>

              {form.formState.errors.confirmPassword && (
                <FieldError>
                  {form.formState.errors.confirmPassword.message}
                </FieldError>
              )}
            </Field>

            <div className="flex items-center gap-2 md:ml-auto">
              <Button variant="outline" size="sm" type="reset">
                Hủy
              </Button>

              <Button size="sm" type="submit">
                Lưu thông tin
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
