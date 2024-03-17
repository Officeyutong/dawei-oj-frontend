import { useEffect, useMemo, useState } from "react";
import { Dimmer, Header, Loader, Segment } from "semantic-ui-react";
import { UserStatisticEntry } from "../client/types";
import { DateTime } from "luxon";
import userClient from "../client/UserClient";
import { ProblemTagEntry } from "../../../common/types";
import problemClient from "../../problem/client/ProblemClient";

const UserStatisticsChart: React.FC<{ uid: number }> = ({ uid }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<UserStatisticEntry[]>([]);
    const [tags, setTags] = useState<Map<string, number>>(new Map());
    const [difficulty, setDifficulty] = useState<Map<number, number>>(new Map());

    const [endTime, setEndTime] = useState<luxon.DateTime>(DateTime.now().minus({ days: 1 }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }));
    const [duration, setDuration] = useState<number>(14);

    const [allTags, setAllTags] = useState<ProblemTagEntry[]>([]);
    const [tagsLoaded, setTagsLoaded] = useState(false);
    const tagMapping = useMemo(() => new Map(allTags.map(x => ([x.id, x]))), [allTags]);
    useEffect(() => {
        if (!tagsLoaded) {
            problemClient.getProblemtags().then(resp => {
                setAllTags(resp);
                setTagsLoaded(true);
            })
        }
    }, [tagsLoaded]);
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
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
                            submissionCount: 0
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
            } catch { } finally {
                setLoading(false);
            }
        })();
    }, [endTime, duration, uid]);
    return <>
        <Header as="h3">统计数据</Header>
        <Segment stacked>
            {loading && <Dimmer active><Loader></Loader></Dimmer>}
            qaq
        </Segment>
    </>
};

export default UserStatisticsChart;
