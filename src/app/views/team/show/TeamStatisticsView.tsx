import { ColumnChart, LineChart, WordCloudChart } from "@opd/g2plot-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TeamMemberLookupEntry, TeamStatisticEntry } from "../client/types";
import { DateTime } from "luxon";
import { ProblemTagEntry } from "../../../common/types";
import problemClient from "../../problem/client/ProblemClient";
import teamClient from "../client/TeamClient";
import { timestampToYMD } from "../../../common/Utils";
import { Annotation } from "@antv/g2plot";
import { Dimmer, Form, Grid, Header, Loader } from "semantic-ui-react";
import DatetimePickler from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import 'moment/locale/zh-cn';
import TeamMemberLookupModal from "./TeamMemberLookupModal";
import UserLink from "../../utils/UserLink";
interface TeamStatisticsViewProps {
    team: number;
    showThisUidOnly?: number;
}
const TeamStatisticsView: React.FC<TeamStatisticsViewProps> = ({ team, showThisUidOnly }) => {
    const [data, setData] = useState<TeamStatisticEntry[]>([]);
    const [endTime, setEndTime] = useState<DateTime>(DateTime.now().minus({ days: 0 }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }));
    const [duration, setDuration] = useState<number>(14);
    const [allTags, setAllTags] = useState<ProblemTagEntry[]>([]);
    const [tagsLoaded, setTagsLoaded] = useState(false);
    const tagMapping = useMemo(() => new Map(allTags.map(x => ([x.id, x]))), [allTags]);
    const [tags, setTags] = useState<Map<string, number>>(new Map());
    const [showLookupModal, setShowLookupModal] = useState(false);
    const [filteredUser, setFilteredUser] = useState<null | TeamMemberLookupEntry>(null);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
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
            const data = await teamClient.getTeamStatistics(team, endTime.minus({ days: duration }), endTime, showThisUidOnly ? showThisUidOnly : filteredUser?.uid);
            for (const item of data) {
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
    }, [duration, endTime, filteredUser?.uid, showThisUidOnly, team]));
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
    return <>
        {loading && <Dimmer active><Loader></Loader></Dimmer>}
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
            {showThisUidOnly === undefined && <Form.Group widths={2}>
                <Form.Checkbox toggle label="筛选用户" checked={filteredUser !== null} onClick={(_, d) => !d.checked ? setFilteredUser(null) : setShowLookupModal(true)}></Form.Checkbox>
                {filteredUser !== null && <Form.Field>
                    当前筛选: <UserLink data={filteredUser}></UserLink>
                </Form.Field>}
            </Form.Group>}
            <Form.Button positive onClick={refreshData} label="操作">刷新</Form.Button>
        </Form>
        {showLookupModal && <TeamMemberLookupModal teamID={team} onUpdate={(s) => setFilteredUser(s)} onClose={() => setShowLookupModal(false)}></TeamMemberLookupModal>}</>
}
export default TeamStatisticsView;
