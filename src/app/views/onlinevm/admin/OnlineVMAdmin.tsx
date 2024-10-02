import { Header, Tab } from "semantic-ui-react"
import { useDocumentTitle } from "../../../common/Utils"

const OnlineVMAdmin: React.FC<{}> = () => {
    useDocumentTitle("在线虚拟机后台管理")
    return <>
        <Header as="h1">
            在线虚拟机后台管理
        </Header>
        <Tab renderActiveOnly={false} panes={[
            { menuItem: "交易记录", pane: <Tab.Pane key={1}></Tab.Pane> },
            { menuItem: "充值订单", pane: <Tab.Pane key={2}></Tab.Pane> },
            { menuItem: "机器订单", pane: <Tab.Pane key={3}></Tab.Pane> },
            { menuItem: "产品管理", pane: <Tab.Pane key={4}></Tab.Pane> },
            { menuItem: "退款记录", pane: <Tab.Pane key={5}></Tab.Pane> },

        ]}></Tab>
    </>
};

export default OnlineVMAdmin;

