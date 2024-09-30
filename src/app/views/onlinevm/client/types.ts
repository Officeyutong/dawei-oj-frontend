type OrderPaymentStatus = "unpaid" | "paid" | "error";
interface OrderListEntry {
    order_id: number;
    user: {
        uid: number;
        username: string;
        real_name?: string;
        email: string;
    };
    time: number;
    amount: number;
    wechat_payment_url: string;
    status: OrderPaymentStatus;
    last_update_time: number;
    expire_at: number;
    description: string;
    admin_description: null | string;
}
interface UserBasicInfo {
    remainedAmount: number;
    allowRechargeAmount: number[];
}
interface CreateOrderResponse {
    orderId: number;
    expireAfter: number;
    payUrl: string;
}
export type { OrderListEntry, OrderPaymentStatus, UserBasicInfo, CreateOrderResponse };
