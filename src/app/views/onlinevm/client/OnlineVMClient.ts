import GeneralClient from "../../../common/GeneralClient";
import { CreateOrderResponse, OnlineVMProduct, OrderListEntry, OrderPaymentStatus, RefundEntry, RefundStatus, TransactionEntry, UserBasicInfo } from "./types";

class OnlineVMClient extends GeneralClient {
    async getRechargeOrderList(page: number, filterUser?: number, filterOrderId?: number[]): Promise<{ pageCount: number; data: OrderListEntry[] }> {
        return (await this.client!.post("/api/onlinevm/recharge_order_list", { page, filterUser, filterOrderId })).data;
    }
    async getUserBasicInfo(): Promise<UserBasicInfo> {
        return (await this.client!.post("/api/onlinevm/user/get_self_basic_info")).data;
    }
    async createOrder(amount: number): Promise<CreateOrderResponse> {
        return (await this.client!.post("/api/onlinevm/user/create_order", { amount })).data;
    }
    async refreshOrderStatus(orderId: number): Promise<{ status: OrderPaymentStatus }> {
        return (await this.client!.post("/api/onlinevm/user/refresh_order_status", { order_id: orderId })).data;
    }
    async refreshRefundStatus(refundId: number): Promise<{ status: RefundStatus }> {
        return (await this.client!.post("/api/onlinevm/user/refresh_refund_status", { refund_id: refundId })).data;
    }
    async getTransactionList(page: number, filterUser?: number, filterOrderId?: number[]): Promise<{ pageCount: number; data: TransactionEntry[] }> {
        return (await this.client!.post("/api/onlinevm/balance_change_list", { page, filterUser, filterOrderId })).data;
    }
    async getRefundList(page: number, filterUser?: number, filterRefundId?: number[]): Promise<{ pageCount: number; data: RefundEntry[] }> {
        return (await this.client!.post("/api/onlinevm/refund_list", { page, filterUser, filterRefundId })).data;
    }
    async requestRefund(uid: number) {
        await this.client!.post("/api/onlinevm/request_refund", { uid });
    }
    async resolveAbnormalRefund(refundId: number, reason: string) {
        await this.client!.post("/api/onlinevm/admin/resolve_refund", { refund_id: refundId, reason });
    }
    async getProducts(): Promise<OnlineVMProduct> {
        return (await (this.client!.post("/api/onlinevm/get_products"))).data;
    }
    async createProduct(): Promise<{ productID: number }> {
        return (await this.client!.post("/api/onlinevm/admin/create_product")).data;
    }
}

const onlineVMClient = new OnlineVMClient();

export function translatePaymentStatus(status: OrderPaymentStatus): string {
    switch (status) {
        case "paid": return "已支付";
        case "unpaid": return "待支付"
        case "error": return "错误"
        case "expired": return "已过期"
        case "closed": return "已关闭"
    }
}
export function translateRefundStatus(status: RefundStatus): string {
    switch (status) {
        case "done": return "已完成";
        case "processing": return "进行中";
        case "error": return "错误";
    }
}

export default onlineVMClient;
