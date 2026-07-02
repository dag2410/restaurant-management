"use client";

import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/constants/type";
import socket from "@/lib/socket";
import { formatCurrency, getVietnameseOrderStatus } from "@/lib/utils";
import { useGuestGetOrderListQuery } from "@/queries/useGuest";
import {
  PayGuestOrdersResType,
  UpdateOrderResType,
} from "@/schemaValidations/order.schema";
import Image from "next/image";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

export default function OrdersCart() {
  const { data, refetch } = useGuestGetOrderListQuery();
  const orders = data?.payload.data ?? [];
  console.log(orders);

  const { waitingForPaying, paid } = (() => {
    return orders.reduce(
      (result, order) => {
        if (
          order.status === OrderStatus.Delivered ||
          order.status === OrderStatus.Processing ||
          order.status === OrderStatus.Pending
        ) {
          return {
            ...result,
            waitingForPaying: {
              price:
                result.waitingForPaying.price +
                order.dishSnapshot.price * order.quantity,
              quantity: result.waitingForPaying.quantity + order.quantity,
            },
          };
        }

        if (order.status === OrderStatus.Paid) {
          return {
            ...result,
            paid: {
              price:
                result.paid.price + order.dishSnapshot.price * order.quantity,
              quantity: result.paid.quantity + order.quantity,
            },
          };
        }

        return result;
      },
      {
        waitingForPaying: {
          price: 0,
          quantity: 0,
        },
        paid: {
          price: 0,
          quantity: 0,
        },
      },
    );
  })();

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      console.log(socket.id);
    }

    function onDisconnect() {
      console.log("disconnect");
    }

    function onUpdateOrder(data: UpdateOrderResType["data"]) {
      refetch();
      const {
        dishSnapshot: { name },
        quantity,
      } = data;
      toast.success(
        `Món ${name} (SL: ${quantity}) đã được cập nhật sang trạng thái ${getVietnameseOrderStatus(data.status)}`,
      );
    }

    function onPayment(data: PayGuestOrdersResType["data"]) {
      const { guest } = data[0];
      toast.success(
        ` ${guest?.name} tại bàn ${guest?.tableNumber} thanh toán thành công ${data.length} món `,
      );
      refetch();
    }

    socket.on("update-order", onUpdateOrder);
    socket.on("connect", onConnect);
    socket.on("payment", onPayment);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("payment", onPayment);
      socket.off("update-order", onUpdateOrder);
    };
  }, [refetch]);

  return (
    <div className="flex flex-col gap-5">
      {orders?.map((order, index) => (
        <div key={order.id} className="flex gap-8">
          <div className="text-sm font-semibold">{index + 1}</div>
          <div className="flex-shrink-0 relative">
            <Image
              src={order.dishSnapshot.image}
              alt={order.dishSnapshot.name}
              height={100}
              width={100}
              quality={75}
              className={`object-cover w-[80px] h-[80px] rounded-md`}
            />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm">{order.dishSnapshot.name}</h3>
            <p className="text-xs font-semibold">
              {formatCurrency(order.dishSnapshot.price)} x {order.quantity}
            </p>
          </div>
          <Badge variant={"outline"}>
            {getVietnameseOrderStatus(order.status)}
          </Badge>
        </div>
      ))}

      {paid.quantity !== 0 && (
        <div className="mt-4 pt-4 border-t border-dashed flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Đơn đã thanh toán {paid.quantity} món:
          </span>
          <span className="text-lg font-bold text-primary">
            {formatCurrency(paid.price)}
          </span>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-dashed flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Đơn chưa thanh toán {waitingForPaying.quantity} món:
        </span>
        <span className="text-lg font-bold text-primary">
          {formatCurrency(waitingForPaying.price)}
        </span>
      </div>
    </div>
  );
}
