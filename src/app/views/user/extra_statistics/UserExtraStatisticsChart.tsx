import { useEffect, useState } from "react";
import { UserExtraStatistics } from "../client/types";
import userClient from "../client/UserClient";
import { Dimmer, Loader, Tab } from "semantic-ui-react";
import CourseWatchProgress from "./CourseWatchProgress";
import TeamProblemsetStatistics from "./TeamProblemsetStatistics";
import UserStatisticsChart from "../profile/UserStatisticsChart";

const UserExtraStatisticsChart: React.FC<{ uid: number; allThingsInOneColumn?: boolean; }> = ({ uid, allThingsInOneColumn }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<null | UserExtraStatistics>(null);
    useEffect(() => {
        if (data === null) {
            (async () => {
                try {
                    setLoading(true);
                    const data = await userClient.getUserExtraStatistics(uid);
                    setData(data);
                } catch { } finally { setLoading(false); }
            })();
        }
    }, [data, uid]);
    return <>
        {loading && <div style={{ height: "400px" }}><Dimmer active><Loader active></Loader></Dimmer></div>}
        {data !== null && <Tab renderActiveOnly={false} panes={[
            { menuItem: "看课统计", pane: <Tab.Pane key={1}><CourseWatchProgress data={data.course_watch}></CourseWatchProgress></Tab.Pane> },
            { menuItem: "作业统计", pane: <Tab.Pane key={2}><TeamProblemsetStatistics data={data.problemset_statistics}></TeamProblemsetStatistics></Tab.Pane> },
            { menuItem: "刷题统计", pane: <Tab.Pane key={3}><UserStatisticsChart uid={uid} allThingsInOneColumn={allThingsInOneColumn}></UserStatisticsChart></Tab.Pane> }
        ]}></Tab>}
    </>;
};

export default UserExtraStatisticsChart;
