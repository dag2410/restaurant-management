"use client";
import { DishesDialog } from "@/app/manage/orders/dishes-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { OrderStatus, OrderStatusValues } from "@/constants/type";
import { getVietnameseOrderStatus, handleErrorApi } from "@/lib/utils";
import {
  useGetOrderDetailQuery,
  useUpdateOrderMutation,
} from "@/queries/useOrder";
import { DishListResType } from "@/schemaValidations/dish.schema";
import {
  UpdateOrderBody,
  UpdateOrderBodyType,
} from "@/schemaValidations/order.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function EditOrder({
  id,
  setId,
  onSubmitSuccess,
}: {
  id?: number | undefined;
  setId: (value: number | undefined) => void;
  onSubmitSuccess?: () => void;
}) {
  const [selectedDish, setSelectedDish] = useState<DishListResType["data"][0]>(
    null as any,
  );
  const updateOrderMutation = useUpdateOrderMutation();
  const { data } = useGetOrderDetailQuery({
    id: id as number,
    enabled: Boolean(id),
  });
  const form = useForm<UpdateOrderBodyType>({
    resolver: zodResolver(UpdateOrderBody),
    defaultValues: {
      status: OrderStatus.Pending,
      dishId: 0,
      quantity: 1,
    },
  });

  const onSubmit = async (values: UpdateOrderBodyType) => {
    if (updateOrderMutation.isPending) return;
    try {
      let body: UpdateOrderBodyType & { orderId: number } = {
        ...values,
        orderId: id as number,
      };
      await updateOrderMutation.mutateAsync(body);
      toast("Đơn hàng đã được cập nhật thành công!");
      reset();
      onSubmitSuccess?.();
      setId(undefined);
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      });
    }
  };

  const reset = () => {
    setId(undefined);
  };

  useEffect(() => {
    if (data) {
      const {
        status,
        dishSnapshot: { dishId },
        quantity,
      } = data.payload.data;
      form.reset({
        status,
        dishId: dishId ?? 0,
        quantity,
      });
      setSelectedDish(data.payload.data.dishSnapshot as any);
    }
  }, [data, form]);

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
          <DialogTitle>Cập nhật đơn hàng</DialogTitle>
        </DialogHeader>
        <form
          noValidate
          className="grid auto-rows-max items-start gap-4 md:gap-8"
          id="edit-order-form"
          onSubmit={form.handleSubmit(onSubmit, console.log)}
        >
          <div className="grid gap-4 py-4">
            <Field>
              <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                <FieldLabel>Món ăn</FieldLabel>

                <div className="flex items-center col-span-2 space-x-4">
                  <Avatar className="aspect-square w-[50px] h-[50px] rounded-md object-cover">
                    <AvatarImage src={selectedDish?.image} />
                    <AvatarFallback className="rounded-none">
                      {selectedDish?.name}
                    </AvatarFallback>
                  </Avatar>

                  <div>{selectedDish?.name}</div>
                </div>

                <DishesDialog
                  onChoose={(dish) => {
                    form.setValue("dishId", dish.id, {
                      shouldValidate: true,
                    });
                    setSelectedDish(dish);
                  }}
                />
              </div>

              <FieldError errors={[form.formState.errors.dishId]} />
            </Field>

            <Field>
              <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                <FieldLabel htmlFor="quantity">Số lượng</FieldLabel>

                <div className="col-span-3 w-full space-y-2">
                  <FieldContent>
                    <Input
                      id="quantity"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="w-16 text-center"
                      {...form.register("quantity", {
                        valueAsNumber: true,
                      })}
                    />
                  </FieldContent>

                  <FieldError errors={[form.formState.errors.quantity]} />
                </div>
              </div>
            </Field>

            <Field>
              <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                <FieldLabel>Trạng thái</FieldLabel>

                <div className="col-span-3 w-full space-y-2">
                  <FieldContent>
                    <Select
                      value={form.watch("status")}
                      onValueChange={(value) =>
                        form.setValue("status", value as any, {
                          shouldValidate: true,
                        })
                      }
                      defaultValue={form.getValues("status") as any}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Trạng thái" />
                      </SelectTrigger>

                      <SelectContent>
                        {OrderStatusValues.map((status) => (
                          <SelectItem key={status} value={status}>
                            {getVietnameseOrderStatus(status)}
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
          <Button type="submit" form="edit-order-form">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
