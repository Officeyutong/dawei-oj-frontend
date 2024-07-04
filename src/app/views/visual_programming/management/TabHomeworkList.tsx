import { useEffect, useState } from "react";
import { HomeworkEditListEntry } from "../client/types";
import visualProgrammingClient from "../client/VisualProgrammingClient";
import { Button, Dimmer, Divider, Loader, Table } from "semantic-ui-react";
import { showConfirm } from "../../../dialogs/Dialog";
import { showSuccessPopup } from "../../../dialogs/Utils";
import HomeworkEdit from "./HomeworkEdit";

const TabHomeworkList: React.FC<{}> = () => {
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [data, setData] = useState<HomeworkEditListEntry[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const loadList = async () => {
        try {
            setLoading(true);
            const data = await visualProgrammingClient.getEditSideHomeworkList();
            setData(data);
            setLoaded(true);
        } catch { } finally { setLoading(false); }
    }
    const addHomework = () => {
        showConfirm("您确定要添加新的可视化作业吗", async () => {
            try {
                setLoading(true);
                const resp = await visualProgrammingClient.createHomework();
                setData([...data, resp]);
                window.scrollTo(0, document.body.scrollHeight);
                showSuccessPopup("添加完成");
            } catch { } finally { setLoading(false); }
        })
    }
    const removeHomework = (id: number, name: string) => {
        showConfirm(`您确定要删除编号为 ${id},名称为 ${name} 的可视化作业吗？`, async () => {
            try {
                setLoading(true);
                await visualProgrammingClient.deleteHomework(id);
                setData(data.filter(t => t.id !== id));
                showSuccessPopup("删除完成！");
            } catch { } finally { setLoading(false); }
        });
    }
    useEffect(() => {
        if (!loaded) loadList();
    }, [loaded]);
    return <>
        {editingId !== null && <HomeworkEdit id={editingId} closeCallback={(flag) => {
            setEditingId(null);
            if (flag) loadList();
        }}></HomeworkEdit>}
        {loading && <Dimmer active><Loader></Loader></Dimmer>}
        {!loaded && <div style={{ height: "400px" }}></div>}
        {loaded && <>
            <Button color="green" onClick={addHomework}>添加新作业</Button>
            <Divider></Divider>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>作业ID</Table.HeaderCell>
                        <Table.HeaderCell>作业名</Table.HeaderCell>
                        <Table.HeaderCell>操作</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data.map(item => <Table.Row key={item.id}>
                        <Table.Cell>{item.id}</Table.Cell>
                        <Table.Cell>{item.name}</Table.Cell>
                        <Table.Cell>
                            <Button size="small" color="green" onClick={() => setEditingId(item.id)}>编辑</Button>
                            <Button size="small" color="red" onClick={() => removeHomework(item.id, item.name)}>删除</Button>
                        </Table.Cell>
                    </Table.Row>)}
                </Table.Body>
            </Table>
        </>}
    </>
};

export default TabHomeworkList;
