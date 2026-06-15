"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { getVietnameseDishStatus, handleErrorApi } from "@/lib/utils";
import { useGetDishQuery, useUpdateDishMutation } from "@/queries/useDish";
import { useUploadMediaMutation } from "@/queries/useMedia";
import {
  UpdateDishBody,
  UpdateDishBodyType,
} from "@/schemaValidations/dish.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function EditDish({
  id,
  setId,
  onSubmitSuccess,
}: {
  id?: number | undefined;
  setId: (value: number | undefined) => void;
  onSubmitSuccess?: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const form = useForm<UpdateDishBodyType>({
    resolver: zodResolver(UpdateDishBody),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      image: undefined,
      status: DishStatus.Unavailable,
    },
  });
  const image = form.watch("image");
  const name = form.watch("name");
  const statusValue = form.watch("status");
  const uploadMediaMutation = useUploadMediaMutation();
  const updateDishMutation = useUpdateDishMutation();
  const { data } = useGetDishQuery({ enabled: Boolean(id), id: id as number });

  const previewAvatarFromFile = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return image;
  }, [file, image]);

  useEffect(() => {
    if (data) {
      const { name, image, description, price, status } = data.payload.data;
      form.reset({
        name,
        image: image ?? undefined,
        description,
        price,
        status,
      });
    }
  }, [data]);

  const onSubmit = async (values: UpdateDishBodyType) => {
    if (updateDishMutation.isPending) return;
    try {
      let body: UpdateDishBodyType & { id: number } = {
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
          image: imageUrl,
        };
      }
      await updateDishMutation.mutateAsync(body);
      toast("Cập nhật món ăn thành công!");
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
          <DialogTitle>Cập nhật món ăn</DialogTitle>
          <DialogDescription>
            Các trường sau đây là bắt buộc: Tên, ảnh
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          className="grid auto-rows-max items-start gap-4 md:gap-8"
          id="edit-dish-form"
          onSubmit={form.handleSubmit(onSubmit)}
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
          <Button type="submit" form="edit-dish-form">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
