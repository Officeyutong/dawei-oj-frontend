import { Header, Tab } from "semantic-ui-react";
import TabHomeworkList from "./TabHomeworkList";
import { useDocumentTitle } from "../../../common/Utils";
import TabUserRanklist from "./TabUserRanklist";
import TabSubmissionList from "./TabSubmissionList";
import TabStatisticsChart from "./TabStatisticsChart";
import TabPerTeamStatistics from "./TabPerTeamStatistics";

const VisualProgrammingManagement: React.FC<{}> = () => {
    useDocumentTitle("管理可视化编程作业")
    return <>
        <Header as="h1">管理可视化编程作业</Header>
        <Tab renderActiveOnly={false} panes={[
            { menuItem: "编辑作业", pane: <Tab.Pane key={1} ><TabHomeworkList></TabHomeworkList></Tab.Pane> },
            { menuItem: "用户排行榜", pane: <Tab.Pane key={2}><TabUserRanklist></TabUserRanklist></Tab.Pane> },
            { menuItem: "可视化作业提交列表", pane: <Tab.Pane key={3}><TabSubmissionList></TabSubmissionList></Tab.Pane> },
            { menuItem: "统计图表", pane: <Tab.Pane key={4}><TabStatisticsChart></TabStatisticsChart></Tab.Pane> },
            { menuItem: "按团队统计", pane: <Tab.Pane key={5}><TabPerTeamStatistics></TabPerTeamStatistics></Tab.Pane> }
        ]}></Tab>
    </>
};

export default VisualProgrammingManagement
