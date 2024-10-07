import { useCallback, useEffect, useState } from "react";
import { OnlineVMOrderEntry } from "../client/types";
import onlineVMClient, { translateVMOrderStatus } from "../client/OnlineVMClient";
import SelectUserModal, { SelectedUser } from "../../visual_programming/management/SelectUserModal";
import VMOrderDetailModal from "../VMOrderDetailModal";
import { Button, Dimmer, Divider, Form, Loader, Pagination, Table } from "semantic-ui-react";
import { ComplexUserLabel, timeStampToString, UserSelectLabel } from "../../../common/Utils";
import { showConfirm } from "../../../dialogs/Dialog";
import { showSuccessPopup } from "../../../dialogs/Utils";
import { Link } from "react-router-dom";
import { PUBLIC_URL } from "../../../App";

const VMOrderListTab: React.FC<{}> = () => {
    const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
    const [showSelectModal, setShowSelectModal] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<OnlineVMOrderEntry[]>([]);
    const [page, setPage] = useState(1);
    const [pageCount, setPageCount] = useState(0);
    const [showingOrderId, setShowingOrderId] = useState<number | null>(null);
    const loadPage = useCallback(async (page: number) => {
        try {
            setLoading(true);
            const resp = await onlineVMClient.getVMOrderList(page, selectedUser?.uid);
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
    const doDestroy = (orderId: number) => showConfirm("您确定要退还此台虚拟机吗？一旦退还，这台虚拟机所有的数据都会被删除，并且无法找回。", async () => {
        try {
            setLoading(true);
            await onlineVMClient.destroyVM(orderId);
            await loadPage(page);
            showSuccessPopup("操作完成！");
        } catch { } finally {
            setLoading(false);
        }
    });
    return <>
        {showingOrderId !== null && <VMOrderDetailModal onClose={() => setShowingOrderId(null)} orderId={showingOrderId} ></VMOrderDetailModal>}
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
                        <Table.HeaderCell>创建时间</Table.HeaderCell>
                        <Table.HeaderCell>最后更新时间</Table.HeaderCell>
                        <Table.HeaderCell>用户</Table.HeaderCell>
                        <Table.HeaderCell>订单状态</Table.HeaderCell>
                        <Table.HeaderCell>产品名</Table.HeaderCell>
                        <Table.HeaderCell>操作</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data.map(item => <Table.Row key={item.order_id}>
                        <Table.Cell>{item.order_id}</Table.Cell>
                        <Table.Cell>{timeStampToString(item.create_time)}</Table.Cell>
                        <Table.Cell>{timeStampToString(item.last_update_time)}</Table.Cell>
                        <Table.Cell><ComplexUserLabel user={item.user}></ComplexUserLabel></Table.Cell>
                        <Table.Cell>{translateVMOrderStatus(item.status)}</Table.Cell>
                        <Table.Cell>{item.product.name}</Table.Cell>
                        <Table.Cell>
                            <Button size="small" onClick={() => setShowingOrderId(item.order_id)}>查看详情</Button>
                            <Button small disabled={item.status === 'destroyed'} as={Link} to={`${PUBLIC_URL}/onlinevm/vm_page/${item.order_id}`}>连接虚拟机</Button>
                            {item.status === "available" && <Button size="small" onClick={() => doDestroy(item.order_id)} color="red">退还</Button>}
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
};

export default VMOrderListTab;
