import { useEffect, useMemo, useState } from "react";
import SelectTeamModal, { SelectedTeam } from "./SelectTeamModal";
import { PerTeamStatisticsResponse } from "../client/types";
import { Button, Dimmer, Divider, Form, Icon, Input, Label, Loader, Message, Modal, Table } from "semantic-ui-react";
import visualProgrammingClient from "../client/VisualProgrammingClient";
import UserLink from "../../utils/UserLink";
import UserDetailedView, { UserDetailedProps } from "./UserDetailedView";
import { useInputValue } from "../../../common/Utils";

const TabPerTeamStatistics: React.FC<{}> = () => {
    const [loading, setLoading] = useState(false);
    const [filterTeam, setFilterTeam] = useState<null | SelectedTeam>(null);
    const [data, setData] = useState<PerTeamStatisticsResponse | null>(null);
    const [showSelectTeamModal, setShowSelectTeamModal] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserDetailedProps | null>(null);

    const filterKeyword = useInputValue("");
    const displayLines = useMemo(() => {
        if (data === null) return [];
        return data.statistics.filter(t => t.user.real_name?.includes(filterKeyword.value) || t.user.username.includes(filterKeyword.value));
    }, [data, filterKeyword.value]);
    useEffect(() => {
        if (filterTeam !== null) {
            (async () => {
                try {
                    setLoading(true);
                    setData(await visualProgrammingClient.getPerTeamStatistics(filterTeam.id));
                } catch { } finally { setLoading(false); }
            })();
        }
    }, [filterTeam]);

    return <>
        {currentUser !== null && <Modal open size="large">
            <Modal.Header>
                查看用户 {currentUser.real_name || currentUser.username} 的可视化作业详情
            </Modal.Header>
            <Modal.Content>
                <UserDetailedView {...currentUser}></UserDetailedView>
            </Modal.Content>
            <Modal.Actions>
                <Button size="small" color="red" onClick={() => setCurrentUser(null)}>关闭</Button>
            </Modal.Actions>
        </Modal>}
        {showSelectTeamModal && <SelectTeamModal
            closeCallback={data => {
                if (data) setFilterTeam(data);
                setShowSelectTeamModal(false);
            }}
        ></SelectTeamModal>}
        {loading && <Dimmer active><Loader></Loader></Dimmer>}
        <Message info>
            <Message.Header>提示</Message.Header>
            <Message.Content>
                选择一个团队后，可以查看这个团队成员的可视化作业统计信息。
            </Message.Content>
        </Message>
        <Form>
            <Form.Field>
                <label>团队</label>
                {filterTeam === null ? <Button size="small" onClick={() => setShowSelectTeamModal(true)} color="green">选择团队</Button> : <Label onClick={() => setFilterTeam(null)} size="large" color="blue">#{filterTeam.id}. {filterTeam.name}<Icon name="delete"></Icon></Label>}
            </Form.Field>
        </Form>
        {data !== null && <>
            <Divider></Divider>
            <Form>
                <Form.Field>
                    <label>筛选用户</label>
                    <Input {...filterKeyword}></Input>
                </Form.Field>
            </Form>
            <Divider></Divider>
            <div style={{ overflowY: "scroll", overflowX: "scroll", maxHeight: "1200px" }}>
                <Table singleLine>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>用户</Table.HeaderCell>
                            {data.problems.map(item => <Table.HeaderCell key={item.id}>#{item.id}. {item.name}</Table.HeaderCell>)}
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {displayLines.map(line => <Table.Row style={{ cursor: "pointer" }} onClick={() => setCurrentUser(line.user)} key={line.user.uid}>
                            <Table.Cell>
                                <div> <UserLink data={line.user}></UserLink></div>
                                {line.user.real_name && <span style={{ color: "grey" }}>{line.user.real_name}</span>}
                            </Table.Cell>
                            {data.problems.map(problem => <Table.Cell key={problem.id} positive={line.data.includes(problem.id)}>
                                {line.data.includes(problem.id) ? <span style={{ color: "green" }}>已提交</span> : <span>未提交</span>}

                            </Table.Cell>)}
                        </Table.Row>)}
                    </Table.Body>
                </Table>
            </div>
        </>}
    </>
};

export default TabPerTeamStatistics;
