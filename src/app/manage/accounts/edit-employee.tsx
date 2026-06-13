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
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";
import { useGetAccount, useUpdateAccountMutation } from "@/queries/useAccount";
import { useUploadMediaMutation } from "@/queries/useMedia";
import { toast } from "sonner";
import { handleErrorApi } from "@/lib/utils";

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
  const { data } = useGetAccount({
    id: id as number,
    enabled: Boolean(id),
  });
  const avatar = form.watch("avatar");
  const name = form.watch("name");
  const changePassword = form.watch("changePassword");
  const updateAccountMutation = useUpdateAccountMutation();
  const uploadMediaMutation = useUploadMediaMutation();

  const previewAvatarFromFile = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return avatar;
  }, [file, avatar]);

  useEffect(() => {
    if (data) {
      const { name, avatar, email } = data.payload.data;
      const currentRole = data.payload.data.role;
      form.reset({
        name,
        avatar: avatar ?? undefined,
        email,
        role: currentRole,
        changePassword: form.getValues("changePassword"),
        password: form.getValues("password"),
        confirmPassword: form.getValues("confirmPassword"),
      });
    }
  }, [data]);

  const onSubmit = async (values: UpdateEmployeeAccountBodyType) => {
    if (updateAccountMutation.isPending) return;
    try {
      let body: UpdateEmployeeAccountBodyType & { id: number } = {
        id: id as number,
        ...values,
      };
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadImageResult =
          await uploadMediaMutation.mutateAsync(formData);
        const imageUrl = uploadImageResult.payload.data;
        body = {
          ...body,
          avatar: imageUrl,
          role: "Employee",
        };
      }
      await updateAccountMutation.mutateAsync(body);
      toast("Cập nhật nhân viên thành công!");
      onSubmitSuccess && onSubmitSuccess();
      reset();
    } catch (error) {
      handleErrorApi({ error, setError: form.setError });
    }
  };

  const reset = () => {
    setId(undefined);
    setFile(null);
  };

  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(value) => {
        if (!value) {
          reset();
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
          className="grid auto-rows-max items-start gap-4 md:gap-8"
          id="edit-employee-form"
          onSubmit={form.handleSubmit(onSubmit, (e) => {
            console.log(e);
          })}
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
