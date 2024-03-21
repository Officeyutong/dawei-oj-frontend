import React, { useEffect, useMemo, useState } from "react";
import { Dimmer, Form, Grid, Header, Icon, Loader, SemanticICONS, Statistic } from "semantic-ui-react";
import { GeneralInfo, SubmissionStatisticsEntry } from "../client/types";
import { DateTime } from "luxon";
import { adminClient } from "../client/AdminClient";
import { timestampToYMD } from "../../../common/Utils";
import { Annotation } from "@antv/g2plot";
import { ColumnChart, LineChart, PieChart } from "@opd/g2plot-react";
import DatetimePickler from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import 'moment/locale/zh-cn';

const GeneralView: React.FC<React.PropsWithChildren<{ data: GeneralInfo }>> = ({ data: simpleStatisticsData }) => {
    const [endTime, setEndTime] = useState<DateTime>(DateTime.now().minus({ days: 0 }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }));
    const [duration, setDuration] = useState<number>(14);
    const [loading, setLoading] = useState(false);
    const [subData, setSubData] = useState<SubmissionStatisticsEntry[]>([]);
    const [loaded, setLoaded] = useState(false);
    const refreshData = (async () => {
        try {
            setLoading(true);
            const serverSended = new Map<number, SubmissionStatisticsEntry>();
            for (const item of await adminClient.getSubmissionStatistics((endTime.minus({ days: duration })).toSeconds(), endTime.toSeconds())) {
                serverSended.set(item.date, item);
            }
            const result: SubmissionStatisticsEntry[] = [];
            for (let i = 0; i < duration; i++) {
                const now = endTime.minus({ days: duration - i }).toSeconds();
                const curr = serverSended.get(now);
                if (curr === undefined) {
                    result.push({
                        acceptedSubmission: 0,
                        date: now,
                        submission: 0,
                        submittedUser: 0
                    })
                } else {
                    result.push(curr);
                }
            }
            setSubData(result);
            setLoaded(true);
        } catch { } finally { setLoading(false); }
    });
    useEffect(() => {
        if (!loaded && !loading) refreshData();
    });
    const stackSubmissionStatistics: { date: string; value: number; type: string }[] = useMemo(() => {
        const result = [];
        for (const item of subData) {
            const dateStr = timestampToYMD(item.date);
            result.push({
                date: dateStr,
                value: item.submission - item.acceptedSubmission,
                type: "未通过提交"
            });
            result.push({
                date: dateStr,
                value: item.acceptedSubmission,
                type: "通过提交"
            });
        }
        return result;
    }, [subData]);
    const stackSubmissionAnnotations: Annotation[] = subData.filter(t => t.submission > 0).map(t => ({
        type: "text",
        position: [t.date, t.submission],
        content: `${t.submission}`,
        style: { textAlign: 'center', fontSize: 14, fill: 'rgba(0,0,0,0.85)' },
        offsetY: -10,
    }));
    const userStatistics = useMemo(() => subData.map(t => ({ date: timestampToYMD(t.date), value: t.submittedUser })), [subData]);
    return <div>
        {loading && <Dimmer active><Loader></Loader></Dimmer>}
        <Grid columns={1}>
            <Grid.Column>
                <Header as="h4">日期设置</Header>
                <Form>
                    <Form.Group widths={3}>
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
                        <Form.Button positive onClick={refreshData} label="操作">刷新</Form.Button>

                    </Form.Group>
                </Form>
            </Grid.Column>
            <Grid.Column>
                <Grid columns={2}>

                    <Grid.Column>
                        <Header as="h3">总提交数统计</Header>
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
                    </Grid.Column>
                    <Grid.Column>
                        <Header as="h3">提交用户数统计</Header>
                        <LineChart
                            data={userStatistics}
                            xField="date"
                            yField="value"
                            slider={{}}
                            smooth
                            legend={{ position: "bottom" }}
                            meta={{
                                value: {
                                    alias: "当天提交用户数",
                                }
                            }}
                        ></LineChart>
                    </Grid.Column>

                </Grid>
            </Grid.Column>
            <Grid.Column>
                <Grid columns="3">
                    <Grid.Row>
                        <Grid.Column>
                            <Header as="h3">题目数量统计</Header>
                            <PieChart
                                radius={1}
                                innerRadius={0.36}
                                data={[
                                    { value: simpleStatisticsData.problemCount - simpleStatisticsData.publicProblemCount, type: "非公开题目" },
                                    { value: simpleStatisticsData.publicProblemCount, type: "公开题目" },

                                ]}
                                angleField="value"
                                colorField="type"
                                label={{
                                    type: 'inner',
                                    offset: '-50%',
                                    autoRotate: false,
                                    content: (s: any) => `${(s.percent as number * 100).toFixed(0)}% (${s.value})`,
                                    style: {
                                        fontSize: 14,
                                        textAlign: 'center',
                                    },
                                }}
                                statistic={{
                                    title: false,
                                    content: {
                                        style: {
                                            whiteSpace: "pre-wrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            fontSize: "14px"
                                        },
                                        content: `总计 ${simpleStatisticsData.problemCount}`,
                                    },
                                }}
                            ></PieChart>
                        </Grid.Column>
                        <Grid.Column>
                            <Header as="h3">提交数量统计</Header>
                            <PieChart
                                radius={1}
                                innerRadius={0.36}
                                data={[
                                    { value: simpleStatisticsData.submissionCount - simpleStatisticsData.acceptedSubmissionCount, type: "未通过提交" },
                                    { value: simpleStatisticsData.acceptedSubmissionCount, type: "通过提交" },

                                ]}
                                angleField="value"
                                colorField="type"
                                label={{
                                    type: 'inner',
                                    offset: '-50%',
                                    autoRotate: false,
                                    content: (s: any) => `${(s.percent as number * 100).toFixed(0)}% (${s.value})`,
                                    style: {
                                        fontSize: 14,
                                        textAlign: 'center',
                                    },
                                }}
                                statistic={{
                                    title: false,
                                    content: {
                                        style: {
                                            whiteSpace: "pre-wrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            fontSize: "14px"
                                        },
                                        content: `总计 ${simpleStatisticsData.submissionCount}`,
                                    },
                                }}
                            ></PieChart>
                        </Grid.Column>
                        <Grid.Column>
                            <Header as="h3">用户数量统计</Header>
                            <ColumnChart
                                data={[
                                    { type: "总用户数", value: simpleStatisticsData.userCount },
                                    { type: "今日访问过的用户数", value: simpleStatisticsData.todayAccessedUsers }
                                ]}
                                yField="value"
                                xField="type"
                                legend={{ position: "top" }}
                                label={{
                                    position: 'middle',
                                    layout: [
                                        { type: 'interval-adjust-position' },
                                        { type: 'interval-hide-overlap' },
                                        { type: 'adjust-color' },
                                    ],
                                }}
                            ></ColumnChart>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        {[
                            { icon: "keyboard" as SemanticICONS, title: "讨论数量", value: simpleStatisticsData.discussionCount },
                            { icon: "hdd" as SemanticICONS, title: "今日提交数量", value: simpleStatisticsData.todaySubmissionCount },
                            { icon: "hdd" as SemanticICONS, title: "今日编译错误提交数量", value: simpleStatisticsData.todayCESubmissionCount },
                        ].map((x, i) => <Grid.Column key={i}>
                            <Statistic>
                                <Statistic.Value>
                                    <Icon name={x.icon}></Icon>
                                    {x.value}
                                </Statistic.Value>
                                <Statistic.Label>{x.title}</Statistic.Label>
                            </Statistic>
                        </Grid.Column>)}
                    </Grid.Row>
                </Grid>
            </Grid.Column>
        </Grid>

    </div>;
};

export default GeneralView;
