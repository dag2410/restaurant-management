"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  UpdateEmployeeAccountBody,
  UpdateEmployeeAccountBodyType,
} from "@/schemaValidations/account.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";

export default function EditEmployee({
  id,
  setId,
  onSubmitSuccess,
}: {
  id?: number | undefined;
  setId: (value: number | undefined) => void;
  onSubmitSuccess?: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<UpdateEmployeeAccountBodyType>({
    resolver: zodResolver(UpdateEmployeeAccountBody),
    defaultValues: {
      name: "",
      email: "",
      avatar: undefined,
      password: undefined,
      confirmPassword: undefined,
      changePassword: false,
    },
  });

  const avatar = form.watch("avatar");
  const name = form.watch("name");
  const changePassword = form.watch("changePassword");

  const previewAvatarFromFile = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return avatar;
  }, [file, avatar]);

  const onSubmit = form.handleSubmit((values) => {
    console.log(values);
    onSubmitSuccess?.();
  });

  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(value) => {
        if (!value) {
          setId(undefined);
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>Cập nhật tài khoản</DialogTitle>
          <DialogDescription>
            Các trường tên, email, mật khẩu là bắt buộc
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={onSubmit}
          className="grid auto-rows-max items-start gap-4 md:gap-8"
          id="edit-employee-form"
        >
          <div className="grid gap-4 py-4">
            {/* AVATAR */}
            <Field>
              <div className="flex gap-2 items-start justify-start">
                <Avatar className="aspect-square w-[100px] h-[100px] rounded-md object-cover">
                  <AvatarImage src={previewAvatarFromFile} />
                  <AvatarFallback className="rounded-none">
                    {name || "Avatar"}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  accept="image/*"
                  ref={avatarInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFile(file);
                      // Cập nhật giá trị avatar thủ công vào react-hook-form
                      form.setValue(
                        "avatar",
                        "http://localhost:3000/" + file.name,
                      );
                    }
                  }}
                  className="hidden"
                />
                <button
                  className="flex aspect-square w-[100px] items-center justify-center rounded-md border border-dashed"
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="sr-only">Upload</span>
                </button>
              </div>
            </Field>

            {/* TÊN */}
            <Field>
              <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                <FieldLabel htmlFor="name">Tên</FieldLabel>
                <div className="col-span-3 w-full space-y-2">
                  <FieldContent>
                    <Input
                      id="name"
                      className="w-full"
                      {...form.register("name")}
                    />
                  </FieldContent>
                  <FieldError errors={[form.formState.errors.name]} />
                </div>
              </div>
            </Field>

            {/* EMAIL */}
            <Field>
              <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <div className="col-span-3 w-full space-y-2">
                  <FieldContent>
                    <Input
                      id="email"
                      className="w-full"
                      {...form.register("email")}
                    />
                  </FieldContent>
                  <FieldError errors={[form.formState.errors.email]} />
                </div>
              </div>
            </Field>

            {/* SWITCH ĐỔI MẬT KHẨU */}
            <Field>
              <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                <FieldLabel htmlFor="changePassword">Đổi mật khẩu</FieldLabel>
                <div className="col-span-3 w-full space-y-2">
                  <FieldContent>
                    <Switch
                      id="changePassword"
                      checked={changePassword}
                      onCheckedChange={(checked) =>
                        form.setValue("changePassword", checked)
                      }
                    />
                  </FieldContent>
                </div>
              </div>
            </Field>

            {/* MẬT KHẨU MỚI */}
            {changePassword && (
              <Field>
                <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                  <FieldLabel htmlFor="password">Mật khẩu mới</FieldLabel>
                  <div className="col-span-3 w-full space-y-2">
                    <FieldContent>
                      <Input
                        id="password"
                        className="w-full"
                        type="password"
                        {...form.register("password")}
                      />
                    </FieldContent>
                    <FieldError errors={[form.formState.errors.password]} />
                  </div>
                </div>
              </Field>
            )}

            {/* XÁC NHẬN MẬT KHẨU MỚI */}
            {changePassword && (
              <Field>
                <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                  <FieldLabel htmlFor="confirmPassword">
                    Xác nhận mật khẩu mới
                  </FieldLabel>
                  <div className="col-span-3 w-full space-y-2">
                    <FieldContent>
                      <Input
                        id="confirmPassword"
                        className="w-full"
                        type="password"
                        {...form.register("confirmPassword")}
                      />
                    </FieldContent>
                    <FieldError
                      errors={[form.formState.errors.confirmPassword]}
                    />
                  </div>
                </div>
              </Field>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button type="submit" form="edit-employee-form">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
