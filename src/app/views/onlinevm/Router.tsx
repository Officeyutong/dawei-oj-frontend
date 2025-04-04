import { Link, Route, Switch, useRouteMatch } from "react-router-dom";
import UserMainPage from "./user/UserMainPage";
import { Grid, Header, Menu, Segment } from "semantic-ui-react";
import { PUBLIC_URL } from "../../App";
import RechargeOrderList from "./user/RechargeOrderList";
import BalanceChangeList from "./user/BalanceChangeList";
import RefundList from "./user/RefundList";
import OnlineVMAdmin from "./admin/OnlineVMAdmin";
import OnlineVMPage from "./user/OnlineVMPage";
import VMOrderList from "./user/VMOrderList";

const OnlineVMRouter: React.FC<React.PropsWithChildren<{}>> = () => {
    const match = useRouteMatch();
    return <>
        <Switch>
            <Route exact path={`${match.path}/admin`}>
                <OnlineVMAdmin></OnlineVMAdmin>
            </Route>
            <>
                <Header as="h1">
                    在线NOI Linux体验环境
                </Header>
                <div style={{ paddingTop: "10px" }}>
                    <Grid columns={2}>
                        <Grid.Column width={3}>
                            <Menu fluid vertical >
                                <Menu.Item
                                    name="基本信息"
                                    as={Link}
                                    to={`${PUBLIC_URL}/onlinevm/`}
                                ></Menu.Item>
                                <Menu.Item
                                    name="余额记录"
                                    as={Link}
                                    to={`${PUBLIC_URL}/onlinevm/balance_change_list`}
                                ></Menu.Item>
                                <Menu.Item
                                    name="充值订单"
                                    as={Link}
                                    to={`${PUBLIC_URL}/onlinevm/recharge_order_list`}
                                ></Menu.Item>
                                <Menu.Item
                                    name="机器订单"
                                    as={Link}
                                    to={`${PUBLIC_URL}/onlinevm/vm_order_list`}
                                ></Menu.Item>
                                <Menu.Item
                                    name="退款记录"
                                    as={Link}
                                    to={`${PUBLIC_URL}/onlinevm/refund_list`}
                                ></Menu.Item>
                            </Menu>
                        </Grid.Column>
                        <Grid.Column width={13}>
                            <Segment>
                                <Route exact path={`${match.path}/`}>
                                    <UserMainPage></UserMainPage>
                                </Route>
                                <Route exact path={`${match.path}/recharge_order_list`}>
                                    <RechargeOrderList></RechargeOrderList>
                                </Route>
                                <Route exact path={`${match.path}/balance_change_list`}>
                                    <BalanceChangeList></BalanceChangeList>
                                </Route>
                                <Route exact path={`${match.path}/refund_list`}>
                                    <RefundList></RefundList>
                                </Route>
                                <Route exact path={`${match.path}/vm_page/:orderid`}>
                                    <OnlineVMPage></OnlineVMPage>
                                </Route>
                                <Route exact path={`${match.path}/vm_order_list`}>
                                    <VMOrderList></VMOrderList>
                                </Route>
                            </Segment>
                        </Grid.Column>
                    </Grid>
                </div>
            </>

        </Switch >

    </>
};

export default OnlineVMRouter;
