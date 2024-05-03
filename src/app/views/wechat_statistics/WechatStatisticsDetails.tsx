import { useHistory, useParams } from "react-router-dom";
import { Button, Container, Dimmer, Header, Loader, Segment, Tab } from "semantic-ui-react";
import UserStatisticsChart from "../user/profile/UserStatisticsChart";
import { useDocumentTitle } from "../../common/Utils";
import { useEffect, useState } from "react";
import { UserExtraStatistics } from "../user/client/types";
import userClient from "../user/client/UserClient";
import CourseWatchProgress from "../user/extra_statistics/CourseWatchProgress";
import TeamProblemsetStatistics from "../user/extra_statistics/TeamProblemsetStatistics";

const WechatStatisticsDetails = () => {
    const uid = parseInt(useParams<{ uid: string }>().uid);
    const history = useHistory();
    useDocumentTitle("查看用户统计数据");
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
    return <Container>
        <Header as="h1">查看用户统计数据</Header>
        {loading && <div style={{ height: "400px" }}><Dimmer active><Loader active></Loader></Dimmer></div>}
        {data !== null && <Segment>
            <p>用户姓名: {data.real_name}</p>
            <Tab renderActiveOnly={false} panes={[
                { menuItem: "看课统计", pane: <Tab.Pane key={1}><CourseWatchProgress data={data.course_watch}></CourseWatchProgress></Tab.Pane> },
                { menuItem: "作业统计", pane: <Tab.Pane key={2}><TeamProblemsetStatistics data={data.problemset_statistics}></TeamProblemsetStatistics></Tab.Pane> },
                { menuItem: "刷题统计", pane: <Tab.Pane key={3}><UserStatisticsChart uid={uid} allThingsInOneColumn={true}></UserStatisticsChart></Tab.Pane> }
            ]}></Tab>
            <Button onClick={() => history.goBack()}>返回</Button>
        </Segment>}

    </Container>;
}

export default WechatStatisticsDetails;
