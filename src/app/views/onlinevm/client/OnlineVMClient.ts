import GeneralClient from "../../../common/GeneralClient";
import { CreateOrderResponse, OrderListEntry, OrderPaymentStatus, TransactionEntry, UserBasicInfo } from "./types";

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
    async getTransactionList(page: number, filterUser?: number, filterOrderId?: number[]): Promise<{ pageCount: number; data: TransactionEntry[] }> {
        return (await this.client!.post("/api/onlinevm/balance_change_list", { page, filterUser, filterOrderId })).data;
    }
}

const onlineVMClient = new OnlineVMClient();

export function translatePaymentStatus(status: OrderPaymentStatus): string {
    switch (status) {
        case "paid": return "已支付";
        case "unpaid": return "待支付"
        case "error": return "错误"
    }
}
export default onlineVMClient;
