import { useCallback, useEffect, useState } from "react";
import CreateVMModal from "./CreateVMModal";
import { Button, Dimmer, Divider, Header, Icon, Loader, Pagination, Table } from "semantic-ui-react";
import { useSelector } from "react-redux";
import { StateType } from "../../../states/Manager";
import { OnlineVMOrderEntry } from "../client/types";
import onlineVMClient, { translateVMOrderStatus } from "../client/OnlineVMClient";
import { timeStampToString, useDocumentTitle, useNowTime } from "../../../common/Utils";
import { DateTime } from "luxon";
import VMOrderDetailModal from "../VMOrderDetailModal";
import { showConfirm } from "../../../dialogs/Dialog";
import { showSuccessPopup } from "../../../dialogs/Utils";
import { Link } from "react-router-dom";
import { PUBLIC_URL } from "../../../App";

const VMOrderList: React.FC<{}> = () => {
    const [showCreateVMModal, setShowCreateVMModal] = useState(false);
    const selfUid = useSelector((s: StateType) => s.userState.userData.uid);
    const initialReqDone = useSelector((s: StateType) => s.userState.initialRequestDone);
    const [loaded, setLoaded] = useState(false);
    const [loadingText, setLoadingText] = useState<string>('')
    const [data, setData] = useState<OnlineVMOrderEntry[]>([]);
    const [page, setPage] = useState(1);
    const [pageCount, setPageCount] = useState(0);
    const [showingOrder, setShowingOrder] = useState<OnlineVMOrderEntry | null>(null);
    const loadPage = useCallback(async (page: number) => {
        try {
            setLoadingText('加载中');
            const resp = await onlineVMClient.getVMOrderList(page, selfUid);
            setPageCount(resp.pageCount);
            setPage(page);
            setData(resp.data);
            setLoaded(true);
        } catch { } finally {
            setLoadingText('');
        }
    }, [selfUid])
    useEffect(() => {
        if (!loaded && initialReqDone) loadPage(1);
    }, [initialReqDone, loadPage, loaded])
    const nowTime = useNowTime();
    useDocumentTitle("虚拟机订单列表");
    const doDestroy = (orderId: number) => showConfirm("您确定要退还此台虚拟机吗？一旦退还，这台虚拟机所有的数据都会被删除，并且无法找回。退还后，虚拟机不会再计费。", async () => {
        try {
            setLoadingText('正在退还虚拟机，请勿刷新网页')
            await onlineVMClient.destroyVM(orderId);
            await loadPage(page);
            showSuccessPopup("操作完成！");
        } catch { } finally {
            setLoadingText('')
        }
    });

    return <>
        <Header as="h2">虚拟机订单列表</Header>
        {showingOrder !== null && <VMOrderDetailModal
            onClose={() => setShowingOrder(null)}
            orderId={showingOrder.order_id}
            uid={selfUid}
        ></VMOrderDetailModal>}
        {loadingText !== '' && <Dimmer active page>
            <Loader>{loadingText}</Loader>
        </Dimmer>}
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
                    {data.map(item => {
                        const timeDiff = nowTime.diff(DateTime.fromSeconds(item.create_time));
                        const creating = timeDiff.as("seconds") < 30; // 创建后三十秒才可以连接

                        return <Table.Row key={item.order_id}>
                            <Table.Cell>{item.order_id}</Table.Cell>
                            <Table.Cell>{timeStampToString(item.create_time)}</Table.Cell>
                            <Table.Cell>{item.product.name}</Table.Cell>
                            <Table.Cell negative={item.status === "error"}>{creating ? <><Icon name="spinner" loading></Icon>创建中</> : translateVMOrderStatus(item.status)}</Table.Cell>
                            <Table.Cell>{item.destroy_time !== null ? Math.ceil(DateTime.fromSeconds(item.destroy_time).diff(DateTime.fromSeconds(item.create_time)).as("seconds") / 3600) : Math.ceil(nowTime.diff(DateTime.fromSeconds(item.create_time)).as("seconds") / 3600)}小时</Table.Cell>
                            <Table.Cell>
                                <Button size="small" onClick={() => setShowingOrder(item)}>查看详情</Button>
                                <Button size="small" disabled={item.status === 'destroyed' || creating} as={Link} to={`${PUBLIC_URL}/onlinevm/vm_page/${item.order_id}`}>连接虚拟机</Button>
                                {item.status === "available" && <Button disabled={creating} size="small" onClick={() => doDestroy(item.order_id)} color="red">退还</Button>}
                            </Table.Cell>
                        </Table.Row>;
                    })}
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
