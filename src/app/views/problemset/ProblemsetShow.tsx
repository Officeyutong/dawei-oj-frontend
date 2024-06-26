import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Button, Dimmer, Grid, Header, Loader, Message, MessageHeader, Progress, Segment, Table } from "semantic-ui-react";
import { PUBLIC_URL } from "../../App";
import { Markdown } from "../../common/Markdown";
import { timeStampToString, useDocumentTitle } from "../../common/Utils";
import { showConfirm } from "../../dialogs/Dialog";
import JudgeStatusLabel from "../utils/JudgeStatusLabel";
import UserLink from "../utils/UserLink";
import problemsetClient from "./client/ProblemsetClient";
import { ProblemsetPublicInfo } from "./client/types";
import { DateTime } from "luxon";
import QueryString from "qs";

const ProblemsetShow: React.FC<React.PropsWithChildren<{}>> = () => {
    const { id } = useParams<{ id: string }>();
    const [loaded, setLoaded] = useState(false);
    const [data, setData] = useState<ProblemsetPublicInfo | null>(null);
    const [togglingFavorite, setTogglingFavorite] = useState(false);
    const location = useLocation();
    const parsed: { source_team?: string } = QueryString.parse(location.search.slice(1));
    const sourceTeamID = parsed.source_team === undefined ? undefined : parseInt(parsed.source_team);
    useDocumentTitle(`${data?.name || "加载中..."} - 习题集`);
    useEffect(() => {
        if (!loaded) {
            (async () => {
                try {
                    const resp = await problemsetClient.getProblemsetFrontendInfo(parseInt(id));
                    setData(resp);
                    setLoaded(true);
                } catch { } finally { }
            })();
        }
    }, [id, loaded]);
    const handleToggleFavorite = async () => {
        try {
            setTogglingFavorite(true);
            const { newValue } = await problemsetClient.toggleProblemsetFavorited(data!.id);
            setData({ ...data!, favorited: newValue });
        } catch { } finally {
            setTogglingFavorite(false);
        }
    }
    const remove = () => {
        showConfirm("您确认要删除此习题集吗?", async () => {
            try {
                await problemsetClient.removeProblemset(data!.id);
                window.location.href = "/problemset/list/1";
            } catch { } finally { }
        });
    };
    const [currentTime, setCurrentTime] = useState<DateTime>(DateTime.now());
    useEffect(() => {
        const token = setInterval(() => {
            setCurrentTime(DateTime.now());
        }, 1000)
        return () => clearInterval(token);
    });

    const timeDiff = currentTime.toSeconds() - (data?.createTime || 0);
    const progress = ((data?.timeLimit || 1) >= timeDiff) ? Math.ceil(timeDiff / (data?.timeLimit || 1) * 100) : 100;
    const favorited = data?.favorited || false;
    return <div>
        <Header as="h1">
            {data?.name || ""}
        </Header>
        {!loaded && <Segment>
            <div style={{ height: "400px" }}>
                <Dimmer active>
                    <Loader></Loader>
                </Dimmer>
            </div></Segment>}
        {loaded && data !== null && <Grid columns="2">
            <Grid.Column width="11">
                {data.timeLimit !== 0 && <>
                    <Header as="h3">时间限制</Header>
                    <Segment stacked>
                        <Table basic="very">
                            <Table.Body>
                                <Table.Row>
                                    <Table.Cell>开始时间</Table.Cell>
                                    <Table.Cell>{timeStampToString(data.createTime)}</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell>结束时间</Table.Cell>
                                    <Table.Cell>{timeStampToString(data.createTime + data.timeLimit)}</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell colSpan="2">
                                        <Progress percent={progress} success={progress === 100} active={progress >= 1 && progress < 100} >
                                            {progress >= 100 ? "已完成" : `正在进行 - ${progress}%`}
                                        </Progress>
                                    </Table.Cell>
                                </Table.Row>
                            </Table.Body>
                        </Table>
                    </Segment>
                </>}
                {data.description !== "" && <div>
                    <Header as="h3">
                        简介
                    </Header>
                    <Segment stacked>
                        <Markdown markdown={data.description}></Markdown>
                    </Segment>
                </div>}
                {data.problems.length !== 0 && <>
                    <Header as="h3">
                        题目列表
                    </Header>
                    <Segment stacked>
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>题目</Table.HeaderCell>
                                    <Table.HeaderCell>我的提交</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {data.problems.map((x, i) => <Table.Row key={i}>
                                    <Table.Cell>
                                        <a target="_blank" rel="noreferrer" href={`/show_problem/${x.id}` + (sourceTeamID !== undefined ? `?source_team=${sourceTeamID}` : "")}>{x.id} - {x.title}</a>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <a target="_blank" rel="noreferrer" href={x.userResult.submissionID === -1 ? undefined : `/show_submission/${x.userResult.submissionID}`}>
                                            <JudgeStatusLabel status={x.userResult.status}></JudgeStatusLabel>
                                        </a>
                                    </Table.Cell>
                                </Table.Row>)}
                            </Table.Body>
                        </Table>
                    </Segment></>}
                {data.foreignProblems.length !== 0 && <>
                    <Header as="h3">
                        外部题目
                    </Header>
                    <Segment stacked>
                        <Table celled>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>名称</Table.HeaderCell>
                                    <Table.HeaderCell>链接</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {data.foreignProblems.map((x, i) => <Table.Row key={i}>
                                    <Table.Cell>{x.name}</Table.Cell>
                                    <Table.Cell>
                                        <a href={x.url}>{x.url}</a>
                                    </Table.Cell>
                                </Table.Row>)}
                            </Table.Body>
                        </Table>
                    </Segment>
                </>}
            </Grid.Column>
            <Grid.Column width="5">
                <Segment stacked>
                    <Table basic="very">
                        <Table.Body>
                            <Table.Row>
                                <Table.Cell>习题集ID</Table.Cell>
                                <Table.Cell>{data.id}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>创建时间</Table.Cell>
                                <Table.Cell>{timeStampToString(data.createTime)}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>所有者</Table.Cell>
                                <Table.Cell><UserLink data={data.owner}></UserLink></Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>权限</Table.Cell>
                                <Table.Cell>{data.private ? "私有" : "公开"}</Table.Cell>
                            </Table.Row>

                        </Table.Body>
                    </Table>
                    {data.couldRetriveProblemPermissions && <Message positive>
                        <MessageHeader>此习题集的所有者拥有管理所有习题集的权限</MessageHeader>
                        <p>如果您有权限使用该习题集，那么您就会自动获取使用该习题集下题目的权限</p>
                    </Message>}
                    {!data.couldRetriveProblemPermissions && <Message warning>
                        <MessageHeader>此习题集的所有者没有管理习题集的权限</MessageHeader>
                        <p>您无法通过使用本习题集获取习题集下题目的使用权限</p>
                    </Message>}
                    <Button color={favorited ? "red" : "green"} onClick={handleToggleFavorite} loading={togglingFavorite}>
                        {favorited ? "取消收藏" : "收藏"}
                    </Button>
                    {data.managable && <>
                        <Button color="green" as={Link} to={`${PUBLIC_URL}/problemset/edit/${data.id}`}>编辑</Button>

                    </>}
                    {data.selfHasProblemsetRemovePermission && <Button color="red" onClick={remove}>删除</Button>}
                    {data.courseURL !== "" && <Button color="blue" as="a" href={data.courseURL} target="_blank" rel="noreferrer">看课程</Button>}
                </Segment>
            </Grid.Column>
        </Grid>}
    </div>;
};

export default ProblemsetShow;
