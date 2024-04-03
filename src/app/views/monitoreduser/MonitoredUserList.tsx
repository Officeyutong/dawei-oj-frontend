import { useEffect, useState } from "react";
import { timeStampToString, useDocumentTitle } from "../../common/Utils";
import { Button, Dimmer, Divider, Header, Loader, Message, Segment, Table } from "semantic-ui-react";
import { MonitoredUserEntry } from "./client/types";
import UserLink from "../utils/UserLink";
import monitoredUserClient from "./client/MonitoredUserClient";
import AddMonitoredUserModal from "./AddMinotoredUserModal";
import StatisticsModal from "./StatisticsModal";

const MonitoredUserList: React.FC<{}> = () => {
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<MonitoredUserEntry[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [viewingUid, setViewingUid] = useState<null | number>(null);

    useDocumentTitle("被监视用户列表");
    const refreshList = async () => {
        try {
            setLoading(true);
            setData(await monitoredUserClient.listMonitoredUsers());
            setLoaded(true);
        } catch { } finally {
            setLoading(false);
        }
    }
    const removeAt = async (uid: number) => {
        try {
            setLoading(true);
            await monitoredUserClient.removeMonitoredUser(uid);
            setLoading(true);
            await refreshList();
        } catch { } finally { setLoading(false); }
    }
    useEffect(() => {
        if (!loaded) refreshList();
    }, [loaded]);
    return <div>
        <Header as="h1">被监视用户列表</Header>
        <Segment stacked>
            <Message info>
                <Message.Header>提示</Message.Header>
                <Message.Content>
                    您可以查看此处用户的学习统计情况。如果您绑定了微信号，那么您可以每天在微信公众号上收到关于下列用户学习进度的推送。
                </Message.Content>
            </Message>
            {showAddModal && <AddMonitoredUserModal onClose={b => {
                setShowAddModal(false);
                if (b) refreshList();
            }}></AddMonitoredUserModal>}
            {viewingUid !== null && <StatisticsModal uid={viewingUid} onClose={() => setViewingUid(null)}></StatisticsModal>}
            {loading && <Dimmer active><Loader></Loader></Dimmer>}
            <Button color="green" onClick={() => setShowAddModal(true)}>添加</Button>
            <Divider></Divider>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>用户ID</Table.HeaderCell>
                        <Table.HeaderCell>用户名</Table.HeaderCell>
                        <Table.HeaderCell>实名</Table.HeaderCell>
                        <Table.HeaderCell>最后访问时间</Table.HeaderCell>
                        <Table.HeaderCell>操作</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data.map(item => <Table.Row key={item.uid}>
                        <Table.Cell>{item.uid}</Table.Cell>
                        <Table.Cell><UserLink data={item}></UserLink></Table.Cell>
                        <Table.Cell>{item.realName || "<未填写>"}</Table.Cell>
                        <Table.Cell>{item.lastLogin === null ? "<无数据>" : timeStampToString(item.lastLogin)}</Table.Cell>
                        <Table.Cell>
                            <Button size="small" color="red" onClick={() => removeAt(item.uid)}>从列表中删除</Button>
                            <Button size="small" color="blue" onClick={() => {
                                setViewingUid(item.uid);

                            }}>查看统计数据</Button>
                        </Table.Cell>
                    </Table.Row>)}
                </Table.Body>
            </Table>
        </Segment>
    </div>;
};

export default MonitoredUserList;
