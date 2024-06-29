import { Header, Tab } from "semantic-ui-react";
import HomeworkList from "./HomeworkList";
import { useDocumentTitle } from "../../../common/Utils";
import UserRanklist from "./UserRanklist";

const VisualProgrammingManagement: React.FC<{}> = () => {
    useDocumentTitle("管理可视化编程作业")
    return <>
        <Header as="h1">管理可视化编程作业</Header>
        <Tab renderActiveOnly={false} panes={[
            { menuItem: "编辑作业", pane: <Tab.Pane key={1} ><HomeworkList></HomeworkList></Tab.Pane> },
            { menuItem: "用户排行榜", pane: <Tab.Pane key={2}><UserRanklist></UserRanklist></Tab.Pane> }
        ]}></Tab>
    </>
};

export default VisualProgrammingManagement
