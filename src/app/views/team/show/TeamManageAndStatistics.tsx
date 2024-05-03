import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Dimmer, Form, Grid, Header, Loader, Tab, Table } from "semantic-ui-react";
import { TeamDetail, TeamMemberLookupEntry, TeamMemberProblemsetStatistics, TeamStatisticEntry } from "../client/types";
import BatchAddMembersDialog from "./BatchAddMembersDialog";
import { DateTime } from "luxon";
import teamClient from "../client/TeamClient";
import DatetimePickler from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import 'moment/locale/zh-cn';
import { timestampToYMD } from "../../../common/Utils";
import { Annotation } from "@antv/g2plot";
import { ColumnChart, LineChart, WordCloudChart } from "@opd/g2plot-react";
import { ProblemTagEntry } from "../../../common/types";
import problemClient from "../../problem/client/ProblemClient";
import TeamMemberLookupModal from "./TeamMemberLookupModal";
import UserLink from "../../utils/UserLink";
import { PUBLIC_URL } from "../../../App";
import { Link } from "react-router-dom";

interface TeamManageProps {
    team: number;
    reloadCallback: () => void;
    teamMembers: TeamDetail["members"];
};

const TeamManage: React.FC<React.PropsWithChildren<TeamManageProps>> = (props) => {
    const [showBatchAddModal, setShowBatchAddModal] = useState(false);
    const [endTime, setEndTime] = useState<DateTime>(DateTime.now().minus({ days: 0 }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }));
    const [duration, setDuration] = useState<number>(14);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<TeamStatisticEntry[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [allTags, setAllTags] = useState<ProblemTagEntry[]>([]);
    const [tagsLoaded, setTagsLoaded] = useState(false);
    const tagMapping = useMemo(() => new Map(allTags.map(x => ([x.id, x]))), [allTags]);
    const [tags, setTags] = useState<Map<string, number>>(new Map());
    const [showLookupModal, setShowLookupModal] = useState(false);
    const [filteredUser, setFilteredUser] = useState<null | TeamMemberLookupEntry>(null);
    const [extraStatistics, setExtraStatistics] = useState<TeamMemberProblemsetStatistics | null>(null);
    const [viewingProblemsetDetailUid, setViewingProblemsetDetailUid] = useState<number | null>(null);
    const tagEntries = useMemo(() => {
        const result: { word: string; weight: number; color: string }[] = [];
        tags.forEach((value, key) => {
            const tag = tagMapping.get(key);
            result.push({
                word: tag?.display || key,
                weight: value,
                color: tag?.color || "black"
            })
        });
        return result;
    }, [tags, tagMapping]);
    useEffect(() => {
        if (!tagsLoaded) {
            problemClient.getProblemtags().then(resp => {
                setAllTags(resp);
                setTagsLoaded(true);
            })
        }
    }, [tagsLoaded]);
    const refreshData = (useCallback(async () => {
        try {
            setLoading(true);
            const serverSended = new Map<number, TeamStatisticEntry>();
            const [d1, d2] = await Promise.all([teamClient.getTeamStatistics(props.team, endTime.minus({ days: duration }), endTime, filteredUser?.uid), teamClient.getTeamMemberProblemsetStatistics(props.team)]);
            setExtraStatistics(d2);
            for (const item of d1) {
                serverSended.set(item.date, item);
            }
            const result: TeamStatisticEntry[] = [];
            for (let i = 0; i < duration; i++) {
                const now = endTime.minus({ days: duration - i }).toSeconds();
                const curr = serverSended.get(now);
                if (curr === undefined) {
                    result.push({
                        acceptedSubmissionCount: 0,
                        date: now,
                        passedProblemCount: 0,
                        passedProblemTag: {},
                        submissionCount: 0
                    })
                } else {
                    result.push(curr);
                }
            }
            const newTagMap = new Map<string, number>();
            result.forEach(item => {
                for (const [tagId, count] of Object.entries(item.passedProblemTag)) {
                    newTagMap.set(tagId, (newTagMap.get(tagId) || 0) + count);
                }
            });
            setTags(newTagMap);
            setData(result);
            setLoaded(true);
        } catch { } finally { setLoading(false); }
    }, [duration, endTime, filteredUser?.uid, props.team]));
    useEffect(() => {
        if (!loaded) refreshData();
    }, [loaded, refreshData]);
    const stackSubmissionStatistics: { date: string; value: number; type: string }[] = useMemo(() => {
        const result = [];
        for (const item of data) {
            const dateStr = timestampToYMD(item.date);
            result.push({
                date: dateStr,
                value: item.submissionCount - item.acceptedSubmissionCount,
                type: "未通过提交"
            });
            result.push({
                date: dateStr,
                value: item.acceptedSubmissionCount,
                type: "通过提交"
            });
        }
        return result;
    }, [data]);
    const stackSubmissionAnnotations: Annotation[] = data.filter(t => t.submissionCount > 0).map(t => ({
        type: "text",
        position: [t.date, t.submissionCount],
        content: `${t.submissionCount}`,
        style: { textAlign: 'center', fontSize: 14, fill: 'rgba(0,0,0,0.85)' },
        offsetY: -10,
    }));
    const problemStatistics = useMemo(() => data.map(t => ({ date: timestampToYMD(t.date), value: t.passedProblemCount })), [data]);
    return <div>
        {loading && <Dimmer active><Loader></Loader></Dimmer>}
        <Tab renderActiveOnly={false} panes={[
            {
                menuItem: "做题记录统计", pane: <Tab.Pane key={0}>
                    <Header as="h4">提交数量统计</Header>
                    <ColumnChart
                        data={stackSubmissionStatistics}
                        isStack
                        xField="date"
                        yField="value"
                        seriesField="type"
                        label={{
                            position: 'middle',
                            layout: [
                                { type: 'interval-adjust-position' },
                                { type: 'interval-hide-overlap' },
                                { type: 'adjust-color' },
                            ],
                        }}
                        slider={{}}
                        annotations={stackSubmissionAnnotations}
                        meta={{
                            date: { alias: "日期" },
                            value: { alias: "提交数量" },
                            type: { alias: "类别" }
                        }}
                        legend={{ position: "bottom" }}
                    ></ColumnChart>
                    <Grid columns={2}>
                        <Grid.Column>
                            <Header as="h4">过题数量统计</Header>
                            <LineChart
                                data={problemStatistics}
                                xField="date"
                                yField="value"
                                slider={{}}
                                smooth
                                legend={{ position: "bottom" }}
                                meta={{
                                    value: {
                                        alias: "队内成员通过题目数",
                                    }
                                }}
                            ></LineChart>
                        </Grid.Column>
                        <Grid.Column>
                            <Header as="h4">已通过题目标签</Header>
                            <WordCloudChart
                                data={tagEntries}
                                wordField="word"
                                weightField="weight"
                                wordStyle={{ rotation: [0, 0] }}
                                colorField="color"
                            ></WordCloudChart>
                        </Grid.Column>

                    </Grid>
                    <Header as="h4">筛选设置</Header>
                    <Form>
                        <Form.Group widths={2}>
                            <Form.Field>
                                <label>截止日期</label>
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
                            <Form.Input label="查询天数" type="number" value={duration} onChange={(_, d) => setDuration(Math.max(1, parseInt(d.value) as number))}>
                            </Form.Input>

                        </Form.Group>
                        <Form.Group widths={2}>
                            <Form.Checkbox toggle label="筛选用户" checked={filteredUser !== null} onClick={(_, d) => !d.checked ? setFilteredUser(null) : setShowLookupModal(true)}></Form.Checkbox>
                            {filteredUser !== null && <Form.Field>
                                当前筛选: <UserLink data={filteredUser}></UserLink>
                            </Form.Field>}
                        </Form.Group>
                        <Form.Button positive onClick={refreshData} label="操作">刷新</Form.Button>
                    </Form>
                    {showLookupModal && <TeamMemberLookupModal teamID={props.team} onUpdate={(s) => setFilteredUser(s)} onClose={() => setShowLookupModal(false)}></TeamMemberLookupModal>}

                </Tab.Pane>
            },
            {
                menuItem: "作业与看课情况统计", pane: <Tab.Pane key={1}>
                    <div style={{ overflowX: "scroll" }}>{extraStatistics !== null && <>
                        <Table compact>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>用户</Table.HeaderCell>
                                    <Table.HeaderCell>看课进度</Table.HeaderCell>
                                    <Table.HeaderCell>看课时长</Table.HeaderCell>
                                    {extraStatistics.problemsets.map(item => <Table.HeaderCell key={item.id}>
                                        <Link to={`${PUBLIC_URL}/problemset/show/${item.id}`}>#{item.id}. {item.name}</Link>
                                        <p>共 {item.problems.length} 题</p>
                                    </Table.HeaderCell>)}
                                    <Table.HeaderCell></Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {extraStatistics.user_data.map(item => <Table.Row key={item.user.uid}>
                                    <Table.Cell>
                                        <UserLink data={item.user}></UserLink>
                                        {item.user.real_name && <p style={{ color: "darkgray" }}>{item.user.real_name}</p>}
                                    </Table.Cell>
                                    <Table.Cell>{item.user.course_watch_time > 0 ? (Math.floor(item.user.course_watch_time / item.user.course_total_time * 100).toFixed(2) + "%") : null}</Table.Cell>
                                    <Table.Cell>{item.user.course_watch_time}</Table.Cell>
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
