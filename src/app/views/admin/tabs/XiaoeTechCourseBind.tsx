import { useEffect, useState } from "react";
import { adminClient } from "../client/AdminClient";
import { XiaoeTechCourseEntry } from "../client/types";
import { Button, Dimmer, Divider, Loader, Table } from "semantic-ui-react";
import { showSuccessModal } from "../../../dialogs/Dialog";
import XiaoeTechBoundTeamEditModal from "./modals/XiaoeTechBoundTeamEdit";

const XiaoeTechCourseBind: React.FC<{}> = () => {
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [data, setData] = useState<XiaoeTechCourseEntry[]>([]);
    const [editingCourse, setEditingCourse] = useState<string | null>(null);
    const refreshList = async () => {
        try {
            setLoading(true);
            setData(await adminClient.getXiaoeTechCourses());
            setLoaded(true);
        } catch {

        } finally {
            setLoading(false);
        }
    };
    const syncXiaoeTechCourses = async () => {
        try {
            setLoading(true);
            await adminClient.syncXiaoeTechCourses();
            setData(await adminClient.getXiaoeTechCourses());
            showSuccessModal("操作完成");
        } catch { } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        if (!loaded) {
            refreshList();
        }
    }, [loaded]);
    return <div>
        {editingCourse !== null && <XiaoeTechBoundTeamEditModal courseID={editingCourse} onClose={() => setEditingCourse(null)}></XiaoeTechBoundTeamEditModal>}
        {loading && <Dimmer active><Loader></Loader></Dimmer>}
        <div><Button color="green" onClick={syncXiaoeTechCourses}>同步小鹅通课程列表</Button></div>
        <Divider></Divider>
        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>小鹅通资源ID</Table.HeaderCell>
                    <Table.HeaderCell>小鹅通商品名</Table.HeaderCell>
                    <Table.HeaderCell>已绑定团队数目</Table.HeaderCell>
                    <Table.HeaderCell>操作</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {data.map(item => <Table.Row key={item.xiaoe_tech_course_id}>
                    <Table.Cell>{item.xiaoe_tech_course_id}</Table.Cell>
                    <Table.Cell>{item.name}</Table.Cell>
                    <Table.Cell>{item.bound_team_count}</Table.Cell>
                    <Table.Cell><Button onClick={() => setEditingCourse(item.xiaoe_tech_course_id)} color="green">编辑</Button></Table.Cell>
                </Table.Row>)}
            </Table.Body>
        </Table>
    </div>
};

export default XiaoeTechCourseBind;
