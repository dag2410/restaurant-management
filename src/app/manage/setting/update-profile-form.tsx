"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  UpdateMeBody,
  UpdateMeBodyType,
} from "@/schemaValidations/account.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useRef, useState } from "react";
import { useAccountProfile } from "@/queries/useAccount";

export default function UpdateProfileForm() {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const previewAvatar = () => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return avatar;
  };
  const form = useForm<UpdateMeBodyType>({
    resolver: zodResolver(UpdateMeBody),
    defaultValues: {
      name: "",
      avatar: "",
    },
  });
  const { data } = useAccountProfile();
  const avatar = form.watch("avatar");
  const name = form.watch("name");

  useEffect(() => {
    if (data) {
      const { name, avatar } = data.payload.data;
      form.reset({
        name,
        avatar: avatar ?? "",
      });
    }
  }, [form, data]);

  // useAccountProfile((data) => {
  //   const { name, avatar } = data.data;
  // });

  const onSubmit = (values: UpdateMeBodyType) => {
    console.log(values);
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
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
                  <AvatarImage src={previewAvatar()} />
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
