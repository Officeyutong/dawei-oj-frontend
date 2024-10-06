type OrderPaymentStatus = "unpaid" | "paid" | "error" | "expired" | "closed";
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
    // related_operator_id: number | null;
    related_refund_id: number | null;
    related_machine_order_id: number | null;
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

interface VMChargeSchemaEntry {
    duration: [number, number | null];
    charge: number;
}

interface OnlineVMProduct {
    product_id: number;
    tencent_cloud_params: string | null;
    charge_schema: VMChargeSchemaEntry[];
    description: string;
    name: string;
    require_student_privilege: boolean;
}

interface OnlineVMProductUpdateRequest extends Omit<OnlineVMProduct, "product_id" | "charge_schema"> {
    tencent_cloud_params: string;
    charge_schema: string;
}


type OnlineVMOrderStatus = "available" | "error" | "destroyed";
interface OnlineVMOrderEntry {
    user: UserEntry;
    order_id: number;
    create_time: number;
    last_update_time: number;
    status: OnlineVMOrderStatus;
    tencent_cloud_id: string;
    charge_schema: VMChargeSchemaEntry[];
    admin_description: string | null;
    product: {
        product_id: number;
        name: string;
    }
}

interface PrivilegeStudentRecord {
    user: UserEntry;
    create_time: number;
}

export type { OrderListEntry, OrderPaymentStatus, UserBasicInfo, CreateOrderResponse, TransactionEntry, RefundStatus, RefundEntry, VMChargeSchemaEntry, OnlineVMProduct, OnlineVMProductUpdateRequest, OnlineVMOrderEntry, OnlineVMOrderStatus, PrivilegeStudentRecord };
