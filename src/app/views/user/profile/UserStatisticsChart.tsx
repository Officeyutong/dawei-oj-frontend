import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dimmer, Form, Grid, Header, Loader, Segment } from "semantic-ui-react";
import { UserStatisticEntry } from "../client/types";
import { DateTime } from "luxon";
import userClient from "../client/UserClient";
import { ProblemTagEntry } from "../../../common/types";
import problemClient from "../../problem/client/ProblemClient";
import { ColumnChart, LineChart, PieChart, WordCloudChart } from "@opd/g2plot-react";
import { Annotation } from "@antv/g2plot";
import DatetimePickler from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import 'moment/locale/zh-cn';
import { timestampToYMD } from "../../../common/Utils";
import { useSelector } from "react-redux";
import { StateType } from "../../../states/Manager";
/*
提交：
面积图：累计提交数，累计通过提交数
折线图：提交数，通过提交数
*/


const UserStatisticsChart: React.FC<{ uid: number }> = ({ uid }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<UserStatisticEntry[]>([]);
    const [tags, setTags] = useState<Map<string, number>>(new Map());
    const [difficulty, setDifficulty] = useState<Map<number, number>>(new Map());

    const [endTime, setEndTime] = useState<luxon.DateTime>(DateTime.now().minus({ days: 0 }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }));
    const [duration, setDuration] = useState<number>(14);
    const [loaded, setLoaded] = useState(false);
    const [allTags, setAllTags] = useState<ProblemTagEntry[]>([]);
    const [tagsLoaded, setTagsLoaded] = useState(false);
    const tagMapping = useMemo(() => new Map(allTags.map(x => ([x.id, x]))), [allTags]);
    const loadingRef = useRef<boolean>(false);
    const difficultyEntries = useMemo(() => {
        const result: { value: number; type: string; diffculty: number; }[] = [];
        result.sort((x, y) => {
            return x.diffculty - y.diffculty;
        });
        difficulty.forEach((value, key) => result.push({
            type: `难度${key}`,
            value,
            diffculty: key
        }));
        return result;
    }, [difficulty]);
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
    const submissionStatistics = useMemo(() => {
        const result: { date: string; submission: number; sumedSubmission: number; accepted: number; sumedAccepted: number; }[] = [];
        for (let i = 0; i < data.length; i++) {
            const nowDate = timestampToYMD(data[i].date);
            result.push({
                date: nowDate,
                accepted: data[i].acceptedSubmission,
                submission: data[i].submissionCount,
                sumedAccepted: data[i].acceptedSubmission + (i !== 0 ? result[i - 1].sumedAccepted : 0),
                sumedSubmission: data[i].submissionCount + (i !== 0 ? result[i - 1].sumedSubmission : 0),
            })
        }
        console.log(result);
        return result;
    }, [data]);
    useEffect(() => {
        if (!tagsLoaded) {
            problemClient.getProblemtags().then(resp => {
                setAllTags(resp);
                setTagsLoaded(true);
            })
        }
    }, [tagsLoaded]);
    const refreshData = useCallback(async () => {
        try {
            setLoading(true);
            loadingRef.current = true;
            const serverSended = new Map<number, UserStatisticEntry>();
            for (const item of await userClient.getUserStatisticsEntry(uid, (endTime.minus({ days: duration })).toSeconds(), endTime.toSeconds())) {
                serverSended.set(item.date, item);
            }
            const result: UserStatisticEntry[] = [];
            for (let i = 0; i < duration; i++) {
                const now = endTime.minus({ days: duration - i }).toSeconds();
                const curr = serverSended.get(now);
                if (curr === undefined) {
                    result.push({
                        acceptedSubmission: 0,
                        newProblemsPassed: 0,
                        problemDifficultyDist: {},
                        problemTagDist: {},
                        date: now,
                        triedProblem: 0,
                        submissionCount: 0,
                        stayTime: 0
                    })
                } else {
                    result.push(curr);
                }
            }
            const newTagMap = new Map<string, number>();
            const newDifficultyMap = new Map<number, number>();
            result.forEach(item => {
                for (const [tagId, count] of Object.entries(item.problemTagDist)) {
                    newTagMap.set(tagId, (newTagMap.get(tagId) || 0) + count);
                }
                for (const [diff, count] of Object.entries(item.problemDifficultyDist)) {
                    newDifficultyMap.set(parseInt(diff), (newDifficultyMap.get(parseInt(diff)) || 0) + count);
                }

            });
            setData(result);
            setDifficulty(newDifficultyMap);
            setTags(newTagMap);
            setLoaded(true);
        } catch { } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [duration, endTime, uid]);
    useEffect(() => {
        if (!loaded && !loadingRef.current && tagsLoaded) {
            refreshData();
        }
    }, [tagsLoaded, loaded, refreshData]);
    const stackSubmissionStatistics: { date: string; value: number; type: string }[] = useMemo(() => {
        const result = [];
        for (const item of submissionStatistics) {
            result.push({
                date: item.date,
                value: item.submission - item.accepted,
                type: "未通过提交"
            });
            result.push({
                date: item.date,
                value: item.accepted,
                type: "通过提交"
            });
        }
        return result;
    }, [submissionStatistics]);
    const stackSubmissionAnnotations: Annotation[] = submissionStatistics.filter(t => t.submission > 0).map(t => ({
        type: "text",
        position: [t.date, t.submission],
        content: `${t.submission}`,
        style: { textAlign: 'center', fontSize: 14, fill: 'rgba(0,0,0,0.85)' },
        offsetY: -10,
    }));
    const stayTimeStatistics: { date: string; value: number; type: string }[] = useMemo(() => {
        const result = [];
        for (const item of data) {
            const nowDate = timestampToYMD(item.date);
            result.push({
                date: nowDate,
                value: item.stayTime,
                type: "看课时长(秒)"
            });

        }
        return result;
    }, [data]);
    const stackProblemStatistics: { date: string; value: number; type: string }[] = useMemo(() => {
        const result = [];
        for (const item of data) {
            const nowDate = timestampToYMD(item.date);
            result.push({
                date: nowDate,
                value: item.newProblemsPassed,
                type: "新通过题目数"
            });
            result.push({
                date: nowDate,
                value: item.triedProblem,
                type: "尝试过题目数"
            });

        }
        return result;
    }, [data]);
    const { minProblemDifficulty, maxProblemDifficulty } = useSelector((s: StateType) => s.userState.userData);
    const stackProblemDifficultyStatistics: { date: string; value: number; type: string }[] = useMemo(() => {
        const result = [];
        for (const item of data) {
            const dateStr = timestampToYMD(item.date);
            for (let i = minProblemDifficulty; i <= maxProblemDifficulty; i++) {
                if (item.problemDifficultyDist[String(i)] !== undefined) {
                    result.push({
                        date: dateStr,
                        value: item.problemDifficultyDist[String(i)],
                        type: `难度 ${i}`
                    })
                } else {
                    result.push({
                        date: dateStr,
                        value: 0,
                        type: `难度 ${i}`
                    })
                }
            }
        }
        return result;
    }, [data, maxProblemDifficulty, minProblemDifficulty]);
    return <>
        <Header as="h3">统计数据</Header>

        <Segment stacked>
            {loading && <Dimmer active><Loader></Loader></Dimmer>}
            <Grid columns={1}>
                <Grid.Column>
                    <Grid columns={2}>
                        <Grid.Row divided>
                            <Grid.Column>
                                <Header as="h4">通过题目难度统计</Header>
                                <PieChart data={difficultyEntries} angleField="value" colorField="type" label={{
                                    type: 'inner',
                                    offset: '-30%',
                                    content: (s: any) => `${(s.percent as number * 100).toFixed(0)}%`,
                                    style: {
                                        fontSize: 14,
                                        textAlign: 'center',
                                    },
                                }}></PieChart>
                            </Grid.Column>
                            <Grid.Column>
                                <Header as="h4">题目标签词云</Header>
                                <WordCloudChart
                                    data={tagEntries}
                                    wordField="word"
                                    weightField="weight"
                                    wordStyle={{ rotation: [0, 0] }}
                                    colorField="color"
                                ></WordCloudChart>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Grid.Column>
                <Grid.Column>
                    <Header as="h4">提交数目统计</Header>
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
                    ></ColumnChart>
                </Grid.Column>
                <Grid.Column>
                    <Header as="h4">通过题目统计</Header>
                    <LineChart
                        data={stackProblemStatistics}
                        xField="date"
                        yField="value"
                        seriesField="type"
                        slider={{}}
                        smooth
                    ></LineChart>
                </Grid.Column>
                <Grid.Column>
                    <Header as="h4">按天分布的通过题目难度统计</Header>
                    <ColumnChart
                        data={stackProblemDifficultyStatistics}
                        xField="date"
                        yField="value"
                        seriesField="type"
                        slider={{}}
                    ></ColumnChart>
                </Grid.Column>
                <Grid.Column>
                    <Header as="h4">看课时长统计</Header>
                    <LineChart
                        data={stayTimeStatistics}
                        xField="date"
                        yField="value"
                        seriesField="type"
                        slider={{}}
                        smooth
                    ></LineChart>
                </Grid.Column>
                <Grid.Column>
                    <Header as="h4">日期设置</Header>
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
                        <Form.Button positive onClick={refreshData}>刷新</Form.Button>
                    </Form>
                </Grid.Column>
            </Grid>
        </Segment>
    </>
};

export default UserStatisticsChart;
