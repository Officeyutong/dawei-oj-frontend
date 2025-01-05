import { useEffect, useState } from "react";
import { VideoCourseDirectoryEntryWithoutSchema } from "../client/types";
import { videoRecordPlayClient } from "../client/VideoCourseClient";
import { Button, Dimmer, Divider, Loader, Table } from "semantic-ui-react";
import { showConfirm } from "../../../dialogs/Dialog";
import VideoCourseDirectoryAddOrModifyModal from "./VideoCourseDirectoryAddOrModifyModal";

const VideoCourseDirectoryManage: React.FC<{}> = () => {
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<VideoCourseDirectoryEntryWithoutSchema[]>([]);
    const [updatingEntry, setUpdatingEntry] = useState<VideoCourseDirectoryEntryWithoutSchema | null>(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const loadData = async () => {
        try {
            setLoading(true);
            const resp = await videoRecordPlayClient.getAllVideoCourseDirectories();
            setData(resp);
            setLoaded(true);
        } catch { } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        if (!loaded) loadData();
    }, [loaded]);

    const doDelete = (id: number) => showConfirm("此操作不可逆，确定吗？", async () => {
        try {
            setLoading(true);
            await videoRecordPlayClient.deleteVideoCourseDirectory(id);
            await loadData()
        } catch { } finally {
            setLoading(false);
        }
    })
    return <div>
        {showUpdateModal && <VideoCourseDirectoryAddOrModifyModal
            onClose={(flag) => {
                if (flag) loadData()
                setShowUpdateModal(false);
                setUpdatingEntry(null);
            }}
            currentData={updatingEntry}
        ></VideoCourseDirectoryAddOrModifyModal>}
        {loading && <Dimmer active page><Loader></Loader></Dimmer>}
        <Button color="green" onClick={() => setShowUpdateModal(true)}>添加课程目录</Button>
        <Divider></Divider>
        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>课程目录ID</Table.HeaderCell>
                    <Table.HeaderCell>标题</Table.HeaderCell>
                    <Table.HeaderCell>排序</Table.HeaderCell>
                    <Table.HeaderCell>操作</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {data.map(item => <Table.Row key={item.id}>
                    <Table.Cell>{item.id}</Table.Cell>
                    <Table.Cell>{item.title}</Table.Cell>
                    <Table.Cell>{item.order}</Table.Cell>
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

    </div>
};

export default VideoCourseDirectoryManage;
