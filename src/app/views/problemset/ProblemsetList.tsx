import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Checkbox, Dimmer, Divider, Grid, Header, Icon, Input, Label, Loader, Modal, ModalActions, ModalContent, ModalHeader, Pagination, Segment, Table } from "semantic-ui-react";
import { ButtonClickEvent } from "../../common/types";
import { useDocumentTitle } from "../../common/Utils";
import problemsetClient from "./client/ProblemsetClient";
import { ProblemsetListItem } from "./client/types";
import { useSelector } from "react-redux";
import { StateType } from "../../states/Manager";
import { DateTime } from "luxon";

function timeStampToString(seconds: number): string {
    return DateTime.fromSeconds(seconds).toJSDate().toLocaleString();
}

const ProblemsetList: React.FC<React.PropsWithChildren<{}>> = () => {
    useDocumentTitle("习题集列表");

    const params = useParams<{ page: string }>();
    const [showModal, setShowModal] = useState(false);
    const [code, setCode] = useState("");
    const [currentID, setCurrentID] = useState(-1);
    const [data, setData] = useState<ProblemsetListItem[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(-1);
    const [pageCount, setPageCount] = useState(0);
    const [showFavOnly, setShowFavOnly] = useState<boolean>(false);
    const [showSetGroupFilterModal, setShowSetGroupFilterModal] = useState(false);
    const [groupName, setGroupName] = useState<string[]>([])
    const [selectedGroupName, setSelectedGroupName] = useState<string | undefined>(undefined)
    const privileged = useSelector((s: StateType) => s.userState.userData.shouldDisplayFullProblemsetListByDefault);
    const ifLogin = useSelector((s: StateType) => s.userState.login);
    const { initialRequestDone } = useSelector((s: StateType) => s.userState);
    const createProblemset = async (evt: ButtonClickEvent) => {
        try {
            setLoading(true);
            const id = await problemsetClient.createProblemset();
            window.open(`/problemset/show/${id}`, "_blank");
        } catch { } finally {
            setLoading(false);
        }
    };
    const doUnlock = async () => {
        try {
            await problemsetClient.unlockProblemset(currentID, code);
            window.location.href = `/problemset/show/${currentID}`;
        } catch { } finally {

        }
    };
    const loadPage = async (page: number, showFavOnly: boolean, filterGroupName: string | undefined) => {
        try {
            setLoading(true);
            const data = await problemsetClient.getProblemSetList(page, showFavOnly, filterGroupName);
            console.log(data)
            setData(data.items);
            setGroupName(data.groups)
            setPage(page);
            setPageCount(data.pageCount);
            setLoaded(true);
        } catch { } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (initialRequestDone && (privileged || !ifLogin)) {
            setShowFavOnly(false);
        } else if (initialRequestDone) {
            setShowFavOnly(true)
        }
    }, [initialRequestDone, privileged, ifLogin])
    useEffect(() => {
        if (initialRequestDone && !loaded && showFavOnly !== undefined) {
            loadPage(parseInt(params.page || "1"), showFavOnly, selectedGroupName);
        }
    }, [initialRequestDone, loaded, params.page, selectedGroupName, showFavOnly]);

    const toggleFav = useCallback(() => {
        if (loaded) {
            setShowFavOnly(!showFavOnly);
            loadPage(1, !showFavOnly, selectedGroupName);
        }
    }, [loaded, showFavOnly, selectedGroupName])

    return <div>
        <Header as="h1">
            习题集
        </Header>
        {!loaded && <Segment>
            <div style={{ height: "300px" }}>
                <Dimmer active>
                    <Loader></Loader>
                </Dimmer>
            </div>
        </Segment>}
        {loaded && <Segment stacked>
            {loading && <Dimmer active><Loader></Loader></Dimmer>}
            {showSetGroupFilterModal && <Modal
                open={showSetGroupFilterModal}
                onClose={() => { setShowSetGroupFilterModal(false) }}
            >
                <ModalHeader>选择习题集分组</ModalHeader>
                <ModalContent>
                    {groupName && <div style={{ overflowY: "scroll", maxHeight: "500px" }}>
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>习题集分组</Table.HeaderCell>
                                    <Table.HeaderCell>操作</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {groupName.map((item, idx) => <Table.Row key={idx}>
                                    <Table.Cell>#{idx + 1}. {item}</Table.Cell>
                                    <Table.Cell><Button size="small" color="green" onClick={() => {
                                        setSelectedGroupName(item);
                                        loadPage(1, showFavOnly, item);
                                        setShowSetGroupFilterModal(false)
                                    }}>选中</Button></Table.Cell>
                                </Table.Row>)}
                            </Table.Body>
                        </Table>
                    </div>}
                </ModalContent>
                <ModalActions>
                    <Button negative onClick={() => setShowSetGroupFilterModal(false)}>
                        取消
                    </Button>
                </ModalActions>
            </Modal>}
            <Grid columns="1">
                {ifLogin && <>
                    <Grid.Column>
                        <Checkbox checked={showFavOnly} onChange={toggleFav} toggle label="仅显示收藏习题集" defaultChecked={false}></Checkbox>
                    </Grid.Column>
                    <Grid.Column>
                        {selectedGroupName === undefined ?
                            <Button color="green" labelPosition="left" icon onClick={() => setShowSetGroupFilterModal(true)}>
                                <Icon name="plus"></Icon>
                                筛选习题集分组
                            </Button> :
                            <>
                                <label>正在筛选：</label>
                                <Label size="large" color="blue">
                                    {selectedGroupName}<Icon name="delete" onClick={() => {
                                        setSelectedGroupName(undefined)
                                        loadPage(1, showFavOnly, undefined)
                                    }}></Icon>
                                </Label>
                            </>
                        }

                    </Grid.Column>
                    {!showFavOnly &&
                        <Grid.Column>
                            <Button as="div" color="green" onClick={createProblemset}>
                                创建习题集
                            </Button>
                        </Grid.Column>}
                </>}
            </Grid>

            <Divider></Divider>
            <Table basic="very">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell textAlign="center">名称</Table.HeaderCell>
                        <Table.HeaderCell textAlign="center">权限</Table.HeaderCell>
                        <Table.HeaderCell textAlign="center">题目数量</Table.HeaderCell>
                        <Table.HeaderCell textAlign="center">创建者</Table.HeaderCell>
                        <Table.HeaderCell textAlign="center">创建时间/截止时间</Table.HeaderCell>
                        <Table.HeaderCell textAlign="center">习题集分组</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data.map((x, i) => <Table.Row key={i}>
                        <Table.Cell textAlign="center">
                            <a target="_blank" rel="noreferrer" style={{ cursor: 'pointer' }} onClick={(!(x.accessible || !x.private)) ? () => {
                                setCode("");
                                setCurrentID(x.id);
                                setShowModal(true);
                            } : undefined} href={(x.accessible || !x.private) ? `/problemset/show/${x.id}` : undefined}>#{x.id}. {x.name}</a>
                            {x.timeLimit !== 0 && <Label>限时 {(x.timeLimit / 60).toFixed(1)} 分钟</Label>}
                        </Table.Cell>
                        <Table.Cell textAlign="center"
                            positive={x.accessible || x.private === 0}
                            negative={(!x.accessible) && x.private === 1}
                        >
                            {x.private ? <div>
                                {x.accessible ? <Icon name="lock open"></Icon> : <Icon name="lock"></Icon>}
                            </div> : <div>公开</div>}
                        </Table.Cell>
                        <Table.Cell textAlign="center">
                            {x.problemCount !== -1 && <div>{x.problemCount}</div>}
                        </Table.Cell>
                        <Table.Cell textAlign="center">
                            <a href={`/profile/${x.owner.uid}`}>{x.owner.username}</a>
                        </Table.Cell>
                        <Table.Cell textAlign="center">
                            {x.timeLimit === 0 ? <>{timeStampToString(x.createTime)}</> : <Grid columns={1}>
                                <Grid.Column style={{ paddingBottom: 0 }}>
                                    {timeStampToString(x.createTime)}
                                </Grid.Column>
                                <Grid.Column style={{ paddingTop: 0 }}>
                                    <Label>{timeStampToString(x.createTime + x.timeLimit)}</Label>
                                </Grid.Column>
                            </Grid>}
                        </Table.Cell>
                        <Table.Cell textAlign="center">
                            {x.group}
                        </Table.Cell>
                    </Table.Row>)}
                </Table.Body>
            </Table>
            <Grid columns="3" centered >
                <Grid.Column>
                    <Pagination
                        totalPages={Math.max(pageCount, 1)}
                        activePage={page}
                        onPageChange={(e, d) => {
                            if (showFavOnly !== undefined) {
                                loadPage(d.activePage as number, showFavOnly, selectedGroupName)
                            }

                        }}
                    ></Pagination>
                </Grid.Column>
            </Grid>
        </Segment>}
        {showModal && <Modal open size="tiny">
            <Modal.Header>
                请输入该习题集的邀请码
            </Modal.Header>
            <Modal.Content>
                <Input fluid value={code} onChange={(_, d) => setCode(d.value)}></Input>
            </Modal.Content>
            <Modal.Actions>
                <Button color="red" onClick={() => setShowModal(false)}>关闭</Button>
                <Button color="green" onClick={doUnlock}>
                    确认
                </Button>
            </Modal.Actions>
        </Modal>}
    </div>;
};

export default ProblemsetList;
