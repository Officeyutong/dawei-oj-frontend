import { Dimmer, Divider, Form, Header, Loader } from "semantic-ui-react";
import DatetimePickler from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import 'moment/locale/zh-cn';
import { useCallback, useEffect, useState } from "react";
import { DateTime } from "luxon";
import { SubmittedHomeworkCountStatisticsEntry } from "../client/types";
import visualProgrammingClient from "../client/VisualProgrammingClient";
import { ColumnChart } from "@opd/g2plot-react";
import { timestampToYMD } from "../../../common/Utils";
const TabStatisticsChart: React.FC<{}> = () => {
    const [endTime, setEndTime] = useState<luxon.DateTime>(DateTime.now().minus({ days: 0 }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }));
    const [duration, setDuration] = useState<number>(14);
    const [data, setData] = useState<null | SubmittedHomeworkCountStatisticsEntry[]>(null);
    const [loading, setLoading] = useState(false);
    const refreshData = useCallback(async () => {
        try {
            setLoading(true);
            const result: SubmittedHomeworkCountStatisticsEntry[] = [];
            const dataMap = new Map<number, SubmittedHomeworkCountStatisticsEntry>();
            for (const entry of await visualProgrammingClient.getSubmittedHomeworkStatistics((endTime.minus({ days: duration })).toSeconds(), endTime.toSeconds())) {
                dataMap.set(entry.date_timestamp, entry);
            }
            for (let now = endTime.minus({ days: duration }); !now.equals(endTime); now = now.plus({ days: 1 })) {
                const item = dataMap.get(now.toSeconds());
                if (item !== undefined) result.push(item);
                else result.push({ count: 0, date_timestamp: now.toSeconds() });
            }
            setData(result);
            setLoading(false);
        } catch { } finally { }
    }, [duration, endTime]);
    useEffect(() => {
        if (data === null) refreshData();
    }, [data, refreshData]);
    return <>
        {loading && <Dimmer active><Loader active></Loader></Dimmer>}
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
        <Divider></Divider>
        {data && <> <Header as="h3">
            按天分布的作业提交数
        </Header>
            <ColumnChart
                data={data.map(item => ({
                    date: timestampToYMD(item.date_timestamp),
                    value: item.count,
                    type: "提交过的作业数目"
                }))}
                xField="date"
                yField="value"
                seriesField="type"
                slider={{}}
            ></ColumnChart></>}

    </>
};

export default TabStatisticsChart;
