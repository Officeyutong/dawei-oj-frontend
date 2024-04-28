import { useEffect, useState } from "react";
import { Button, Container, Dimmer, Header, Loader, Segment, Table } from "semantic-ui-react";
import { PUBLIC_URL } from "../../App";
import { timeStampToString, useDocumentTitle } from "../../common/Utils";
import { MonitoredUserEntry } from "../monitoreduser/client/types";
import monitoredUserClient from "../monitoreduser/client/MonitoredUserClient";
import UserLink from "../utils/UserLink";
import userClient from "../user/client/UserClient";
import { Link } from "react-router-dom";

const WechatStatisticsList = () => {
    const [data, setData] = useState<MonitoredUserEntry[] | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    useDocumentTitle("绑定用户列表");

    const refreshList = async () => {
        try {
            setLoading(true);
            setData(await monitoredUserClient.listMonitoredUsers());
            setLoaded(true);
        } catch { } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        if (!loaded) refreshList();
    }, [loaded]);
    const logout = async () => {
        try {
            setLoading(true);
            await userClient.logout();
            window.location.href = `${PUBLIC_URL}/wechat_statistics_view/login`;
        } catch { } finally { setLoading(false); }
    };
    return <Container>
        <Header as="h1">绑定用户列表</Header>
        <Segment stacked>
            {loading && <div style={{ height: "400px" }}><Loader active><Dimmer active></Dimmer></Loader></div>}
            {loaded && data !== null && <Table basic="very">
                <Table.Body>
                    {data.map(item => <Table.Row key={item.uid}>
                        <Table.Cell>{item.realName}</Table.Cell>
                        <Table.Cell><UserLink data={item}></UserLink></Table.Cell>
                        <Table.Cell><p>最后登录时间:</p> {timeStampToString(item.lastLogin || 0)}</Table.Cell>
                        <Table.Cell><Button color="blue" size="small" as={Link} to={`${PUBLIC_URL}/wechat_statistics_view/details/${item.uid}`}>查看统计数据</Button></Table.Cell>
                    </Table.Row>)}
                </Table.Body>
            </Table>}
            <Button color="red" onClick={logout}>退出登录</Button>
        </Segment>
    </Container>;
};
export default WechatStatisticsList;
