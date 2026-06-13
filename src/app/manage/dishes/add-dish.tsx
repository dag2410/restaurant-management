"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DishStatus, DishStatusValues } from "@/constants/type";
import { getVietnameseDishStatus } from "@/lib/utils";
import {
  CreateDishBody,
  CreateDishBodyInput,
  CreateDishBodyType,
} from "@/schemaValidations/dish.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";

export default function AddDish() {
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const form = useForm<CreateDishBodyInput>({
    resolver: zodResolver(CreateDishBody),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      image: "",
      status: DishStatus.Unavailable,
    },
  });
  const image = form.watch("image");
  const name = form.watch("name");
  const statusValue = form.watch("status");

  const previewAvatarFromFile = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return image;
  }, [file, image]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Thêm món ăn
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>Thêm món ăn</DialogTitle>
        </DialogHeader>

        <form
          noValidate
          className="grid auto-rows-max items-start gap-4 md:gap-8"
          id="add-dish-form"
          onSubmit={form.handleSubmit((values) => console.log(values))}
        >
          <div className="grid gap-4 py-4">
            {/* ẢNH MÓN ĂN */}
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
                  ref={imageInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFile(file);
                      form.setValue(
                        "image",
                        "http://localhost:3000/" + file.name,
                      );
                    }
                  }}
                  className="hidden"
                />
                <button
                  className="flex aspect-square w-[100px] items-center justify-center rounded-md border border-dashed"
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="sr-only">Upload</span>
                </button>
              </div>
            </Field>

            {/* TÊN MÓN ĂN */}
            <Field>
              <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                <FieldLabel htmlFor="name">Tên món ăn</FieldLabel>
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

            {/* GIÁ */}
            <Field>
              <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                <FieldLabel htmlFor="price">Giá</FieldLabel>
                <div className="col-span-3 w-full space-y-2">
                  <FieldContent>
                    <Input
                      id="price"
                      className="w-full"
                      type="number"
                      {...form.register("price", { valueAsNumber: true })}
                    />
                  </FieldContent>
                  <FieldError errors={[form.formState.errors.price]} />
                </div>
              </div>
            </Field>

            {/* MÔ TẢ SẢN PHẨM */}
            <Field>
              <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                <FieldLabel htmlFor="description">Mô tả sản phẩm</FieldLabel>
                <div className="col-span-3 w-full space-y-2">
                  <FieldContent>
                    <Textarea
                      id="description"
                      className="w-full"
                      {...form.register("description")}
                    />
                  </FieldContent>
                  <FieldError errors={[form.formState.errors.description]} />
                </div>
              </div>
            </Field>

            {/* TRẠNG THÁI */}
            <Field>
              <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                <FieldLabel htmlFor="status">Trạng thái</FieldLabel>
                <div className="col-span-3 w-full space-y-2">
                  <FieldContent>
                    <Select
                      onValueChange={(value) =>
                        form.setValue("status", value as any)
                      }
                      value={statusValue}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        {DishStatusValues.map((status) => (
                          <SelectItem key={status} value={status}>
                            {getVietnameseDishStatus(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldContent>
                  <FieldError errors={[form.formState.errors.status]} />
                </div>
              </div>
            </Field>
          </div>
        </form>

        <DialogFooter>
          <Button type="submit" form="add-dish-form">
            Thêm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
