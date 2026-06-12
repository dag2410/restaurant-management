"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { handleErrorApi } from "@/lib/utils";
import { useAccountMe, useUpdateMeMutation } from "@/queries/useAccount";
import { useUploadMediaMutation } from "@/queries/useMedia";
import {
  UpdateMeBody,
  UpdateMeBodyType,
} from "@/schemaValidations/account.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function UpdateProfileForm() {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const form = useForm<UpdateMeBodyType>({
    resolver: zodResolver(UpdateMeBody),
    defaultValues: {
      name: "",
      avatar: undefined,
    },
  });
  const { data, refetch } = useAccountMe();
  const avatar = form.watch("avatar");
  const name = form.watch("name");
  const previewAvatar = file ? URL.createObjectURL(file) : avatar;
  const updateMeMutation = useUpdateMeMutation();
  const uploadMediaMutation = useUploadMediaMutation();

  useEffect(() => {
    if (data) {
      const { name, avatar } = data.payload.data;
      form.reset({
        name,
        avatar: avatar ?? undefined,
      });
    }
  }, [form, data]);

  const reset = () => {
    form.reset();
    setFile(null);
  };

  const onSubmit = async (values: UpdateMeBodyType) => {
    if (updateMeMutation.isPending) return;
    try {
      let body = values;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadImageResult =
          await uploadMediaMutation.mutateAsync(formData);
        const imageUrl = uploadImageResult.payload.data;
        body = {
          ...values,
          avatar: imageUrl,
        };
      }
      await updateMeMutation.mutateAsync(body);
      toast("Cập nhật thành công!");
      refetch();
    } catch (error) {
      handleErrorApi({ error, setError: form.setError });
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      onReset={reset}
      noValidate
      className="grid auto-rows-max items-start gap-4 md:gap-8"
    >
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6">
            {/* Avatar */}
            <Field>
              <div className="flex gap-2 items-start justify-start">
                <Avatar className="aspect-square w-[100px] h-[100px] rounded-md object-cover">
                  <AvatarImage src={previewAvatar} />
                  <AvatarFallback className="rounded-none">
                    {name}
                  </AvatarFallback>
                </Avatar>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] || null);
                    console.log(e.target.files?.[0]);
                  }}
                  ref={avatarInputRef}
                />

                <button
                  type="button"
                  className="flex aspect-square w-[100px] items-center justify-center rounded-md border border-dashed"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="sr-only">Upload</span>
                </button>
              </div>
            </Field>

            {/* Name */}
            <Field>
              <FieldLabel htmlFor="name">{"Tên"}</FieldLabel>

              <FieldContent>
                <Input
                  id="name"
                  type="text"
                  className="w-full"
                  {...form.register("name")}
                />
              </FieldContent>

              {form.formState.errors.name && (
                <FieldError>{form.formState.errors.name.message}</FieldError>
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
