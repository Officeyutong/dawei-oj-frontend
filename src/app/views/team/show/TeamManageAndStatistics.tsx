import { useCallback, useEffect, useState } from "react";
import { Button, Dimmer, Form, Header, Input, Loader, Message, Modal, Tab, Table } from "semantic-ui-react";
import { TeamDetail, TeamMemberProblemsetStatistics } from "../client/types";
import BatchAddMembersDialog from "./BatchAddMembersDialog";
import teamClient from "../client/TeamClient";

import UserLink from "../../utils/UserLink";
import { PUBLIC_URL } from "../../../App";
import { Link } from "react-router-dom";
import TeamStatisticsView from "./TeamStatisticsView";
import ShowMemberDetailedStatistics from "./ShowMemberDetailedStatistics";
import { DateTime } from "luxon"
import XLSX from "xlsx-js-style";
import DatetimePickler from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import 'moment/locale/zh-cn';
interface TeamManageProps {
    team: number;
    reloadCallback: () => void;
    teamMembers: TeamDetail["members"];
};

function timeToZero(input: DateTime): DateTime {
    return input.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
}

const TeamManage: React.FC<React.PropsWithChildren<TeamManageProps>> = (props) => {
    const [showBatchAddModal, setShowBatchAddModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [extraStatistics, setExtraStatistics] = useState<TeamMemberProblemsetStatistics | null>(null);
    const [viewingProblemsetDetailUidAndName, setViewingProblemsetDetailUidAndName] = useState<{ uid: number; realName?: string; username: string; } | null>(null);
    const [statisticsFilteringKeyword, setStatisticsFilteringKeyword] = useState("");
    const [filteredUserStatistics, setFilteredUserStatistics] = useState<TeamMemberProblemsetStatistics["user_data"]>([]);

    const [startTime, setStartTime] = useState<DateTime>(DateTime.now().minus({ year: 10 }));
    const [endTime, setEndTime] = useState<DateTime>(DateTime.now());
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await teamClient.getTeamMemberProblemsetStatistics(props.team, [timeToZero(startTime).toSeconds(), timeToZero(endTime).plus({ day: 1 }).toSeconds()]);
            setExtraStatistics(data);
            setFilteredUserStatistics(data.user_data);
            setLoaded(true);
            setStatisticsFilteringKeyword("");
        } catch { } finally { setLoading(false); }
    }, [endTime, props.team, startTime]);

    const exportToExcel = useCallback(() => {
        if (filteredUserStatistics === null || extraStatistics === null) return;

        try {
            setLoading(true)
            const workbook = XLSX.utils.book_new();
            const sheetData: string[][] = [];
            sheetData.push([
                "用户", ...extraStatistics.problemsets.map((item) => `${item.id}. ${item.name} 共 ${item.problems.length} 题`)
            ]);

            for (const item of filteredUserStatistics) {
                sheetData.push([
                    `${item.user.username}(${item.user.real_name})`, ...item.statistics.map((ele) => `通过${ele.accepted_problems}题；累计提交${ele.submission_count}次`)
                ])
            }
            const sheet = XLSX.utils.aoa_to_sheet(sheetData);
            sheet["!cols"] = new Array(sheetData[0].length).fill({ width: 50, height: 25 });

            XLSX.utils.book_append_sheet(workbook, sheet, "ranklist");
            XLSX.writeFile(workbook, `团队作业情况统计.xlsx`)
        } catch {

        } finally {
            setLoading(false)
        }
    }, [extraStatistics, filteredUserStatistics])

    useEffect(() => {
        if (!loaded) loadData();
    }, [loadData, loaded]);
    const doFilter = () => {
        setFilteredUserStatistics((extraStatistics?.user_data || []).filter(t => (
            t.user.real_name?.includes(statisticsFilteringKeyword) || t.user.username.includes(statisticsFilteringKeyword) || t.user.uid.toString().includes(statisticsFilteringKeyword)
        )));
    };
    return <div>
        {viewingProblemsetDetailUidAndName !== null && <Modal open>
            <Modal.Header>查看用户详细统计数据</Modal.Header>
            <Modal.Content>
                <Header as="h3">{viewingProblemsetDetailUidAndName.username}{viewingProblemsetDetailUidAndName.realName && `（${viewingProblemsetDetailUidAndName.realName}）`}</Header>
                <ShowMemberDetailedStatistics team={props.team} uid={viewingProblemsetDetailUidAndName.uid}></ShowMemberDetailedStatistics>
            </Modal.Content>
            <Modal.Actions><Button color="red" size="small" onClick={() => setViewingProblemsetDetailUidAndName(null)}>关闭</Button></Modal.Actions>
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
                        <Form>
                            <Form.Group widths={4}>
                                <Form.Field>
                                    <label>搜索用户</label>
                                    <Input onChange={(_, d) => setStatisticsFilteringKeyword(d.value)} placeholder="过滤用户" action={{
                                        content: "搜索",
                                        onClick: doFilter
                                    }}></Input>
                                </Form.Field>
                                <Form.Field>
                                    <label>过滤提交开始时间</label>
                                    <DatetimePickler
                                        value={startTime.toJSDate()}
                                        timeFormat={false}
                                        onChange={d => {
                                            if (typeof d != "string") {
                                                setStartTime(DateTime.fromJSDate(d.toDate()))
                                            }
                                        }}
                                        locale="zh-cn"
                                    ></DatetimePickler>
                                </Form.Field>
                                <Form.Field>
                                    <label>过滤提交结束时间</label>
                                    <DatetimePickler
                                        value={endTime.toJSDate()}
                                        timeFormat={false}
                                        onChange={d => {
                                            if (typeof d != "string") {
                                                setEndTime(DateTime.fromJSDate(d.toDate()))
                                            }
                                        }}
                                        locale="zh-cn"
                                    ></DatetimePickler>
                                </Form.Field>
                                <Form.Field>
                                    <label>操作</label>
                                    <Button color="green" onClick={loadData} style={{ marginTop: "0.1rem" }}>过滤时间</Button>
                                    <Button color="green" onClick={exportToExcel} style={{ marginTop: "0.1rem" }}>导出EXCEL</Button>
                                </Form.Field>
                            </Form.Group>
                        </Form>
                        <Message info>
                            <Message.Header>
                                注意
                            </Message.Header>
                            <Message.Content>
                                如果过滤了提交时间，那么这个表格的内容只会统计所选择的时间范围内的提交。
                            </Message.Content>
                        </Message>
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
                                {filteredUserStatistics.map(item => <Table.Row onClick={() => setViewingProblemsetDetailUidAndName({ uid: item.user.uid, realName: item.user.real_name, username: item.user.username })} style={{ cursor: "pointer" }} key={item.user.uid}>
                                    <Table.Cell>
                                        <UserLink data={item.user}></UserLink>
                                        {item.user.real_name && <p style={{ color: "darkgray" }}>{item.user.real_name}</p>}
                                    </Table.Cell>
                                    {/* <Table.Cell>{item.user.course_watch_time > 0 ? (Math.floor(item.user.course_watch_time / item.user.course_total_time * 100).toFixed(2) + "%") : null}</Table.Cell> */}
                                    {/* <Table.Cell>{item.user.course_watch_time}</Table.Cell> */}
                                    {item.statistics.map((ent, idx) => <Table.Cell key={idx}>通过{ent.accepted_problems}题；累计提交{ent.submission_count}次</Table.Cell>)}
                                    <Table.Cell><Button color="green" size="small" onClick={() => setViewingProblemsetDetailUidAndName({ uid: item.user.uid, realName: item.user.real_name, username: item.user.username })}>查看详情</Button></Table.Cell>
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
