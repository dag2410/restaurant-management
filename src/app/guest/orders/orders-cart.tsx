"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, getVietnameseOrderStatus } from "@/lib/utils";
import { useGuestGetOrderListQuery } from "@/queries/useGuest";
import Image from "next/image";

export default function OrdersCart() {
  const { data } = useGuestGetOrderListQuery();
  const orders = data?.payload.data ?? [];
  const totalPrice = () => {
    return orders.reduce((result, order) => {
      return result + order.dishSnapshot.price * order.quantity;
    }, 0);
  };

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

      <div className="mt-4 pt-4 border-t border-dashed flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Tổng cộng {orders.length} món:
        </span>
        <span className="text-lg font-bold text-primary">
          {formatCurrency(totalPrice())}
        </span>
      </div>
    </div>
  );
}
