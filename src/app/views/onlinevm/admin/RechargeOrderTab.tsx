import { useCallback, useEffect, useState } from "react";
import SelectUserModal, { SelectedUser } from "../../visual_programming/management/SelectUserModal";
import { OrderListEntry } from "../client/types";
import onlineVMClient, { translatePaymentStatus } from "../client/OnlineVMClient";
import OrderDetailModal from "../OrderDetailModal";
import { Button, Dimmer, Divider, Form, Loader, Pagination, Table } from "semantic-ui-react";
import { ComplexUserLabel, timeStampToString, UserSelectLabel } from "../../../common/Utils";

const RechargeOrderTab: React.FC<{}> = () => {

    const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
    const [showSelectModal, setShowSelectModal] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<OrderListEntry[]>([]);
    const [page, setPage] = useState(1);
    const [pageCount, setPageCount] = useState(0);
    const [showingOrderId, setShowingOrderId] = useState<number | null>(null);
    const loadPage = useCallback(async (page: number) => {
        try {
            setLoading(true);
            const resp = await onlineVMClient.getRechargeOrderList(page, selectedUser?.uid);
            setPageCount(resp.pageCount);
            setPage(page);
            setData(resp.data);
            setLoaded(true);
        } catch { } finally {
            setLoading(false);
        }
    }, [selectedUser?.uid])
    useEffect(() => {
        if (!loaded) loadPage(1);
    }, [loadPage, loaded]);
    return <>
        {showingOrderId !== null && <OrderDetailModal
            onClose={() => setShowingOrderId(null)}
            orderId={showingOrderId}
        ></OrderDetailModal>}
        {showSelectModal && <SelectUserModal closeCallback={s => {
            if (s) setSelectedUser(s);
            setShowSelectModal(false);
        }}></SelectUserModal>}
        {loading && <Dimmer active><Loader></Loader></Dimmer>}
        <Form>
            <Form.Field>
                <label>筛选用户</label>
                <UserSelectLabel
                    onOpenSelect={() => setShowSelectModal(true)}
                    onRemove={() => setSelectedUser(null)}
                    user={selectedUser}
                ></UserSelectLabel>
            </Form.Field>
            <Form.Button onClick={() => loadPage(1)}>进行筛选</Form.Button>
        </Form>
        <Divider></Divider>
        {loaded && <>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>订单编号</Table.HeaderCell>
                        <Table.HeaderCell>订单创建时间</Table.HeaderCell>
                        <Table.HeaderCell>订单过期时间</Table.HeaderCell>
                        <Table.HeaderCell>订单金额</Table.HeaderCell>
                        <Table.HeaderCell>用户</Table.HeaderCell>
                        <Table.HeaderCell>订单状态</Table.HeaderCell>
                        <Table.HeaderCell>描述</Table.HeaderCell>
                        <Table.HeaderCell>操作</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data.map(item => <Table.Row key={item.order_id}>
                        <Table.Cell>{item.order_id}</Table.Cell>
                        <Table.Cell>{timeStampToString(item.time)}</Table.Cell>
                        <Table.Cell>{timeStampToString(item.expire_at)}</Table.Cell>
                        <Table.Cell>{item.amount / 100}</Table.Cell>
                        <Table.Cell><ComplexUserLabel user={item.user}></ComplexUserLabel></Table.Cell>
                        <Table.Cell>{translatePaymentStatus(item.status)}</Table.Cell>
                        <Table.Cell>{item.description}</Table.Cell>
                        <Table.Cell><Button size="small" onClick={() => setShowingOrderId(item.order_id)}>查看详情</Button></Table.Cell>
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
        </>}
    </>;
};

export default RechargeOrderTab;
