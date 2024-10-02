import { useCallback, useEffect, useState } from "react";
import SelectUserModal, { SelectedUser } from "../../visual_programming/management/SelectUserModal";
import { RefundEntry } from "../client/types";
import onlineVMClient, { translateRefundStatus } from "../client/OnlineVMClient";
import RefundDetailModal from "../RefundDetailModal";
import { Button, Dimmer, Divider, Form, Loader, Pagination, Table } from "semantic-ui-react";
import { ComplexUserLabel, timeStampToString, UserSelectLabel } from "../../../common/Utils";
import ResolveAbnormalRefundModal from "./ResolveAbnormalRefundModal";

const RefundListTab: React.FC<{}> = () => {
    const [showingAbnormalRefund, setShowingAbnormalRefund] = useState<RefundEntry | null>(null);
    const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
    const [showSelectModal, setShowSelectModal] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<RefundEntry[]>([]);
    const [page, setPage] = useState(1);
    const [pageCount, setPageCount] = useState(0);
    const [showingRefundId, setShowingRefundId] = useState<number | null>(null);
    const loadPage = useCallback(async (page: number) => {
        try {
            setLoading(true);
            const resp = await onlineVMClient.getRefundList(page, selectedUser?.uid);
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
        {showingAbnormalRefund && <ResolveAbnormalRefundModal
            onClose={flag => {
                setShowingAbnormalRefund(null);
                if (flag) loadPage(1);
            }}
            refund={showingAbnormalRefund}
        ></ResolveAbnormalRefundModal>}
        {showingRefundId !== null && <RefundDetailModal
            onClose={() => setShowingRefundId(null)}
            refundId={showingRefundId}
        ></RefundDetailModal>}
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
                        <Table.HeaderCell>退款编号</Table.HeaderCell>
                        <Table.HeaderCell>退款发起时间</Table.HeaderCell>
                        <Table.HeaderCell>最后更新时间</Table.HeaderCell>
                        <Table.HeaderCell>退款金额</Table.HeaderCell>
                        <Table.HeaderCell>用户</Table.HeaderCell>
                        <Table.HeaderCell>退款状态</Table.HeaderCell>
                        <Table.HeaderCell>描述</Table.HeaderCell>
                        <Table.HeaderCell>操作</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data.map(item => <Table.Row key={item.refund_id}>
                        <Table.Cell>{item.refund_id}</Table.Cell>
                        <Table.Cell>{timeStampToString(item.create_time)}</Table.Cell>
                        <Table.Cell>{timeStampToString(item.last_update_time)}</Table.Cell>
                        <Table.Cell>{item.amount / 100}</Table.Cell>
                        <Table.Cell><ComplexUserLabel user={item.user}></ComplexUserLabel></Table.Cell>
                        <Table.Cell negative={item.refund_status === "error"}>{translateRefundStatus(item.refund_status)}</Table.Cell>
                        <Table.Cell>{item.description}</Table.Cell>
                        <Table.Cell>
                            <Button size="small" onClick={() => setShowingRefundId(item.refund_id)}>查看详情</Button>
                            {item.refund_status === "error" && <Button color="green" size="small" onClick={() => setShowingAbnormalRefund(item)}>手动处理异常</Button>
                            }
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
        </>}
    </>;

}

export default RefundListTab;
