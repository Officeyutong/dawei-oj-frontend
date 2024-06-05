import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Dimmer, Header, Loader, Segment, Table } from "semantic-ui-react";
import { ProblemUsageEntry } from "./client/types";
import { PUBLIC_URL } from "../../App";
import problemClient from "./client/ProblemClient";

const QueryProblemOccupies: React.FC<{}> = () => {
    const params = useParams<{ problemID: string }>();
    const pid = parseInt(params.problemID);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [data, setData] = useState<ProblemUsageEntry[]>([]);
    useEffect(() => {
        if (!loaded) (async () => {
            try {
                setLoading(true);
                setData(await problemClient.getProblemUsage(pid));
                setLoaded(true);
            } catch { } finally { setLoading(false); }
        })();
    }, [loaded, pid])
    return <>
        <Header as="h1">查看题目 {pid} 的占用情况</Header>
        <Segment stacked>
            {loading && <Dimmer active>
                <Loader active></Loader>
            </Dimmer>}
            {loaded && <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>
                            类型
                        </Table.HeaderCell>
                        <Table.HeaderCell>链接</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data.map((line, idx) => <Table.Row key={idx}>
                        {(() => {
                            switch (line.type) {
                                case 'contest': return <><Table.Cell>比赛</Table.Cell><Table.Cell><Link to={`${PUBLIC_URL}/contest/${line.contest_id}`}>{line.contest_name}</Link></Table.Cell></>;
                                case 'problemset': return <><Table.Cell>习题集</Table.Cell><Table.Cell><Link to={`${PUBLIC_URL}/problemset/show/${line.problemset_id}`}>{line.problemset_name}</Link></Table.Cell></>;
                                case 'team': return <><Table.Cell>团队</Table.Cell><Table.Cell><Link to={`${PUBLIC_URL}/team/${line.team_id}`}>{line.team_name}</Link></Table.Cell></>;
                            }
                        })()}
                    </Table.Row>)}
                </Table.Body>
            </Table>}
        </Segment>
    </>
};

export default QueryProblemOccupies;
