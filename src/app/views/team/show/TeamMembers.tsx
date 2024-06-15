import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Grid, Header, Segment, Popup, Button, Container, Label, Pagination, Divider, Input } from "semantic-ui-react";
import UserLink from "../../utils/UserLink";
import { TeamDetail } from "../client/types";
import _ from "lodash";
import { makeProfileImageURL, useInputValue } from "../../../common/Utils";

interface TeamMembersProps {
    members: TeamDetail["members"];
    admins: TeamDetail["admins"];
    owner_id: number;
    setAdmin: (uid: number, value: boolean) => void;
    kick: (uid: number) => void;
    hasManagePermission: boolean;
    isTeamOwner: boolean;
};
const UserCard: React.FC<React.PropsWithChildren<{ data: TeamDetail["members"][0]; slot?: React.ReactNode }>> = ({ data, slot }) => {
    return <Segment style={{ wordBreak: "break-all" }}>
        <Grid columns="2">
            <Grid.Column width="4">
                <img alt="" src={makeProfileImageURL(data.uid)} style={{ height: "38px", width: "38px", borderRadius: "19px" }}></img>
            </Grid.Column>
            <Grid.Column width="12">
                <Grid columns="1">
                    <Grid.Column style={{ fontSize: "20px" }}>
                        <UserLink data={data}></UserLink>
                    </Grid.Column>
                    <Grid.Column style={{ paddingTop: 0, paddingBottom: "5px" }}>
                        <Grid columns="2">
                            <Grid.Column >
                                <span style={{ color: "grey" }}>{data.group_name}</span>
                            </Grid.Column>
                            {slot && <Grid.Column>
                                {slot}
                            </Grid.Column>}
                        </Grid>
                    </Grid.Column>


                </Grid>
            </Grid.Column>
        </Grid>
    </Segment>;
}

const ITEMS_PER_PAGE = 30;

const TeamMembers: React.FC<React.PropsWithChildren<TeamMembersProps>> = (props) => {
    const [filteredMembers, setFilteredMembers] = useState<TeamMembersProps["members"]>([]);
    const filterKeyword = useInputValue("");
    useEffect(() => {
        setFilteredMembers(props.members);
    }, [props.members]);
    const doFilter = useCallback(() => {
        setFilteredMembers(props.members.filter(t => t.username.includes(filterKeyword.value)));
        setPage(1);
    }, [filterKeyword.value, props.members]);
    const admins = useMemo(() => new Set(props.admins), [props.admins]);
    const normalMembers = useMemo(() => {
        const filtered = filteredMembers.filter(x => (!admins.has(x.uid)) && x.uid !== props.owner_id);
        filtered.sort((x, y) => x.username < y.username ? -1 : 1);
        return filtered;
    }, [admins, filteredMembers, props.owner_id]);
    const adminMembers = useMemo(() => filteredMembers.filter(x => (admins.has(x.uid)) || x.uid === props.owner_id), [admins, filteredMembers, props.owner_id])
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(normalMembers.length / ITEMS_PER_PAGE);
    const showingNormalMembers = useMemo(() => {
        if (normalMembers.length === 0) return [];
        return _.chunk(normalMembers, ITEMS_PER_PAGE)[page - 1];
    }, [normalMembers, page]);
    return <>
        <Input {...filterKeyword} placeholder="过滤用户" action={{
            content: "搜索",
            onClick: doFilter
        }}></Input>
        <Header as="h3">
            管理员
        </Header>
        <Grid columns="3">
            {adminMembers.map(x => <Grid.Column key={x.uid}>
                <UserCard data={x} slot={x.uid !== props.owner_id ? (props.hasManagePermission && <Container textAlign="right">
                    <Popup
                        position="left center"
                        pinned
                        on="click"
                        trigger={<Button size="tiny" icon="add"></Button>}
                    >
                        <Button size="tiny" color="red" onClick={() => props.setAdmin(x.uid, false)}>取消管理</Button>
                    </Popup>
                </Container>) : <Label color="red">团队主</Label>}></UserCard>
            </Grid.Column>)}
        </Grid>
        {normalMembers.length !== 0 && <>
            <Header as="h3">
                普通用户
            </Header>
            <Grid columns="3">
                {showingNormalMembers.map(x => <Grid.Column key={x.uid}>
                    <UserCard data={x} slot={props.hasManagePermission && <Container textAlign="right">
                        <Popup
                            position="left center"
                            pinned
                            on="click"
                            trigger={<Button size="tiny" icon="add"></Button>}
                        >
                            <Button.Group size="tiny">
                                <Button size="tiny" color="red" onClick={() => props.kick(x.uid)}>移出团队</Button>
                                {props.hasManagePermission && <Button size="tiny" color="green" onClick={() => props.setAdmin(x.uid, true)}>设为管理</Button>}
                            </Button.Group>

                        </Popup>
                    </Container>}></UserCard>
                </Grid.Column>)}
            </Grid>
            <Divider></Divider>
            <Container textAlign="center">
                <Pagination totalPages={totalPages} activePage={page} onPageChange={(_, e) => setPage(e.activePage as number)}></Pagination>
            </Container>
        </>}
    </>;
};

export default TeamMembers;
