"use client";
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
import { TableStatus, TableStatusValues } from "@/constants/type";
import { getVietnameseTableStatus, handleErrorApi } from "@/lib/utils";
import { useAddTableMutation } from "@/queries/useTable";
import {
  CreateTableBody,
  CreateTableBodyInput,
  CreateTableBodyType,
} from "@/schemaValidations/table.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function AddTable() {
  const [open, setOpen] = useState(false);
  const form = useForm<CreateTableBodyInput>({
    resolver: zodResolver(CreateTableBody),
    defaultValues: {
      number: 0,
      capacity: 2,
      status: TableStatus.Hidden,
    },
  });

  const addTableMutation = useAddTableMutation();

  const statusValue = form.watch("status");

  const onSubmit = async (values: CreateTableBodyInput) => {
    if (addTableMutation.isPending) return;
    try {
      const body = values as CreateTableBodyType;
      await addTableMutation.mutateAsync(body);
      toast("Thêm bàn ăn thành công!");
      reset();
      setOpen(false);
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
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Thêm bàn
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[600px] max-h-screen overflow-auto"
        onCloseAutoFocus={() => form.reset()}
      >
        <DialogHeader>
          <DialogTitle>Thêm bàn</DialogTitle>
        </DialogHeader>

        <form
          noValidate
          className="grid auto-rows-max items-start gap-4 md:gap-8"
          id="add-table-form"
          onSubmit={form.handleSubmit(onSubmit)}
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
                      {...form.register("number", {
                        onChange: (e) => {
                          form.setValue("number", Number(e.target.value));
                        },
                      })}
                    />
                  </FieldContent>
                  <FieldError errors={[form.formState.errors.number]} />
                </div>
              </div>
            </Field>

            {/* LƯỢNG KHÁCH CHO PHÉP */}
            <Field>
              <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                <FieldLabel htmlFor="capacity">Lượng khách cho phép</FieldLabel>
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
          </div>
        </form>

        <DialogFooter>
          <Button type="submit" form="add-table-form">
            Thêm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
