import { useCallback, useEffect, useState } from "react";
import { TransactionEntry } from "../client/types";
import { StateType } from "../../../states/Manager";
import { useSelector } from "react-redux";
import onlineVMClient from "../client/OnlineVMClient";
import { Button, Dimmer, Header, Loader, Pagination, Table } from "semantic-ui-react";
import { timeStampToString, useDocumentTitle } from "../../../common/Utils";
import TransactionDetailModal from "../TransactionDetailModal";

const BalanceChangeList: React.FC<{}> = () => {
    useDocumentTitle("余额变动记录")
    const selfUid = useSelector((s: StateType) => s.userState.userData.uid);
    const initialReqDone = useSelector((s: StateType) => s.userState.initialRequestDone);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<TransactionEntry[]>([]);
    const [page, setPage] = useState(1);
    const [pageCount, setPageCount] = useState(0);
    const [showingTransactionId, setShowingTransactionId] = useState<number | null>(null);
    const loadPage = useCallback(async (page: number) => {
        try {
            setLoading(true);
            const resp = await onlineVMClient.getTransactionList(page, selfUid);
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
    return <>
        <Header as="h2">余额变动记录</Header>
        {showingTransactionId !== null && <TransactionDetailModal onClose={() => setShowingTransactionId(null)} uid={selfUid} transactionId={showingTransactionId} ></TransactionDetailModal>}
        {loading && <Dimmer active><Loader></Loader></Dimmer>}
        {loaded && <>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>交易编号</Table.HeaderCell>
                        <Table.HeaderCell>变动时间</Table.HeaderCell>
                        <Table.HeaderCell>变动数量</Table.HeaderCell>
                        <Table.HeaderCell>描述</Table.HeaderCell>
                        <Table.HeaderCell>操作</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data.map(item => <Table.Row key={item.id}>
                        <Table.Cell>{item.id}</Table.Cell>
                        <Table.Cell>{timeStampToString(item.time)}</Table.Cell>
                        <Table.Cell>{(item.amount / 100).toFixed(2)}</Table.Cell>
                        <Table.Cell>{item.description}</Table.Cell>
                        <Table.Cell><Button size="small" onClick={() => setShowingTransactionId(item.id)}>查看详情</Button></Table.Cell>
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

export default BalanceChangeList;
