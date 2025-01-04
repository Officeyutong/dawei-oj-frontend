import { useEffect, useState } from "react";
import { VideoClipEntry } from "../client/types";
import { videoRecordPlayClient } from "../client/VideoCourseClient";
import { Button, Dimmer, Divider, Loader, Pagination, Table } from "semantic-ui-react";
import VideoClipAddOrModifyModal from "./VideoClipAddOrModifyModal";
import { showConfirm, showErrorModal, showSuccessModal } from "../../../dialogs/Dialog";

const VideoClipManage: React.FC<{}> = () => {
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<VideoClipEntry[]>([]);
    const [page, setPage] = useState(1);
    const [pageCount, setPageCount] = useState(1);
    const [updatingEntry, setUpdatingEntry] = useState<VideoClipEntry | null>(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const loadPage = async (page: number) => {
        try {
            setLoading(true);
            const resp = await videoRecordPlayClient.getAllClips(page);
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
    const doVerify = async () => {
        try {
            setLoading(true);
            const resp = await videoRecordPlayClient.verifyVideoClipPaths();
            if (resp.length === 0) {
                showSuccessModal("所有切片的OSS路径均正确");
            } else {
                showErrorModal(`以下切片的OSS路径非法：${JSON.stringify(resp.map(s => s.id))}`)
            }
        } catch { } finally {
            setLoading(false);
        }
    };
    const doDelete = (id: number) => showConfirm("此操作不可逆，确定吗？", async () => {
        try {
            setLoading(true);
            await videoRecordPlayClient.deleteVideoClip(id);
            await loadPage(page);
        } catch { } finally {
            setLoading(false);
        }
    })
    return <div>
        {showUpdateModal && <VideoClipAddOrModifyModal
            onClose={(flag) => {
                if (flag) loadPage(page);
                setShowUpdateModal(false);
                setUpdatingEntry(null);
            }}
            currentData={updatingEntry}
        ></VideoClipAddOrModifyModal>}
        {loading && <Dimmer active page><Loader></Loader></Dimmer>}
        <Button color="green" onClick={() => setShowUpdateModal(true)}>添加切片</Button>
        <Button color="blue" onClick={doVerify}>验证切片OSS路径合法性</Button>
        <Divider></Divider>
        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>切片ID</Table.HeaderCell>
                    <Table.HeaderCell>OSS路径</Table.HeaderCell>
                    <Table.HeaderCell>描述</Table.HeaderCell>
                    <Table.HeaderCell>操作</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {data.map(item => <Table.Row key={item.id}>
                    <Table.Cell>{item.id}</Table.Cell>
                    <Table.Cell>{item.oss_path}</Table.Cell>
                    <Table.Cell>{item.description}</Table.Cell>
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

export default VideoClipManage;
