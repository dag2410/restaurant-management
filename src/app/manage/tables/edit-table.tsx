"use client";
import QRCodeTable from "@/components/qrcode-table";
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
import { Switch } from "@/components/ui/switch";
import { TableStatus, TableStatusValues } from "@/constants/type";
import {
  getTableLink,
  getVietnameseTableStatus,
  handleErrorApi,
} from "@/lib/utils";
import { useGetTableQuery, useUpdateTableMutation } from "@/queries/useTable";
import {
  UpdateTableBody,
  UpdateTableBodyInput,
  UpdateTableBodyType,
} from "@/schemaValidations/table.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function EditTable({
  id,
  setId,
  onSubmitSuccess,
}: {
  id?: number | undefined;
  setId: (value: number | undefined) => void;
  onSubmitSuccess?: () => void;
}) {
  const form = useForm<UpdateTableBodyInput, any, UpdateTableBodyType>({
    resolver: zodResolver(UpdateTableBody),
    defaultValues: {
      capacity: 1,
      status: TableStatus.Hidden,
      changeToken: false,
    },
  });
  const updateTableMutation = useUpdateTableMutation();

  const { data } = useGetTableQuery({ enabled: Boolean(id), id: id as number });

  useEffect(() => {
    if (data) {
      const { capacity, status } = data.payload.data;
      form.reset({
        capacity,
        status,
        changeToken: form.getValues("changeToken"),
      });
    }
  }, [data]);

  // Theo dõi các giá trị của select và switch bằng form.watch
  const statusValue = form.watch("status");
  const changeTokenValue = form.watch("changeToken");

  const onSubmit = async (values: UpdateTableBodyType) => {
    if (updateTableMutation.isPending) return;
    try {
      let body: UpdateTableBodyType & { id: number } = {
        id: id as number,
        ...values,
      };

      await updateTableMutation.mutateAsync(body);
      toast("Cập nhật bàn thành công!");
      onSubmitSuccess && onSubmitSuccess();
      reset();
    } catch (error) {
      handleErrorApi({ error, setError: form.setError });
    }
  };

  const reset = () => {
    setId(undefined);
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
      <DialogContent
        className="sm:max-w-[600px] max-h-screen overflow-auto"
        onCloseAutoFocus={() => {
          form.reset();
          setId(undefined);
        }}
      >
        <DialogHeader>
          <DialogTitle>Cập nhật bàn ăn</DialogTitle>
        </DialogHeader>

        <form
          noValidate
          className="grid auto-rows-max items-start gap-4 md:gap-8"
          id="edit-table-form"
          onSubmit={form.handleSubmit(onSubmit, (e) => {
            console.log(e);
          })}
        >
          <div className="grid gap-4 py-4">
            {/* SỐ HIỆU BÀN */}
            <Field>
              <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                <FieldLabel htmlFor="number">Số hiệu bàn</FieldLabel>
                <div className="col-span-3 w-full space-y-2">
                  <FieldContent>
                    <Input
                      id="number"
                      type="number"
                      className="w-full"
                      value={data?.payload.data.number ?? 0}
                      readOnly
                    />
                  </FieldContent>
                </div>
              </div>
            </Field>

            {/* SỨC CHỨA */}
            <Field>
              <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                <FieldLabel htmlFor="capacity">Sức chứa (người)</FieldLabel>
                <div className="col-span-3 w-full space-y-2">
                  <FieldContent>
                    <Input
                      id="capacity"
                      className="w-full"
                      type="number"
                      {...form.register("capacity", {
                        onChange: (e) => {
                          form.setValue("capacity", Number(e.target.value));
                        },
                      })}
                    />
                  </FieldContent>
                  <FieldError errors={[form.formState.errors.capacity]} />
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
                        {TableStatusValues.map((status) => (
                          <SelectItem key={status} value={status}>
                            {getVietnameseTableStatus(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldContent>
                  <FieldError errors={[form.formState.errors.status]} />
                </div>
              </div>
            </Field>

            {/* ĐỔI QR CODE */}
            <Field>
              <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                <FieldLabel htmlFor="changeToken">Đổi QR Code</FieldLabel>
                <div className="col-span-3 w-full space-y-2">
                  <FieldContent>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="changeToken"
                        checked={changeTokenValue}
                        onCheckedChange={(value) =>
                          form.setValue("changeToken", value)
                        }
                      />
                    </div>
                  </FieldContent>
                  <FieldError errors={[form.formState.errors.changeToken]} />
                </div>
              </div>
            </Field>

            {/* QR CODE */}
            <Field>
              <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                <FieldLabel>QR Code</FieldLabel>
                <div className="col-span-3 w-full space-y-2">
                  {data && (
                    <QRCodeTable
                      token={data?.payload.data.token}
                      tableNumber={data.payload.data.number}
                    />
                  )}
                </div>
              </div>
            </Field>

            {/* URL GỌI MÓN */}
            <Field>
              <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                <FieldLabel>URL gọi món</FieldLabel>
                <div className="col-span-3 w-full space-y-2">
                  {data && (
                    <Link
                      href={getTableLink({
                        token: data?.payload.data.token,
                        tableNumber: data?.payload.data.number,
                      })}
                      target="_blank"
                      className="break-all"
                    >
                      {getTableLink({
                        token: data?.payload.data.token,
                        tableNumber: data?.payload.data.number,
                      })}
                    </Link>
                  )}
                </div>
              </div>
            </Field>
          </div>
        </form>

        <DialogFooter>
          <Button type="submit" form="edit-table-form">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
