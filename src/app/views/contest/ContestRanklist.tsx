import QueryString from "qs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Button, Checkbox, Container, Dimmer, Dropdown, DropdownItemProps, Header, Label, Loader, Message, Pagination, Segment, Table } from "semantic-ui-react";
import { timeStampToString, useCurrentUid, useDocumentTitle } from "../../common/Utils";
import contestClient from "./client/ContestClient";
import { ContestRanklist as ContestRanklistType } from "./client/types";
import XLSX from "xlsx-js-style";
import { DateTime } from "luxon";
import { ButtonClickEvent } from "../../common/types";
import _ from "lodash";
import teamClient from "../team/client/TeamClient";
(window as (typeof window) & { qwq: any }).qwq = DateTime;

const ROWS_PER_PAGE = 100;

const ContestRanklist: React.FC<React.PropsWithChildren<{}>> = () => {
    const { contestID } = useParams<{ contestID: string }>();
    const location = useLocation();
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ContestRanklistType | null>(null);
    const [page, setPage] = useState(1);
    const [curTeam, setCurTeam] = useState<number | null>(null);
    const [teamDetail, setTeamDetail] = useState<DropdownItemProps[] | undefined>(undefined)
    const currentUser = useCurrentUid();
    const parsed = QueryString.parse(location.search.substring(1)) as {
        virtual_contest?: string;
        source_team?: string;
    }
    const virtualID = parsed.virtual_contest === undefined ? -1 : Number(parsed.virtual_contest);
    const sourceTeam = parsed.source_team === undefined ? -1 : Number(parsed.source_team)
    /// The current user's rank

    const selfIndex = useMemo(() => {
        if (data === null) return null;
        for (let i = 0; i < data.ranklist.length; i++) {
            if (data.ranklist[i].uid === currentUser) return i;
        }
        return null;
    }, [currentUser, data])
    const showingData = useMemo(() => {
        if (data === null || data.ranklist.length === 0) return [];
        const currChunk = _.chunk(data.ranklist, ROWS_PER_PAGE)[page - 1].map(s => ({ ...s, isSelf: false }));
        if (selfIndex !== null) {
            return [{ ...data.ranklist[selfIndex], isSelf: true }, ...currChunk];
        } else {
            return currChunk;
        }
    }, [data, page, selfIndex]);
    const totalPages = data !== null ? Math.ceil(data.ranklist.length / ROWS_PER_PAGE) : 0;
    useEffect(() => {
        if (!loaded || curTeam === null) {
            (async () => {
                try {
                    const resp = await contestClient.getContestRanklist(parseInt(contestID), virtualID);
                    setData(resp);
                    setLoaded(true);
                } catch { } finally {

                }
            })();
        }
    }, [contestID, loaded, virtualID, curTeam]);
    useDocumentTitle(`${data?.name} - ${contestID} - 排行榜`);
    const refreshRanklist = async (evt: ButtonClickEvent) => {
        const target = evt.currentTarget;
        try {
            target.classList.add("loading");
            await contestClient.refreshRanklist(parseInt(contestID), virtualID);
            setLoaded(false);
        } catch { } finally {
            target.classList.remove("loading");
        }
    };
    const exportToExcel = (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (data === null) return;
        const target = evt.currentTarget;
        try {
            target.classList.add("loading");
            const workbook = XLSX.utils.book_new();
            const sheetData: string[][] = [];
            sheetData.push([
                "排名", "用户名", "总分(分数/总时间 或 通过数/罚时)", ...data.problems.map((x, i) => `#${i}. ${x.name}`)
                , "最新提交时间"
            ]);
            sheetData.push([
                "合计", "通过提交数", "---", ...data.problems.map((x, i) => `${x.accepted_submit}`)
            ]);
            sheetData.push([
                "合计", "总提交数", "---", ...data.problems.map((x, i) => `${x.total_submit}`)
            ]);
            const greenCells: string[] = [];
            const redCells: string[] = [];
            let currRow = 3;
            for (const line of data.ranklist) {
                const row = currRow;
                const lastSubmit = _(line.scores).filter(s => s.submit_timestamp !== null).map(s => s.submit_timestamp).max();
                let lastSubmitTimeString = "";
                if (lastSubmit) {
                    lastSubmitTimeString = timeStampToString(lastSubmit);
                }
                sheetData.push([
                    `${line.rank}`,
                    `${line.username}${line.real_name && "（" + line.real_name + "）"}${line.virtual ? "[虚拟提交]" : ""}`,
                    data.using_penalty ? `${line.total.ac_count}/${line.total.penalty}` : `${line.total.score}/${line.total.submit_time_sum}`,
                    ...line.scores.map((x, i) => {
                        if (x.status === "accepted") greenCells.push(XLSX.utils.encode_cell({ r: row, c: i + 3 }));
                        if (x.status === "unaccepted") redCells.push(XLSX.utils.encode_cell({ r: row, c: i + 3 }));

                        if (x.submit_id === -1) return "未提交";
                        if (!data.using_penalty) return `${x.score}/${x.submit_time}`;
                        return x.status === "accepted" ? `-${x.submit_count}(${x.penalty})` : `-${x.submit_count}`;
                    }),
                    lastSubmitTimeString
                ]);
                currRow++;
            }

            const sheet = XLSX.utils.aoa_to_sheet(sheetData);
            // XLSX.SSF.format()
            greenCells.forEach(x => {
                const cell: XLSX.CellObject = sheet[x];
                cell.s = {
                    fill: {
                        fgColor: {
                            rgb: "FF00FF00"
                        },
                        // patternType: "solid"
                    }
                }
            });
            redCells.forEach(x => {
                const cell: XLSX.CellObject = sheet[x];
                cell.s = {
                    fill: {
                        fgColor: {
                            rgb: "FFFF0000"
                        },
                        // patternType: "solid"
                    }
                }
            });
            sheet["!cols"] = [{ width: 10 }, { width: 20 }];
            XLSX.utils.book_append_sheet(workbook, sheet, "ranklist");
            XLSX.writeFile(workbook, `${data?.name} - 排行榜 - ${DateTime.now().toJSDate().toLocaleString()}.xlsx`)
        } catch (e) {
            console.error(e);
        } finally {
            target.classList.remove("loading");
        }
    };
    useEffect(() => {
        (async () => {
            try {
                setLoading(true)
                const team = await teamClient.getTeamList(false)
                const res = team.list.map(item => ({
                    key: item.id,
                    text: `#${item.id}. ${item.name}`,
                    value: item.id
                }) as DropdownItemProps)
                setTeamDetail(res)
            }
            catch (e) {
                console.error(e);
            } finally {
                setLoading(false)
            }

        })()

    }, [])
    useEffect(() => {
        if (sourceTeam !== -1) {
            setCurTeam(sourceTeam)
        }

    }, [sourceTeam])
    const handleTeamQuery = useCallback(async (id: number) => {
        try {
            setLoading(true)
            const [resp, teamMem] = await Promise.all([contestClient.getContestRanklist(parseInt(contestID), virtualID), teamClient.getTeamDetail(id)])
            const res = _.intersectionBy(resp.ranklist, teamMem.members, 'uid')
            const obj: ContestRanklistType = { ...resp, ranklist: res }
            setData(obj)
        } catch {

        } finally {
            setLoading(false)
        }
    }, [contestID, virtualID])
    useEffect(() => {
        if (curTeam !== null) {
            handleTeamQuery(curTeam)
        } else {

        }
    }, [curTeam, handleTeamQuery])
    return <>
        {!loaded && <Segment>
            <div style={{ height: "400px" }}>
                <Dimmer active>
                    <Loader>加载中..</Loader>
                </Dimmer>
            </div></Segment>}
        {loading &&
            <Dimmer active>
                <Loader>加载中..</Loader>
            </Dimmer>
        }
        {loaded && data !== null && <div>
            <Header as="h1">
                {data.name} - 排行榜
            </Header>

            <Segment stacked style={{ overflowX: "scroll" }}>
                <Segment style={{ display: 'flex', justifyContent: 'center', flexDirection: "column" }}>
                    <Checkbox toggle label='按团队名筛选' checked={curTeam === null ? false : true} onChange={() => {
                        (curTeam === null && teamDetail !== undefined) ? setCurTeam(Number(teamDetail[0].value)) : setCurTeam(null)
                    }} />
                    {(curTeam && teamDetail) && <Dropdown style={{ marginTop: "0.5rem" }} options={teamDetail} placeholder='请选择团队' noResultsMessage='无对应团队'
                        defaultValue={curTeam !== null ? curTeam : undefined} search selection onChange={(event, data) => { setCurTeam(Number(data.value)) }} />}
                </Segment>

                <Message info>
                    <Message.Header>
                        提示
                    </Message.Header>
                    <Message.Content>
                        <p>{!data.running && "当前比赛已结束，"}排行榜每 {data.refresh_interval} 秒刷新一次。</p>
                        {virtualID !== -1 && <p>
                            当前显示的为虚拟比赛的排行榜。
                        </p>}
                    </Message.Content>
                </Message>
                <Table className="ranklist-table" basic="very">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell></Table.HeaderCell>
                            <Table.HeaderCell>用户名</Table.HeaderCell>
                            <Table.HeaderCell textAlign="center">总分</Table.HeaderCell>
                            {data.problems.map((x, i) => <Table.HeaderCell textAlign="center" style={{ minWidth: "100px" }} key={i}>
                                <a href={`/contest/${contestID}/problem/${x.id}`}>#{x.id + 1}. {x.name}</a>
                                <div>
                                    <span style={{ color: "green" }}>{x.accepted_submit}</span>/{x.total_submit}
                                </div>
                            </Table.HeaderCell>)}
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {showingData.map((x, i) => <Table.Row key={i}>
                            {x.isSelf ? <Table.Cell>
                                <Label color="green">我</Label>
                                <Label color="green">排名 {(selfIndex || 0) + 1}</Label>

                            </Table.Cell> : <Table.Cell textAlign="center">
                                {(() => {
                                    switch (x.rank) {
                                        case 1:
                                            return <Label ribbon color="yellow">1</Label>
                                        case 2:
                                            return <Label ribbon >2</Label>
                                        case 3:
                                            return <Label color="brown" ribbon>3</Label>
                                        default:
                                            return <div>{x.rank}</div>
                                    }
                                })()}
                            </Table.Cell>}
                            <Table.Cell>
                                <a href={`/profile/${x.uid}`}>{x.username}</a>
                                {x.virtual && <Label color="red">虚拟提交</Label>}
                                {x.real_name && <div style={{ color: "grey" }}>{x.real_name}</div>}
                            </Table.Cell>
                            <Table.Cell textAlign="center">
                                {data.using_penalty ? <span>
                                    <div style={{ color: "green" }}>{x.total.ac_count}</div>
                                    <div style={{ color: "red" }}>{x.total.penalty}</div>
                                </span> : <span>
                                    <div style={{ color: "green" }}>{x.total.score}</div>
                                    {/* <div style={{ color: "red" }}>{x.total.submit_time_sum}</div> */}
                                </span>}
                            </Table.Cell>
                            {x.scores.map((y, j) => <Table.Cell textAlign="center" positive={y.status === "accepted"} negative={y.status === "unaccepted"} key={j}>
                                {y.submit_id !== -1 && <div>
                                    <a href={`/show_submission/${y.submit_id}`}>
                                        {data.using_penalty === false ? <span>
                                            <div>{y.score}</div>
                                            {/* <div style={{ color: "red" }}>{y.submit_time}</div> */}
                                        </span> : <span>
                                            {y.status === "accepted" ? <div>
                                                {y.submit_count >= 0 ?
                                                    <div>{y.submit_count}</div> :
                                                    <div>-{y.submit_count}</div>
                                                }

                                                <div style={{ color: "red" }}>{y.penalty}</div>
                                            </div> : <div>-{y.submit_count}</div>}
                                        </span>}
                                    </a>
                                </div>}
                            </Table.Cell>)}
                        </Table.Row>)}
                    </Table.Body>
                </Table>
                <Container textAlign="center">
                    <Pagination totalPages={Math.max(totalPages, 1)} activePage={page} onPageChange={(_, e) => setPage(e.activePage as number)}></Pagination>
                </Container>
            </Segment >
            <div>
                <Segment style={{ width: "max-content" }} >
                    <Button size="tiny" color="green" onClick={exportToExcel}>导出为Excel文档</Button>
                    {data.managable && <Button size="tiny" color="green" onClick={refreshRanklist}>刷新排行榜</Button>}
                </Segment>
            </div>
        </div >}
    </>;

};

export default ContestRanklist;

