import { useEffect, useMemo, useState } from "react";
import { Button, Dimmer, Divider, Form, Grid, Header, Loader, Message, Modal, Table } from "semantic-ui-react";
import { TeamListEntry } from "../../../team/client/types";
import teamClient from "../../../team/client/TeamClient";
import { adminClient } from "../../client/AdminClient";
import { showSuccessModal } from "../../../../dialogs/Dialog";

interface XiaoeTechBoundTeamEditModalProps {
    courseID: string;
    onClose: (success: boolean) => void;
};
const XiaoeTechBoundTeamEditModal: React.FC<XiaoeTechBoundTeamEditModalProps> = ({ onClose, courseID }) => {
    const [teams, setTeams] = useState<TeamListEntry[]>([]);
    const [usedTeams, setUsedTeams] = useState<number[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const teamsById = useMemo<Map<number, TeamListEntry>>(() => {
        const ret = new Map<number, TeamListEntry>();
        for (const entry of teams) {
            ret.set(entry.id, entry);
        }
        return ret;
    }, [teams]);
    const [commentUpdated, setCommentUpdated] = useState(false);
    const [comment, setComment] = useState("");
    useEffect(() => {
        if (!loaded) {
            (async () => {
                try {
                    setLoading(true);
                    const [d1, d2, d3] = await Promise.all([
                        teamClient.getTeamList(),
                        adminClient.getXiaoeTechCourseBoundTeams(courseID),
                        adminClient.getXiaoeTechCourseComment(courseID)
                    ]);
                    d1.list.sort((x, y) => x.id - y.id);
                    setTeams(d1.list);
                    setUsedTeams(d2);
                    setComment(d3);
                    setLoaded(true);
                } catch { } finally {
                    setLoading(false);
                }
            })();
        }
    }, [courseID, loaded]);
    const save = async () => {
        try {
            setLoading(true);
            await adminClient.setXiaoeTechCourseBoundTeams(courseID, usedTeams);
            if (commentUpdated) await adminClient.setXiaoeTechCourseComment(courseID, comment);
            showSuccessModal("保存完成");
            onClose(true);
        } catch { } finally {
            setLoading(false);
        }
    };
    return <Modal open>
        <Modal.Header>编辑课程 {courseID} 的备注和所绑定的团队</Modal.Header>
        <Modal.Content>
            {loading && <Dimmer active><Loader></Loader></Dimmer>}
            <Grid columns={2}>
                <Grid.Column>
                    <Header as="h3">已选中团队</Header>
                    <div style={{ overflowY: "scroll", maxHeight: "400px" }}>
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>团队ID</Table.HeaderCell>
                                    <Table.HeaderCell>团队名</Table.HeaderCell>
                                    <Table.HeaderCell>操作</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {usedTeams.map(item => {
                                    const row = teamsById.get(item)!;
                                    return <Table.Row key={item}>
                                        <Table.Cell>{row.id}</Table.Cell>
                                        <Table.Cell>{row.name}</Table.Cell>
                                        <Table.Cell><Button color="red" size="small" onClick={() => setUsedTeams(c => c.filter(t => t !== item))}>删除</Button></Table.Cell>
                                    </Table.Row>;
                                })}
                            </Table.Body>
                        </Table></div>
                </Grid.Column>
                <Grid.Column>
                    <Header as="h3">团队列表</Header>
                    <div style={{ overflowY: "scroll", maxHeight: "400px" }}><Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>团队ID</Table.HeaderCell>
                                <Table.HeaderCell>团队名</Table.HeaderCell>
                                <Table.HeaderCell>操作</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {teams.map(item => <Table.Row key={item.id}>
                                <Table.Cell>{item.id}</Table.Cell>
                                <Table.Cell>{item.name}</Table.Cell>
                                <Table.Cell>
                                    {usedTeams.includes(item.id) ? <Button color="red" size="small" onClick={() => setUsedTeams(usedTeams.filter(t => t !== item.id))}>删除</Button> : <Button color="green" size="small" onClick={() => setUsedTeams([...usedTeams, item.id])}>加入</Button>}
                                </Table.Cell>
                            </Table.Row>)}
                        </Table.Body>
                    </Table></div>
                </Grid.Column>
                <Divider vertical></Divider>
            </Grid>
            <Divider></Divider>
            <Form>
                <Form.Input label="课程备注" value={comment} onChange={(_, e) => { setComment(e.value); setCommentUpdated(true); }}></Form.Input>
            </Form>
            <Message positive>
                <Message.Header>提示</Message.Header>
                <Message.Content>课程备注是一个保存在OJ一侧的，对某个小鹅通课程做出的额外备注，用来提醒管理人员这个课程是否在使用等。课程备注可以由管理员编辑。</Message.Content>
            </Message>
        </Modal.Content>
        <Modal.Actions>
            <Button color="green" loading={loading} onClick={save}>保存</Button>
            <Button color="red" onClick={() => onClose(false)} loading={loading}>关闭</Button>
        </Modal.Actions>
    </Modal>
};

export default XiaoeTechBoundTeamEditModal;
