import { Header, Tab } from "semantic-ui-react";
import HomeworkList from "./TabHomeworkList";
import { useDocumentTitle } from "../../../common/Utils";
import UserRanklist from "./TabUserRanklist";
import TabSubmissionList from "./TabSubmissionList";

const VisualProgrammingManagement: React.FC<{}> = () => {
    useDocumentTitle("管理可视化编程作业")
    return <>
        <Header as="h1">管理可视化编程作业</Header>
        <Tab renderActiveOnly={false} panes={[
            { menuItem: "编辑作业", pane: <Tab.Pane key={1} ><HomeworkList></HomeworkList></Tab.Pane> },
            { menuItem: "用户排行榜", pane: <Tab.Pane key={2}><UserRanklist></UserRanklist></Tab.Pane> },
            { menuItem: "可视化作业提交列表", pane: <Tab.Pane key={3}><TabSubmissionList></TabSubmissionList></Tab.Pane> }
        ]}></Tab>
    </>
};

export default VisualProgrammingManagement
