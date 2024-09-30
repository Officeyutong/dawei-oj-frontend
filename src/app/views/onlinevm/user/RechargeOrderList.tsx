import { useCallback, useEffect, useState } from "react";
import { OrderListEntry } from "../client/types";
import { Button, Dimmer, Header, Loader, Pagination, Table } from "semantic-ui-react";
import onlineVMClient, { translatePaymentStatus } from "../client/OnlineVMClient";
import { useSelector } from "react-redux";
import { StateType } from "../../../states/Manager";
import { timeStampToString, useNowTime } from "../../../common/Utils";
import OrderDetailsModal from "../OrderDetailsModal";

const RechargeOrderList: React.FC<{}> = () => {
    const selfUid = useSelector((s: StateType) => s.userState.userData.uid);
    const initialReqDone = useSelector((s: StateType) => s.userState.initialRequestDone);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageCount, setPageCount] = useState(0);
    const [data, setData] = useState<OrderListEntry[]>([]);
    const [showingOrder, setShowingOrder] = useState<OrderListEntry | null>(null);
    const loadPage = useCallback(async (page: number) => {
        try {
            setLoading(true);
            const resp = await onlineVMClient.getRechargeOrderList(page, selfUid);
            setPageCount(resp.pageCount);
            setData(resp.data);
            setLoaded(true);
            setPage(page);
        } catch { } finally {
            setLoading(false);
        }
    }, [selfUid]);
    useEffect(() => {
        if (!loaded && initialReqDone) loadPage(1);
    }, [initialReqDone, loadPage, loaded])
    const nowTime = useNowTime();
    return <>
        <Header as="h2">充值订单</Header>
        {loading && <Dimmer active><Loader></Loader></Dimmer>}
        当前时间：{nowTime.toJSDate().toLocaleString()}
        {showingOrder !== null && <OrderDetailsModal orderId={showingOrder.order_id} uid={selfUid} onClose={() => setShowingOrder(null)}></OrderDetailsModal>}
        {loaded && <><Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>订单编号</Table.HeaderCell>
                    <Table.HeaderCell>下单时间</Table.HeaderCell>
                    <Table.HeaderCell>到期时间</Table.HeaderCell>
                    <Table.HeaderCell>订单状态</Table.HeaderCell>
                    <Table.HeaderCell>充值金额</Table.HeaderCell>
                    <Table.HeaderCell>操作</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {data.map(item => <Table.Row key={item.order_id}>
                    <Table.Cell>{item.order_id}</Table.Cell>
                    <Table.Cell>{timeStampToString(item.time)}</Table.Cell>
                    <Table.Cell negative={item.status === "unpaid"}>{timeStampToString(item.expire_at)}</Table.Cell>
                    <Table.Cell positive={item.status === "paid"} negative={item.status !== "paid"}>{translatePaymentStatus(item.status)}</Table.Cell>
                    <Table.Cell>{(item.amount / 100).toFixed(2)}</Table.Cell>
                    <Table.Cell>
                        <Button size="small" onClick={() => setShowingOrder(item)}>查看详情</Button>
                        <Button size="small" disabled={nowTime.toSeconds() > item.expire_at || item.status === "error" || item.status === "paid"}>进行支付</Button>
                    </Table.Cell>
                </Table.Row>)}
            </Table.Body>
        </Table>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <Pagination
                    totalPages={Math.max(1, pageCount)}
                    activePage={page}
                    onPageChange={(_, d) => loadPage(d.activePage as number)}
                ></Pagination>
            </div>
        </>
        }

    </>
};

export default RechargeOrderList;
