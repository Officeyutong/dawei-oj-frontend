import { Accordion, Dimmer, Icon, Loader, Tab, Table } from "semantic-ui-react";
import TeamStatisticsView from "./TeamStatisticsView";
import { Fragment, useEffect, useState } from "react";
import teamClient from "../client/TeamClient";
import { TeamMemberDetailedProblemsetStatisticsEntry } from "../client/types";
import { Link } from "react-router-dom";
import { PUBLIC_URL } from "../../../App";
import JudgeStatusLabel from "../../utils/JudgeStatusLabel";

const ShowMemberDetailedStatistics: React.FC<{ team: number; uid: number }> = ({ team, uid }) => {
    const [data, setData] = useState<TeamMemberDetailedProblemsetStatisticsEntry[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState<null | number>(null);
    useEffect(() => {
        if (!loaded) (async () => {
            try {
                setLoading(true);
                setData(await teamClient.getTeamMemberDetailedProblemsetStatistics(team, uid));
                setLoaded(true);
            } catch { } finally { setLoading(false); }
        })();
    }, [loaded, team, uid]);
    return <Tab renderActiveOnly={false} panes={[
        {
            menuItem: "作业记录", pane: <Tab.Pane key={0}>
                {loading && <div style={{ height: "400px" }}><Dimmer active><Loader></Loader></Dimmer></div>}
                {loaded && <Accordion fluid>
                    {data.filter(t => t.problems.length > 0).map(item => <Fragment key={item.id}>
                        <Accordion.Title index={item.id} active={item.id === activeIndex} onClick={() => {
                            if (activeIndex === item.id) setActiveIndex(null);
                            else setActiveIndex(item.id);
                        }}>
                            <Icon name="dropdown"></Icon> {item.name}
                        </Accordion.Title>
                        <Accordion.Content active={item.id === activeIndex}>
                            <Table>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>题目</Table.HeaderCell>
                                        <Table.HeaderCell>提交次数</Table.HeaderCell>
                                        <Table.HeaderCell>状态</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {item.problems.map(p => <Table.Row key={p.id}>
                                        <Table.Cell>
                                            <Link to={`${PUBLIC_URL}/show_problem/${p.id}`}>#{p.id}. {p.title}</Link>
                                        </Table.Cell>
                                        <Table.Cell>
                                            {p.submission_count}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {p.best_submission ? <Link to={`${PUBLIC_URL}/show_submission/${p.best_submission.id}`}><JudgeStatusLabel status={p.best_submission.status}></JudgeStatusLabel></Link> : <JudgeStatusLabel status="unsubmitted"></JudgeStatusLabel>}
                                        </Table.Cell>
                                    </Table.Row>)}
                                </Table.Body>
                            </Table>
                        </Accordion.Content>
                    </Fragment>)}
                </Accordion>}
            </Tab.Pane>
        },
        { menuItem: "刷题记录", pane: <Tab.Pane key={1}><TeamStatisticsView team={team} showThisUidOnly={uid}></TeamStatisticsView></Tab.Pane> }
    ]}></Tab>;
};

export default ShowMemberDetailedStatistics;
