import { useEffect, useMemo, useState } from "react";
import { AllUserListEntry } from "../client/types";
import { Button, Dimmer, Divider, Form, Grid, Header, Loader, Pagination, Table } from "semantic-ui-react";
import { adminClient } from "../client/AdminClient";
import UserLink from "../../utils/UserLink";
import { useInputValue } from "../../../common/Utils";
import { showErrorModal } from "../../../dialogs/Dialog";
import TeamPermissionGrantModal from "./modals/TeamPermissionGrantModal";
import { TeamListEntry } from "../../team/client/types";
import teamClient from "../../team/client/TeamClient";

const ITEMS_PER_PAGE = 30;


const UserBatchManagement = () => {
    const [fullData, setfullData] = useState<AllUserListEntry[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [filteringTeamID, setFilteringTeamID] = useState<number | undefined>(undefined);
    const [selectedList, setSelectedList] = useState<AllUserListEntry[]>([]);
    const [page, setPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [teamList, setTeamList] = useState<TeamListEntry[] | null>(null);
    const keywordFilter = useInputValue("");

    const filteredList = useMemo(() => fullData.filter(t => (t.email.search(keywordFilter.value) !== -1 || t.username.search(keywordFilter.value) !== -1 || (t.phoneNumber && t.phoneNumber.search(keywordFilter.value) !== -1) || (t.realName && t.realName.search(keywordFilter.value) !== -1))), [fullData, keywordFilter.value]);
    const pageCount = Math.ceil(filteredList.length / ITEMS_PER_PAGE);
    const currToRender = useMemo(() => filteredList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE), [filteredList, page]);
    const refreshUserList = async (filteringTeamID: number | undefined, shouldRefreshTeamList: boolean = false) => {
        try {
            setLoading(true);
            if (shouldRefreshTeamList) {
                const [a, b] = await Promise.all([adminClient.getAllUsers(filteringTeamID), teamClient.getTeamList()]);
                setfullData(a);
                setTeamList(b);
            } else {
                const data = await adminClient.getAllUsers(filteringTeamID);
                setfullData(data);
            }
            setPage(1);
            setFilteringTeamID(filteringTeamID);
            setLoaded(true);
        } catch { } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (!loaded) {
            refreshUserList(undefined, true);
        }
    }, [loaded]);
    const currentSelectedUID = useMemo(() => {
        return new Set(selectedList.map(x => x.uid));
    }, [selectedList]);
    return <div>
        {modalOpen && <TeamPermissionGrantModal users={selectedList} onClose={() => setModalOpen(false)}></TeamPermissionGrantModal>}
        {loading && <Dimmer active><Loader></Loader></Dimmer>}
        {loaded && <Grid columns="2">
            <Grid.Column style={{ width: "max-content" }}>
                <Header as="h3">用户列表</Header>
                <Form>
                    <Form.Checkbox toggle label="只显示被授权了某个团队使用权限的用户" checked={filteringTeamID !== undefined} onChange={(_, d) => d.checked ? setFilteringTeamID(1) : refreshUserList(undefined)}></Form.Checkbox>
                    {filteringTeamID && <>
                        <Form.Select value={filteringTeamID} onChange={(_, d) => setFilteringTeamID(d.value! as number)} label="团队" options={
                            teamList!.map(t => ({ "text": `${t.id}. ${t.name}`, value: t.id }))
                        }></Form.Select>
                        <Form.Button color="green" size="small" onClick={() => refreshUserList(filteringTeamID)}>刷新</Form.Button>
                    </>}
                    <Form.Input {...keywordFilter} label="按关键字过滤"></Form.Input>
                    <Form.Button color="green" onClick={() => {
                        const toJoin = [];
                        for (const item of filteredList) if (!currentSelectedUID.has(item.uid)) toJoin.push(item);
                        if (selectedList.length + toJoin.length > 50) {
                            showErrorModal("最多同时选择50个用户!");
                            return;
                        }
                        setSelectedList([...selectedList, ...toJoin]);
                    }}>全部加入</Form.Button>
                </Form>
                <Table collapsing stackable size="small">
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
                            <Table.Cell>{selectedList.find(t => t.uid === line.uid) ? <Button color="red" size="tiny" onClick={() => setSelectedList(c => c.filter(t => t.uid !== line.uid))}>删除</Button> : <Button color="green" size="tiny" onClick={() => setSelectedList(c => [...c, line])}>加入</Button>}</Table.Cell>
                        </Table.Row>)}
                    </Table.Body>
                </Table>
                <Pagination totalPages={pageCount} activePage={page} onPageChange={(_, d) => setPage(d.activePage as number)}></Pagination>
            </Grid.Column>
            <Grid.Column>
                <Header as="h3">已选择的用户</Header>
                <Button color="green" onClick={() => setModalOpen(true)}>团队授权设置</Button>
                <Divider></Divider>
                <Button size="small" color="red" onClick={() => setSelectedList([])} >清空</Button>
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
                        {selectedList.map(line => <Table.Row key={line.uid}>
                            <Table.Cell>{line.uid}</Table.Cell>
                            <Table.Cell><UserLink data={line}></UserLink></Table.Cell>
                            <Table.Cell>{line.phoneNumber || "-"}</Table.Cell>
                            <Table.Cell>{line.realName || "-"}</Table.Cell>
                            <Table.Cell><Button color="red" size="tiny" onClick={() => setSelectedList(c => c.filter(t => t.uid !== line.uid))}>删除</Button></Table.Cell>
                        </Table.Row>)}
                    </Table.Body>
                </Table>
            </Grid.Column>
        </Grid>}
    </div>
}

export default UserBatchManagement;
