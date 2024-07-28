import { useEffect, useMemo, useState } from "react";
import { AllUserListEntry } from "../../admin/client/types";
import { useInputValue } from "../../../common/Utils";
import { adminClient } from "../../admin/client/AdminClient";
import { Button, Dimmer, Divider, Form, Loader, Modal, Pagination, Table } from "semantic-ui-react";
import UserLink from "../../utils/UserLink";

const ITEMS_PER_PAGE = 10;
interface SelectedUser { uid: number; email: string; username: string; real_name?: string };

const SelectUserModal: React.FC<{ closeCallback: (s?: SelectedUser) => void }> = ({ closeCallback }) => {
    const [data, setData] = useState<AllUserListEntry[] | null>(null);
    const [loading, setLoading] = useState(false);
    const filterKeyword = useInputValue("");
    const filteredList = useMemo(() => {
        if (data === null) return [];
        return data.filter(t => (t.email.search(filterKeyword.value) !== -1 || t.username.search(filterKeyword.value) !== -1 || (t.phoneNumber && t.phoneNumber.search(filterKeyword.value) !== -1) || (t.realName && t.realName.search(filterKeyword.value) !== -1)));
    }, [data, filterKeyword.value]);
    const [page, setPage] = useState(1);
    const pageCount = Math.ceil(filteredList.length / ITEMS_PER_PAGE);
    const currToRender = useMemo(() => filteredList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE), [filteredList, page]);
    useEffect(() => {
        if (data === null) (async () => {
            try {
                setLoading(true);
                const data = await adminClient.getAllUsers(undefined);
                setData(data);
                setLoading(false);
            } catch { } finally { }
        })();
    }, [data]);

    return <Modal open size="small">
        <Modal.Header>选择用户</Modal.Header>
        <Modal.Content>
            {loading && <Dimmer active><Loader active></Loader></Dimmer>}
            <Form>
                <Form.Input {...filterKeyword} label="按关键字过滤"></Form.Input>
            </Form>
            <Divider></Divider>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>用户名</Table.HeaderCell>
                        <Table.HeaderCell>电子邮箱</Table.HeaderCell>
                        <Table.HeaderCell>手机号</Table.HeaderCell>
                        <Table.HeaderCell>姓名</Table.HeaderCell>
                        <Table.HeaderCell>操作</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {currToRender.map(line => <Table.Row key={line.uid}>
                        <Table.Cell><UserLink data={line}></UserLink></Table.Cell>
                        <Table.Cell>{line.email}</Table.Cell>
                        <Table.Cell>{line.phoneNumber || "-"}</Table.Cell>
                        <Table.Cell>{line.realName || "-"}</Table.Cell>
                        <Table.Cell><Button size="small" color="green" onClick={() => closeCallback(line)}>选中</Button></Table.Cell>
                    </Table.Row>)}
                </Table.Body>
            </Table>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
                <Pagination totalPages={Math.max(pageCount, 1)} activePage={page} onPageChange={(_, d) => setPage(d.activePage as number)}></Pagination>
            </div>
        </Modal.Content>
        <Modal.Actions>
            <Button size="small" color="red" onClick={() => closeCallback()} disabled={loading}>取消</Button>
        </Modal.Actions>
    </Modal>
}

export default SelectUserModal;
export type { SelectedUser };
