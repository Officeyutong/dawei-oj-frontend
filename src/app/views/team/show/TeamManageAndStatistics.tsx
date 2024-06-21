import { useEffect, useState } from "react";
import { Button, Dimmer, Input, Loader, Modal, Tab, Table } from "semantic-ui-react";
import { TeamDetail, TeamMemberProblemsetStatistics } from "../client/types";
import BatchAddMembersDialog from "./BatchAddMembersDialog";
import teamClient from "../client/TeamClient";

import UserLink from "../../utils/UserLink";
import { PUBLIC_URL } from "../../../App";
import { Link } from "react-router-dom";
import TeamStatisticsView from "./TeamStatisticsView";
import ShowMemberDetailedStatistics from "./ShowMemberDetailedStatistics";
import { useInputValue } from "../../../common/Utils";

interface TeamManageProps {
    team: number;
    reloadCallback: () => void;
    teamMembers: TeamDetail["members"];
};

const TeamManage: React.FC<React.PropsWithChildren<TeamManageProps>> = (props) => {
    const [showBatchAddModal, setShowBatchAddModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [extraStatistics, setExtraStatistics] = useState<TeamMemberProblemsetStatistics | null>(null);
    const [viewingProblemsetDetailUid, setViewingProblemsetDetailUid] = useState<number | null>(null);
    const statisticsFilteringKeyword = useInputValue("");
    const [filteredUserStatistics, setFilteredUserStatistics] = useState<TeamMemberProblemsetStatistics["user_data"]>([]);
    useEffect(() => {
        if (!loaded) (async () => {
            try {
                setLoading(true);
                const data = await teamClient.getTeamMemberProblemsetStatistics(props.team);
                setExtraStatistics(data);
                setFilteredUserStatistics(data.user_data);
                setLoaded(true);
            } catch { } finally { setLoading(false); }
        })();
    }, [loaded, props.team]);
    const doFilter = () => {
        setFilteredUserStatistics((extraStatistics?.user_data || []).filter(t => (
            t.user.real_name?.includes(statisticsFilteringKeyword.value) || t.user.username.includes(statisticsFilteringKeyword.value) || t.user.uid.toString().includes(statisticsFilteringKeyword.value)
        )));
    };
    return <div>
        {viewingProblemsetDetailUid && <Modal open>
            <Modal.Header>查看用户详细统计数据</Modal.Header>
            <Modal.Content>
                <ShowMemberDetailedStatistics team={props.team} uid={viewingProblemsetDetailUid}></ShowMemberDetailedStatistics>
            </Modal.Content>
            <Modal.Actions><Button color="red" size="small" onClick={() => setViewingProblemsetDetailUid(null)}>关闭</Button></Modal.Actions>
        </Modal>}
        <Tab renderActiveOnly={false} panes={[
            {
                menuItem: "做题记录统计", pane: <Tab.Pane key={0}>
                    <TeamStatisticsView team={props.team}></TeamStatisticsView>
                </Tab.Pane>
            },
            {
                menuItem: "作业情况统计", pane: <Tab.Pane key={1}>
                    {loading && <Dimmer active><Loader></Loader></Dimmer>}
                    <div style={{ overflowX: "scroll" }}>{extraStatistics !== null && <>
                        <Input {...statisticsFilteringKeyword} placeholder="过滤用户" action={{
                            content: "搜索",
                            onClick: doFilter
                        }}></Input>
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>用户</Table.HeaderCell>
                                    {/* <Table.HeaderCell>看课进度</Table.HeaderCell> */}
                                    {/* <Table.HeaderCell>看课时长</Table.HeaderCell> */}
                                    {extraStatistics.problemsets.map(item => <Table.HeaderCell style={{ minWidth: "100px" }} key={item.id}>
                                        <Link to={`${PUBLIC_URL}/problemset/show/${item.id}`}>#{item.id}. {item.name}</Link>
                                        <p>共 {item.problems.length} 题</p>
                                    </Table.HeaderCell>)}
                                    <Table.HeaderCell></Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {filteredUserStatistics.map(item => <Table.Row onClick={() => setViewingProblemsetDetailUid(item.user.uid)} style={{ cursor: "pointer" }} key={item.user.uid}>
                                    <Table.Cell>
                                        <UserLink data={item.user}></UserLink>
                                        {item.user.real_name && <p style={{ color: "darkgray" }}>{item.user.real_name}</p>}
                                    </Table.Cell>
                                    {/* <Table.Cell>{item.user.course_watch_time > 0 ? (Math.floor(item.user.course_watch_time / item.user.course_total_time * 100).toFixed(2) + "%") : null}</Table.Cell> */}
                                    {/* <Table.Cell>{item.user.course_watch_time}</Table.Cell> */}
                                    {item.statistics.map((ent, idx) => <Table.Cell key={idx}>通过{ent.accepted_problems}题；累计提交{ent.submission_count}次</Table.Cell>)}
                                    <Table.Cell><Button color="green" size="small" onClick={() => setViewingProblemsetDetailUid(item.user.uid)}>查看详情</Button></Table.Cell>
                                </Table.Row>)}
                            </Table.Body>
                        </Table>
                    </>}</div>
                </Tab.Pane>
            },
            {
                menuItem: "管理", pane: <Tab.Pane key={2}>
                    <Button color="green" onClick={() => setShowBatchAddModal(true)}>批量添加成员</Button>
                    {showBatchAddModal && <BatchAddMembersDialog
                        finishCallback={props.reloadCallback}
                        onClose={() => setShowBatchAddModal(false)}
                        open={showBatchAddModal}
                        team={props.team}
                        teamMembers={props.teamMembers}
                    ></BatchAddMembersDialog>}
                </Tab.Pane>
            }
        ]}></Tab>
    </div>
};

export default TeamManage;
