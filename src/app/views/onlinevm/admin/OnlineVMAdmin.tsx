import { Header, Tab } from "semantic-ui-react"
import { useDocumentTitle } from "../../../common/Utils"
import TransactionTab from "./TransactionTab";
import RechargeOrderTab from "./RechargeOrderTab";
import RefundListTab from "./RefundListTab";
import ProductList from "./ProductList";
import VMOrderListTab from "./VMOrderListTab";
import StudentPrivilegeTab from "./StudentPrivilegeTab";

const OnlineVMAdmin: React.FC<{}> = () => {
    useDocumentTitle("在线虚拟机后台管理")
    return <>
        <Header as="h1">
            在线虚拟机后台管理
        </Header>
        <Tab renderActiveOnly={false} panes={[
            {
                menuItem: "交易记录", pane: <Tab.Pane key={1}>
                    <TransactionTab></TransactionTab>
                </Tab.Pane>
            },
            {
                menuItem: "充值订单", pane: <Tab.Pane key={2}>
                    <RechargeOrderTab></RechargeOrderTab>
                </Tab.Pane>
            },
            {
                menuItem: "机器订单", pane: <Tab.Pane key={3}>
                    <VMOrderListTab></VMOrderListTab>
                </Tab.Pane>
            },
            {
                menuItem: "产品管理", pane: <Tab.Pane key={4}>
                    <ProductList></ProductList>
                </Tab.Pane>
            },
            {
                menuItem: "退款记录", pane: <Tab.Pane key={5}>
                    <RefundListTab></RefundListTab>
                </Tab.Pane>
            },
            {
                menuItem: "学员管理", pane: <Tab.Pane key={6}>
                    <StudentPrivilegeTab></StudentPrivilegeTab>
                </Tab.Pane>
            }

        ]}></Tab>
    </>
};

export default OnlineVMAdmin;

