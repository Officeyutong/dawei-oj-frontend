import { useCallback, useEffect, useState } from "react";
import CreateVMModal from "./CreateVMModal";
import { Button, Dimmer, Divider, Header, Loader, Pagination, Table } from "semantic-ui-react";
import { useSelector } from "react-redux";
import { StateType } from "../../../states/Manager";
import { OnlineVMOrderEntry } from "../client/types";
import onlineVMClient, { translateVMOrderStatus } from "../client/OnlineVMClient";
import { timeStampToString, useNowTime } from "../../../common/Utils";
import { DateTime } from "luxon";
import VMOrderDetailModal from "../VMOrderDetailModal";
import { showErrorModal } from "../../../dialogs/Dialog";

const VMOrderList: React.FC<{}> = () => {
    const [showCreateVMModal, setShowCreateVMModal] = useState(false);
    const selfUid = useSelector((s: StateType) => s.userState.userData.uid);
    const initialReqDone = useSelector((s: StateType) => s.userState.initialRequestDone);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<OnlineVMOrderEntry[]>([]);
    const [page, setPage] = useState(1);
    const [pageCount, setPageCount] = useState(0);
    const [showingOrder, setShowingOrder] = useState<OnlineVMOrderEntry | null>(null);
    const loadPage = useCallback(async (page: number) => {
        try {
            setLoading(true);
            const resp = await onlineVMClient.getVMOrderList(page, selfUid);
            setPageCount(resp.pageCount);
            setPage(page);
            setData(resp.data);
            setLoaded(true);
        } catch { } finally {
            setLoading(false);
        }
    }, [selfUid])
    const handleOpenVM = async (item: OnlineVMOrderEntry) => {
        try {
            setLoading(true);
            window.location.href = `/onlinevm/vm_page/${item.order_id}/${item.create_time}`

        } catch {
            showErrorModal('连接失败')
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        if (!loaded && initialReqDone) loadPage(1);
    }, [initialReqDone, loadPage, loaded])
    const nowTime = useNowTime();
    return <>
        <Header as="h2">虚拟机订单列表</Header>
        {showingOrder !== null && <VMOrderDetailModal
            onClose={() => setShowingOrder(null)}
            orderId={showingOrder.order_id}
            uid={selfUid}
        ></VMOrderDetailModal>}
        {loading && <Dimmer active><Loader></Loader></Dimmer>}
        {showCreateVMModal && <CreateVMModal onClose={flag => {
            if (flag) loadPage(1);
            setShowCreateVMModal(false);
        }}></CreateVMModal>}
        <Button color="green" onClick={() => setShowCreateVMModal(true)}>创建虚拟机</Button>
        <Divider></Divider>
        {loaded && <>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>订单编号</Table.HeaderCell>
                        <Table.HeaderCell>创建时间</Table.HeaderCell>
                        <Table.HeaderCell>商品名</Table.HeaderCell>
                        <Table.HeaderCell>状态</Table.HeaderCell>
                        <Table.HeaderCell>已计费时长</Table.HeaderCell>
                        <Table.HeaderCell>操作</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data.map(item => <Table.Row key={item.order_id}>
                        <Table.Cell>{item.order_id}</Table.Cell>
                        <Table.Cell>{timeStampToString(item.create_time)}</Table.Cell>
                        <Table.Cell>{item.product.name}</Table.Cell>
                        <Table.Cell negative={item.status === "error"}>{translateVMOrderStatus(item.status)}</Table.Cell>
                        <Table.Cell>{Math.ceil(nowTime.diff(DateTime.fromSeconds(item.create_time)).as("seconds") / 3600)}小时</Table.Cell>
                        <Table.Cell>
                            <Button size="small" onClick={() => setShowingOrder(item)}>查看详情</Button>
                            <Button size='small' onClick={() => handleOpenVM(item)}>打开虚拟机</Button>
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
    </>
};

export default VMOrderList
