import { useEffect, useMemo, useState } from "react";
import { AllUserListEntry } from "../../admin/client/types";
import { adminClient } from "../../admin/client/AdminClient";
import { useInputValue } from "../../../common/Utils";
import { Button, Checkbox, Dimmer, Divider, Dropdown, Form, Grid, Header, Loader, Message, Modal, Pagination, Table } from "semantic-ui-react";
import { videoRecordPlayClient } from "../client/VideoCourseClient";
import UserLink from "../../utils/UserLink";
import { showSuccessModal } from "../../../dialogs/Dialog";

const ITEMS_PER_PAGE = 50;


const VideoCourseDirectoryUserGrantModal: React.FC<{
    videoCourseDirectoryId: number;
    onClose: () => void;
}> = ({ videoCourseDirectoryId, onClose }) => {
    const [allUsers, setAllUsers] = useState<AllUserListEntry[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<AllUserListEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [page, setPage] = useState(1);
    const searchKeyword = useInputValue("");


    const permissionGroups = useMemo(() => {
        const map = new Map<string, string>();
        for (const item of allUsers) map.set(item.permission_group.id, item.permission_group.name);
        return map;
    }, [allUsers]);

    const [filterByPermissionGroup, setFilterByPermissionGroup] = useState(false);
    const [selectedPermissionGroup, setSelectedPermissionGroup] = useState<string | null>(null);
    useEffect(() => {
        if (permissionGroups.size > 0) {
            setSelectedPermissionGroup(permissionGroups.keys().next().value!);
        }
    }, [permissionGroups]);
    useEffect(() => {
        if (!filterByPermissionGroup) setSelectedPermissionGroup(null);
    }, [filterByPermissionGroup]);

    const filteredList = useMemo(() => allUsers.filter(t => {
        const keywordMatched = (t.email.search(searchKeyword.value) !== -1 || t.username.search(searchKeyword.value) !== -1 || (t.phoneNumber && t.phoneNumber.search(searchKeyword.value) !== -1) || (t.realName && t.realName.search(searchKeyword.value) !== -1));
        if (filterByPermissionGroup === false || selectedPermissionGroup === null) return keywordMatched;
        else {
            return keywordMatched && t.permission_group.id === selectedPermissionGroup;
        }
    }), [allUsers, filterByPermissionGroup, searchKeyword.value, selectedPermissionGroup]);
    const pageCount = Math.ceil(filteredList.length / ITEMS_PER_PAGE);
    const currToRender = useMemo(() => filteredList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE), [filteredList, page]);

    useEffect(() => {
        if (!loaded) (async () => {
            try {
                setLoading(true);
                const [a, b] = await Promise.all([
                    adminClient.getAllUsers(undefined),
                    videoRecordPlayClient.getUsableUsersForVideoDirectory(videoCourseDirectoryId)
                ]);
                setAllUsers(a);
                setSelectedUsers(b);
                setLoaded(true);
                setLoading(false);
            } catch { } finally {

            }
        })();
    }, [loaded, videoCourseDirectoryId]);
    const doSave = async () => {
        try {
            setLoading(true);
            await videoRecordPlayClient.setUsableUsersForVideoDirectory(videoCourseDirectoryId, selectedUsers.map(s => s.uid));
            showSuccessModal("操作完成");
        } catch { } finally { setLoading(false); }
    };
    return <Modal size="large" open>
        <Modal.Header>
            设置用户授权
        </Modal.Header>
        <Modal.Content>
            {loading && <Dimmer page active><Loader></Loader></Dimmer>}
            <Message info>
                <Message.Header>说明</Message.Header>
                <Message.Content>
                    此处设置哪些用户可以使用该课程目录。左侧是网站上所有的用户列表，右侧显示的是当前可以使用该课程目录的用户。在左侧点击“添加”可以将一个用户添加到右侧。操作完成后点击保存按钮应用更改。
                </Message.Content>
            </Message>
            <Grid columns={2}>
                <Grid.Column>
                    <Form>
                        <Form.Input {...searchKeyword} label="按用户关键字过滤"></Form.Input>
                        <Form.Field>
                            <Checkbox toggle checked={filterByPermissionGroup} onClick={() => setFilterByPermissionGroup(c => !c)} label="按权限组过滤"></Checkbox>
                        </Form.Field>
                        {filterByPermissionGroup && <Form.Field>
                            <Dropdown
                                selection
                                options={[...permissionGroups.entries()].map(([key, value]: [string, string]) => ({
                                    text: `${value} (${key})`,
                                    value: key
                                }))}
                                placeholder="请在此处选择权限组"
                                onChange={(_, d) => {
                                    setSelectedPermissionGroup(d.value as string);
                                }}
                                value={selectedPermissionGroup || undefined}
                            ></Dropdown>
                        </Form.Field>}
                    </Form>
                    <Divider></Divider>
                    <div style={{ overflowY: "scroll", maxHeight: "300px" }}>
                        <Table size="small">
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>用户名</Table.HeaderCell>
                                    <Table.HeaderCell>手机号</Table.HeaderCell>
                                    <Table.HeaderCell>姓名</Table.HeaderCell>
                                    <Table.HeaderCell>操作</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {currToRender.map(line => <Table.Row key={line.uid}>
                                    <Table.Cell><UserLink data={line}></UserLink></Table.Cell>
                                    <Table.Cell>{line.phoneNumber || "-"}</Table.Cell>
                                    <Table.Cell>{line.realName || "-"}</Table.Cell>
                                    <Table.Cell>{selectedUsers.find(t => t.uid === line.uid) ? <Button color="red" size="tiny" onClick={() => setSelectedUsers(c => c.filter(t => t.uid !== line.uid))}>删除</Button> : <Button color="green" size="tiny" onClick={() => setSelectedUsers(c => [...c, line])}>加入</Button>}</Table.Cell>
                                </Table.Row>)}
                            </Table.Body>
                        </Table>
                    </div>
                    <Divider></Divider>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <Pagination totalPages={Math.max(pageCount, 1)} activePage={page} onPageChange={(_, d) => setPage(d.activePage as number)}></Pagination>
                    </div>
                </Grid.Column>
                <Grid.Column  >
                    <Header as="h3">已选择的用户</Header>
                    <div style={{ overflowY: "scroll", maxHeight: "300px" }}>
                        <Table size="small">
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>用户ID</Table.HeaderCell>
                                    <Table.HeaderCell>用户名</Table.HeaderCell>
                                    <Table.HeaderCell>手机号</Table.HeaderCell>
                                    <Table.HeaderCell>姓名</Table.HeaderCell>
                                    <Table.HeaderCell></Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {selectedUsers.map(line => <Table.Row key={line.uid}>
                                    <Table.Cell>{line.uid}</Table.Cell>
                                    <Table.Cell><UserLink data={line}></UserLink></Table.Cell>
                                    <Table.Cell>{line.phoneNumber || "-"}</Table.Cell>
                                    <Table.Cell>{line.realName || "-"}</Table.Cell>
                                    <Table.Cell><Button color="red" size="tiny" onClick={() => setSelectedUsers(c => c.filter(t => t.uid !== line.uid))}>删除</Button></Table.Cell>
                                </Table.Row>)}
                            </Table.Body>
                        </Table>
                    </div>
                </Grid.Column>
            </Grid>
        </Modal.Content>
        <Modal.Actions>
            <Button color="green" disabled={loading} onClick={doSave}>保存</Button>
            <Button color="red" disabled={loading} onClick={() => onClose()}>取消</Button>
        </Modal.Actions>
    </Modal>
};

export default VideoCourseDirectoryUserGrantModal;
