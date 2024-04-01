import React, { useEffect, useState } from "react";
import { AllUserListEntry, TeamGrantOperation } from "../../client/types";
import { Button, Dimmer, Divider, Form, Label, Loader, Modal, Table } from "semantic-ui-react";
import { adminClient } from "../../client/AdminClient";
import { showSuccessModal } from "../../../../dialogs/Dialog";
import UserLink from "../../../utils/UserLink";
import { Link } from "react-router-dom";
import { PUBLIC_URL } from "../../../../App";

interface TeamPermissionGrantProps {
    users: AllUserListEntry[];
    onClose: () => void;

};

const TeamPermissionGrantModal: React.FC<TeamPermissionGrantProps> = ({ onClose, users }) => {
    const [loading, setLoading] = useState(false);
    const [allTeams, setAllTeams] = useState<{ id: number; name: string }[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<undefined | number>(undefined);
    const [opt, setOpt] = useState<TeamGrantOperation>("grant");
    const [teamsMap, setTeamsMap] = useState<Map<number, { teamID: number; teamName: string }[]>>(new Map());
    useEffect(() => {
        if (!loaded) {
            (async () => {
                try {
                    setLoading(true);
                    const [teams, queryResult] = await Promise.all([adminClient.getAllTeams(), adminClient.batchQueryGrantedTeams(users.map(t => t.uid))]);
                    const map = new Map();
                    for (const [key, value] of Object.entries(queryResult)) {
                        map.set(parseInt(key), value);
                    }
                    setTeamsMap(map);
                    setAllTeams(teams);
                    setLoaded(true);
                    if (teams.length > 0) setSelectedTeam(teams[0].id);
                } catch { }
                finally {
                    setLoading(false);
                }
            })();
        }
    }, [loaded, users]);
    const apply = async () => {
        try {
            setLoading(true);
            await adminClient.grantTeamPermissions(users.map(t => t.uid), opt, selectedTeam);
            showSuccessModal("操作完成！");
        } catch { } finally {
            setLoading(false);
        }
    };
    return <div>
        <Modal size="small" open>
            <Modal.Header>对用户进行团队授权</Modal.Header>
            <Modal.Content>
                {loading && <Dimmer active><Loader></Loader></Dimmer>}
                <Form>
                    <Form.Group inline>
                        <label>操作</label>
                        <Form.Radio label="授予使用某个团队的权限" checked={opt === "grant"} onClick={() => setOpt("grant")}></Form.Radio>
                        <Form.Radio label="取消使用某个团队的权限" checked={opt === "cancel"} onClick={() => setOpt("cancel")}></Form.Radio>
                        <Form.Radio label="取消使用所有团队的权限" checked={opt === "cancel_all"} onClick={() => setOpt("cancel_all")}></Form.Radio>
                    </Form.Group>
                    <Form.Select value={selectedTeam} onChange={(_, d) => setSelectedTeam(d.value! as number)} label="对应团队" disabled={opt === "cancel_all"} options={
                        allTeams.map(t => ({ "text": t.name, value: t.id }))
                    }></Form.Select>
                </Form>
                <Divider></Divider>
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>用户</Table.HeaderCell>
                            <Table.HeaderCell>已授权团队</Table.HeaderCell>

                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {users.map(t => <Table.Row key={t.uid}>
                            <Table.Cell><UserLink data={t}></UserLink></Table.Cell>
                            <Table.Cell>
                                {(teamsMap.get(t.uid) || []).map(q => <Label key={q.teamID} as={Link} to={`${PUBLIC_URL}/team/${q.teamID}`}>{q.teamName}</Label>)}
                            </Table.Cell>
                        </Table.Row>)}
                    </Table.Body>
                </Table>
            </Modal.Content>
            <Modal.Actions>
                <Button disabled={loading} onClick={apply} color="green">应用</Button>
                <Button disabled={loading} onClick={onClose} color="red">取消</Button>
            </Modal.Actions>
        </Modal>
    </div>
};

export default TeamPermissionGrantModal;
