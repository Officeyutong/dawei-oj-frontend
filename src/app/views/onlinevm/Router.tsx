import { Link, Route, useRouteMatch } from "react-router-dom";
import UserMainPage from "./user/UserMainPage";
import { Grid, Header, Menu, Segment } from "semantic-ui-react";
import { PUBLIC_URL } from "../../App";
import RechargeOrderList from "./user/RechargeOrderList";
import BalanceChangeList from "./user/BalanceChangeList";

const OnlineVMRouter: React.FC<React.PropsWithChildren<{}>> = () => {
    const match = useRouteMatch();
    return <>
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
                        <Route exact path={`${PUBLIC_URL}/onlinevm/recharge_order_list`}>
                            <RechargeOrderList></RechargeOrderList>
                        </Route>
                        <Route exact path={`${PUBLIC_URL}/onlinevm/balance_change_list`}>
                            <BalanceChangeList></BalanceChangeList>
                        </Route>
                    </Segment>
                </Grid.Column>
            </Grid>
        </div>


    </>
};

export default OnlineVMRouter;
