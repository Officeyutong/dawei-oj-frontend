import { Fragment, useCallback, useEffect, useState } from "react";
import { Button, Dimmer, Loader, Modal, Pagination, Table } from "semantic-ui-react"
import userClient from "../client/UserClient";
import { CreditHistoryEntry } from "../client/types";
import { timeStampToString } from "../../../common/Utils";

const UserCreditHistory: React.FC<{ uid: number; onClose: () => void; }> = ({ uid, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<CreditHistoryEntry[]>([]);
    const [page, setPage] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const loadPage = useCallback(async (page: number) => {
        try {
            setLoading(true);
            const resp = await userClient.getUserCreditHistory(uid, page)
            setPageCount(resp.pageCount);
            setData(resp.data);
            setPage(page);
            setLoaded(true);
        } catch (e: any) { console.error(e); }
        finally {
            setLoading(false);
        }
    }, [uid])
    useEffect(() => {
        if (!loaded) {
            loadPage(1)
        }
    }, [loadPage, loaded])
    return <Modal open size="large">
        <Modal.Header>查看用户积分历史</Modal.Header>
        <Modal.Content>
            {loading &&
                <Dimmer active={loading}>
                    <Loader>加载中</Loader>
                </Dimmer>}
            {loaded && <Fragment>
                <Table textAlign="center">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>创建时间</Table.HeaderCell>
                            <Table.HeaderCell>变化</Table.HeaderCell>
                            <Table.HeaderCell>原因</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {data.map((x, idx) => <Table.Row key={idx}>
                            <Table.Cell>{timeStampToString(x.createTime)}</Table.Cell>
                            <Table.Cell>{x.value}</Table.Cell>
                            <Table.Cell>{x.reason}</Table.Cell>
                        </Table.Row>)}
                    </Table.Body>
                </Table>
                <div style={{ display: "flex", justifyContent: 'center', alignItems: "center" }}>
                    <Pagination
                        totalPages={Math.max(pageCount, 1)}
                        activePage={page}
                        onPageChange={(_, d) => loadPage(d.activePage as number)}
                    ></Pagination>
                </div>

            </Fragment>}
        </Modal.Content>
        <Modal.Actions>
            <Button color="red" onClick={onClose} disabled={loading} loading={loading}>关闭</Button>
        </Modal.Actions>
    </Modal>
};

export default UserCreditHistory;
