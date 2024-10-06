import { useEffect, useState } from "react";
import { Button, Dimmer, Divider, Loader, Message, Table } from "semantic-ui-react";
import { PrivilegeStudentRecord } from "../client/types";
import onlineVMClient from "../client/OnlineVMClient";
import { ComplexUserLabel, timeStampToString } from "../../../common/Utils";
import SelectUserModal from "../../visual_programming/management/SelectUserModal";

const StudentPrivilegeTab: React.FC<{}> = () => {
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [data, setData] = useState<PrivilegeStudentRecord[]>([]);
    const [showSelectModal, setShowSelectModal] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            setData(await onlineVMClient.getStudentPrivilegeUsers());
            setLoaded(true);
        } catch { } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (!loaded) loadData();
    }, [loaded]);
    const doDelete = async (uid: number) => {
        try {
            setLoading(true);
            await onlineVMClient.removeStudentPrivilegeUser([uid]);
            await loadData();
        } catch { } finally {
            setLoading(false);
        }
    };
    const doAdd = async (uid: number) => {
        try {
            setLoading(true);
            await onlineVMClient.addStudentPrivilegeUser([uid]);
            await loadData();
        } catch { } finally {
            setLoading(false);
        }
    }
    return <>
        {showSelectModal && <SelectUserModal closeCallback={s => {
            if (s) doAdd(s.uid);
            setShowSelectModal(false);
        }}></SelectUserModal>}
        {loading && <Dimmer active><Loader></Loader></Dimmer>}
        <Message info>
            <Message.Header>说明</Message.Header>
            <Message.Content>
                <p>具有学员身份的用户可以购买部分仅限学员购买的产品。</p>
                <p>默认情况下，所有在OJ上处于团队之中的用户均具有学员身份。</p>
                <p>如果一个用户不在团队内，但仍然需要允许这个用户购买学员产品，则可以在此处加入。</p>
            </Message.Content>
        </Message>
        <Button color="green" onClick={() => setShowSelectModal(true)}>添加学员</Button>
        <Divider></Divider>
        <Table>
            <Table.Header>
                <Table.Row>

                    <Table.HeaderCell>用户</Table.HeaderCell>
                    <Table.HeaderCell>加入时间</Table.HeaderCell>
                    <Table.HeaderCell>操作</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {data.map(item => <Table.Row key={item.user.uid}>
                    <Table.Cell><ComplexUserLabel user={item.user}></ComplexUserLabel></Table.Cell>
                    <Table.Cell>{timeStampToString(item.create_time)}</Table.Cell>
                    <Table.Cell><Button size="small" color="red" onClick={() => doDelete(item.user.uid)}>删除</Button></Table.Cell>
                </Table.Row>)}
            </Table.Body>
        </Table>
    </>
};

export default StudentPrivilegeTab;
