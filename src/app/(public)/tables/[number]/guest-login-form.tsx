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

export default function GuestLoginForm() {
  const form = useForm<GuestLoginBodyType>({
    resolver: zodResolver(GuestLoginBody),
    defaultValues: {
      name: "",
      token: "",
      tableNumber: 1,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    console.log(values);
    // Logic xử lý đăng nhập cho khách gọi món ở đây nha Đăng
  });

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Đăng nhập gọi món</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-2 max-w-[600px] flex-shrink-0 w-full"
          noValidate
          onSubmit={onSubmit}
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
