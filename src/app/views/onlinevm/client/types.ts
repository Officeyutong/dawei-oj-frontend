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
    refundableAmount: number;
}
interface CreateOrderResponse {
    orderId: number;
    expireAfter: number;
    payUrl: string;
    createTime: number;
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

interface RefundEntry {
    user: UserEntry;
    refund_id: number;
    create_time: number;
    last_update_time: number;
    amount: number;
    description: string;
    refund_status: RefundStatus;
    admin_description: string | null;

};

type RefundStatus = "done" | "error" | "processing";


export type { OrderListEntry, OrderPaymentStatus, UserBasicInfo, CreateOrderResponse, TransactionEntry, RefundStatus, RefundEntry };
