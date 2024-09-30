type OrderPaymentStatus = "unpaid" | "paid" | "error";
interface UserEntry {
    uid: number;
    username: string;
    real_name?: string;
    email: string;
};
interface OrderListEntry {
    order_id: number;
    user: UserEntry;
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

interface TransactionEntry {
    user: UserEntry;
    id: number;
    time: number;
    amount: number;
    description: string;
    related_order_id: number | null;
    admin_description: string | null;
}

export type { OrderListEntry, OrderPaymentStatus, UserBasicInfo, CreateOrderResponse, TransactionEntry };
