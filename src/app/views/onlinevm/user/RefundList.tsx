import { useSelector } from "react-redux";
import { Button, Dimmer, Header, Loader, Pagination, Table } from "semantic-ui-react";
import { StateType } from "../../../states/Manager";
import { useCallback, useEffect, useState } from "react";
import { RefundEntry } from "../client/types";
import onlineVMClient, { translateRefundStatus } from "../client/OnlineVMClient";
import { timeStampToString, useDocumentTitle } from "../../../common/Utils";
import RefundDetailModal from "../RefundDetailModal";

const RefundList: React.FC<{}> = () => {

    const selfUid = useSelector((s: StateType) => s.userState.userData.uid);
    const initialReqDone = useSelector((s: StateType) => s.userState.initialRequestDone);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<RefundEntry[]>([]);
    const [page, setPage] = useState(1);
    const [pageCount, setPageCount] = useState(0);
    const [showingRefund, setShowingRefund] = useState<RefundEntry | null>(null);
    const loadPage = useCallback(async (page: number) => {
        try {
            setLoading(true);
            const resp = await onlineVMClient.getRefundList(page, selfUid);
            setPageCount(resp.pageCount);
            setPage(page);
            setData(resp.data);
            setLoaded(true);
        } catch { } finally {
            setLoading(false);
        }
    }, [selfUid])
    useEffect(() => {
        if (!loaded && initialReqDone) loadPage(1);
    }, [initialReqDone, loadPage, loaded])
    useDocumentTitle("退款记录");
    return <>
        <Header as="h2">
            退款列表
        </Header>
        {showingRefund !== null && <RefundDetailModal
            onClose={() => setShowingRefund(null)}
            refundId={showingRefund.refund_id}
            uid={selfUid}
        ></RefundDetailModal>}
        {loading && <Dimmer active><Loader></Loader></Dimmer>}
        {loaded && <>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>退款编号</Table.HeaderCell>
                        <Table.HeaderCell>发起时间</Table.HeaderCell>
                        <Table.HeaderCell>退款金额</Table.HeaderCell>
                        <Table.HeaderCell>状态</Table.HeaderCell>
                        <Table.HeaderCell>最后更新时间</Table.HeaderCell>
                        <Table.HeaderCell>操作</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data.map(item => <Table.Row key={item.refund_id}>
                        <Table.Cell>{item.refund_id}</Table.Cell>
                        <Table.Cell>{timeStampToString(item.create_time)}</Table.Cell>
                        <Table.Cell>{(item.amount / 100).toFixed(2)}</Table.Cell>
                        <Table.Cell negative={item.refund_status === "error"}>{translateRefundStatus(item.refund_status)}</Table.Cell>
                        <Table.Cell>{timeStampToString(item.last_update_time)}</Table.Cell>
                        <Table.Cell>
                            <Button size="small" onClick={() => setShowingRefund(item)}>查看详情</Button>
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

export default RefundList;
