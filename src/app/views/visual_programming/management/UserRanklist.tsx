import { useEffect, useState } from "react";
import { RanklistEntry } from "../client/types";
import visualProgrammingClient from "../client/VisualProgrammingClient";
import { Button, Dimmer, Loader, Pagination, Table } from "semantic-ui-react";
import UserLink from "../../utils/UserLink";

const UserRanklist: React.FC<{}> = () => {
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [data, setData] = useState<RanklistEntry[]>([]);
    const [pageCount, setPageCount] = useState<number>(0);
    const [page, setPage] = useState(0);
    const loadPage = async (page: number) => {
        try {
            setLoading(true);
            const data = await visualProgrammingClient.getHomeworkRanklist(page);
            setData(data.data);
            setPageCount(data.pageCount);
            setPage(page);
            setLoaded(true);
        } catch { } finally { setLoading(false); }
    }
    useEffect(() => {
        if (!loaded) loadPage(1);
    }, [loaded])

    return <>
        {!loaded && <div style={{ height: "400px" }}></div>}
        {loading && <Dimmer active><Loader></Loader></Dimmer>}
        {loaded && <>

            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>
                            用户名
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            姓名
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            提交过的可视化作业数
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            操作
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data.map(item=><Table.Row key={item.uid}>
                        <Table.Cell><UserLink data={item}></UserLink></Table.Cell>
                        <Table.Cell>{item.real_name || "/"}</Table.Cell>
                        <Table.Cell>{item.submission_count}</Table.Cell>
                        <Table.Cell>
                            <Button size="small" color="green">查看详情</Button>
                        </Table.Cell>
                    </Table.Row>)}
                </Table.Body>
            </Table>
            <div style={{ display: "flex", justifyContent: "space-around" }}><Pagination activePage={page} totalPages={pageCount} onPageChange={(_, d) => loadPage(d.activePage as number)}></Pagination></div>
        </>}
    </>
}

export default UserRanklist;

