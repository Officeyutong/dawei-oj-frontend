import { useEffect, useState } from "react";
import { VideoCourseEntryWithoutSchema } from "../client/types";
import { videoRecordPlayClient } from "../client/VideoCourseClient";
import { Button, Dimmer, Divider, Loader, Pagination, Table } from "semantic-ui-react";
import { showConfirm } from "../../../dialogs/Dialog";
import VideoCourseAddOrModifyModal from "./VideoCourseAddOrModifyModal";

const VideoCourseManage: React.FC<{}> = () => {
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<VideoCourseEntryWithoutSchema[]>([]);
    const [page, setPage] = useState(1);
    const [pageCount, setPageCount] = useState(1);
    const [updatingEntry, setUpdatingEntry] = useState<VideoCourseEntryWithoutSchema | null>(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const loadPage = async (page: number) => {
        try {
            setLoading(true);
            const resp = await videoRecordPlayClient.getAllCourses(page);
            setPageCount(resp.pageCount);
            setData(resp.data);
            setPage(page);
            setLoaded(true);
        } catch { } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        if (!loaded) loadPage(1);
    }, [loaded]);

    const doDelete = (id: number) => showConfirm("此操作不可逆，确定吗？", async () => {
        try {
            setLoading(true);
            await videoRecordPlayClient.deleteVideoCourse(id);
            await loadPage(page);
        } catch { } finally {
            setLoading(false);
        }
    })
    return <div>
        {showUpdateModal && <VideoCourseAddOrModifyModal
            onClose={(flag) => {
                if (flag) loadPage(page);
                setShowUpdateModal(false);
                setUpdatingEntry(null);
            }}
            currentData={updatingEntry}
        ></VideoCourseAddOrModifyModal>}
        {loading && <Dimmer active page><Loader></Loader></Dimmer>}
        <Button color="green" onClick={() => setShowUpdateModal(true)}>添加视频课</Button>
        <Divider></Divider>
        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>课程ID</Table.HeaderCell>
                    <Table.HeaderCell>标题</Table.HeaderCell>
                    <Table.HeaderCell>操作</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {data.map(item => <Table.Row key={item.id}>
                    <Table.Cell>{item.id}</Table.Cell>
                    <Table.Cell>{item.title}</Table.Cell>
                    <Table.Cell>
                        <Button size="small" onClick={() => {
                            setUpdatingEntry(item);
                            setShowUpdateModal(true);
                        }} color="green">修改</Button>
                        <Button size="small" onClick={() => doDelete(item.id)} color="red">删除</Button>
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
    </div>
};

export default VideoCourseManage;
