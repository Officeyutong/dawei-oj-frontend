import { useState } from "react";
import { TeamMemberLookupEntry } from "../client/types";
import teamClient from "../client/TeamClient";
import { Button, Dimmer, Divider, Form, Loader, Modal, Table } from "semantic-ui-react";

interface TeamMemberLookupProps {
    teamID: number;
    onUpdate: (entry: TeamMemberLookupEntry) => void;
    onClose: () => void;
}

const TeamMemberLookupModal: React.FC<TeamMemberLookupProps> = ({ teamID, onClose, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [data, setData] = useState<TeamMemberLookupEntry[]>([]);

    const refresh = async () => {
        try {
            setLoading(true);
            const data = await teamClient.lookupTeamMembers(teamID, keyword);
            setData(data);
        } catch { } finally {
            setLoading(false);
        }
    };
    return <Modal open>
        <Modal.Header>
            搜索团队内用户
        </Modal.Header>
        <Modal.Content>
            {loading && <Dimmer active><Loader></Loader></Dimmer>}
            <Form>
                <Form.Input value={keyword} label="搜索关键词" onChange={(_, d) => setKeyword(d.value)}></Form.Input>
                <Form.Button color="green" onClick={refresh}>刷新</Form.Button>
            </Form>
            <Divider></Divider>
            <div style={{ overflowY: "scroll", maxHeight: "500px" }}>
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>用户ID</Table.HeaderCell>
                            <Table.HeaderCell>用户名</Table.HeaderCell>
                            <Table.HeaderCell>邮箱</Table.HeaderCell>
                            <Table.HeaderCell>手机号</Table.HeaderCell>
                            <Table.HeaderCell>姓名</Table.HeaderCell>
                            <Table.HeaderCell>操作</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {data.map((item) => <Table.Row key={item.uid}>
                            <Table.Cell>{item.uid}</Table.Cell>
                            <Table.Cell>{item.username}</Table.Cell>
                            <Table.Cell>{item.email}</Table.Cell>
                            <Table.Cell>{item.phoneNumber || "<未设置>"}</Table.Cell>
                            <Table.Cell>{item.realName || "<未设置>"}</Table.Cell>
                            <Table.Cell><Button size="tiny" color="green" onClick={() => {
                                onUpdate(item);
                                onClose();
                            }}>选中</Button></Table.Cell>
                        </Table.Row>)}
                    </Table.Body>
                </Table>
            </div>
        </Modal.Content>
        <Modal.Actions>
            <Button colot="red" onClick={onClose}>关闭</Button>
        </Modal.Actions>
    </Modal>
};

export default TeamMemberLookupModal;
