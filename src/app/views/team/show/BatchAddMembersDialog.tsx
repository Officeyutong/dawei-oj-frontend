import { useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Dimmer, Dropdown, Form, Grid, Input, Loader, Message, Modal, Table } from "semantic-ui-react";
import { KeyDownEvent } from "../../../common/types";
import { useInputValue } from "../../../common/Utils";
import { GlobalRanklistItem } from "../../user/client/types";
import userClient from "../../user/client/UserClient";
import UserLink from "../../utils/UserLink";
import teamClient from "../client/TeamClient";
import { TeamDetail } from "../client/types";
import { PermissionGroupList } from "../../admin/client/types";
import { adminClient } from "../../admin/client/AdminClient";

interface BatchAddMembersProps {
    team: number;
    finishCallback: () => void;
    onClose: () => void;
    open: boolean;
    teamMembers: TeamDetail["members"];
};

type UserListEntry = Pick<GlobalRanklistItem, "uid" | "real_name" | "username">;

const BatchAddMembers: React.FC<React.PropsWithChildren<BatchAddMembersProps>> = ({ team, finishCallback, onClose, open, teamMembers }) => {
    const [used, setUsed] = useState<UserListEntry[]>([]);
    const [searchResult, setSearchResult] = useState<UserListEntry[]>([]);
    const searchText = useInputValue();
    const [loading, setLoading] = useState(false);
    const [beAdmin, setBeAdmin] = useState(false);
    const [currentFilterMethod, setCurrentFilterMethod] = useState<"username" | "permission_group">("username");
    const usedSet = useMemo(() => new Set(used.map(x => x.uid)), [used]);
    const memberSet = useMemo(() => new Set(teamMembers.map(x => x.uid)), [teamMembers]);
    const [loaded, setLoaded] = useState(false);

    const [selectedPermissionGroup, setSelectedPermissionGroup] = useState<null | string>(null);
    const [permissionGroupList, setPermissionGroupList] = useState<PermissionGroupList | null>(null);

    const doUsernameSearch = async () => {
        try {
            setLoading(true);
            const resp = await userClient.getGlobalRanklist(1, searchText.value);
            setSearchResult(resp.ranklist);
        } catch { } finally {
            setLoading(false);
        }
    };
    const doPermissionGroupSearch = async (groupId: string) => {
        try {
            setLoading(true);
            setSearchResult(await teamClient.searchUsersByPermissionGroup(groupId));
        } catch { } finally { setLoading(false); }
    };
    const submit = async () => {
        try {
            setLoading(true);
            await teamClient.batchAddMembers(team, used.map(x => x.uid), beAdmin);
            finishCallback();
            onClose();
        } catch { } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (!loaded) {
            (async () => {
                try {
                    setLoading(true);
                    setPermissionGroupList(await adminClient.getPermissionGroupList());
                    setLoaded(true);
                } catch { } finally {
                    setLoading(false);
                }
            })();
        }
    }, [loaded]);
    return <Modal
        open={open}
        onClose={onClose}
        closeOnDimmerClick={false}
    >
        <Modal.Header>
            批量添加用户
        </Modal.Header>
        <Modal.Content>
            {loading && <Dimmer active>
                <Loader></Loader>
            </Dimmer>}
            <Grid columns="2">
                <Grid.Column>
                    <Grid columns="1">
                        <Grid.Column>
                            <Form>
                                <Form.Group widths={2}>
                                    <Form.Radio checked={currentFilterMethod === "username"} label="按用户名/姓名过滤" onClick={() => setCurrentFilterMethod("username")}></Form.Radio>
                                    <Form.Radio checked={currentFilterMethod === "permission_group"} label="按权限组过滤" onClick={() => setCurrentFilterMethod("permission_group")}></Form.Radio>
                                </Form.Group>
                                <Form.Field>
                                    {currentFilterMethod === "username" && <Input {...searchText} placeholder="输入用户名进行搜索" fluid actionPosition="left" action={{
                                        color: "green",
                                        content: "搜索",
                                        onClick: doUsernameSearch
                                    }} onKeyDown={(evt: KeyDownEvent) => {
                                        if (evt.code === "Enter") {
                                            doUsernameSearch();
                                        }
                                    }}></Input>}
                                    {currentFilterMethod === "permission_group" && permissionGroupList !== null && <Dropdown
                                        selection
                                        options={permissionGroupList.map(item => ({
                                            text: `${item.name} (${item.id})`,
                                            value: item.id
                                        }))}
                                        placeholder="请在此处选择权限组"
                                        onChange={(_, d) => {
                                            setSelectedPermissionGroup(d.value as string);
                                            doPermissionGroupSearch(d.value as string);
                                        }}
                                        value={selectedPermissionGroup || undefined}
                                    ></Dropdown>}
                                </Form.Field>
                            </Form>
                        </Grid.Column>
                        <Grid.Column style={{ overflowY: "scroll", maxHeight: "400px" }}>
                            <Table>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>UID</Table.HeaderCell>
                                        <Table.HeaderCell>用户</Table.HeaderCell>
                                        <Table.HeaderCell>操作</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {searchResult.map(x => <Table.Row key={x.uid}>
                                        <Table.Cell>{x.uid}</Table.Cell>
                                        <Table.Cell><UserLink data={x}></UserLink>{x.real_name && `（${x.real_name}）`}</Table.Cell>
                                        <Table.Cell>
                                            <Button color="green" size="tiny" onClick={() => setUsed([...used, x])} disabled={usedSet.has(x.uid) || memberSet.has(x.uid)}>添加</Button>
                                        </Table.Cell>
                                    </Table.Row>)}
                                    {searchResult.length === 0 && <Table.Cell colSpan={2}>
                                        搜索无结果...
                                    </Table.Cell>}
                                </Table.Body>
                            </Table>
                        </Grid.Column>
                    </Grid>
                </Grid.Column>
                <Grid.Column style={{ overflowY: "scroll", maxHeight: "400px" }}>
                    <Checkbox toggle checked={beAdmin} onChange={(e, d) => setBeAdmin(d.checked!)} label="设置为团队管理员"></Checkbox>
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>用户</Table.HeaderCell>
                                <Table.HeaderCell>操作</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {used.map(x => <Table.Row key={x.uid}>
                                <Table.Cell><UserLink data={x}></UserLink></Table.Cell>
                                <Table.Cell><Button size="tiny" color="red" onClick={() => setUsed(used.filter(y => y.uid !== x.uid))}>移除</Button></Table.Cell>
                            </Table.Row>)}
                        </Table.Body>
                    </Table>

                </Grid.Column>
            </Grid>
            <Message info>
                <Message.Header>提示</Message.Header>
                <Message.Content>
                    请在左上方搜索相应成员的用户名，而后点击添加按钮将其添加到右侧列表内。选择完需要添加的用户后，点击右下方确认按钮，即可将所选的用户添加至团队中。搜索结果可能会受数量限制。
                </Message.Content>
            </Message>
        </Modal.Content>
        <Modal.Actions>
            <Button onClick={submit} color="green">
                确定
            </Button>
            <Button onClick={onClose} color="red">
                取消
            </Button>
        </Modal.Actions>
    </Modal>;
};

export default BatchAddMembers;
