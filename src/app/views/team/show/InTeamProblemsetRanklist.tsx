import { useEffect, useState } from "react";
import { Button, Dimmer, Loader, Modal, Table } from "semantic-ui-react";
import { TeamProblemsetRanklistResponse } from "../client/types";
import teamClient from "../client/TeamClient";
import { Link } from "react-router-dom";
import { PUBLIC_URL } from "../../../App";

interface InTeamProblemsetRanklistProps {
    onClose: () => void;
    teamID: number;
    problemsetID: number;
}
const InTeamProblemsetRanklist: React.FC<InTeamProblemsetRanklistProps> = ({ onClose, problemsetID, teamID }) => {
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [data, setData] = useState<null | TeamProblemsetRanklistResponse>(null);
    useEffect(() => {
        if (!loaded) {
            (async () => {
                try {
                    setLoading(true);
                    setData(await teamClient.getInTeamProblemsetRanklist(teamID, problemsetID));
                    setLoaded(true);
                } catch { } finally { setLoading(false); }
            })();
        }
    }, [loaded, problemsetID, teamID]);

    return <Modal open>
        <Modal.Header>查看习题集排行榜</Modal.Header>
        <Modal.Content style={{ overflowY: "scroll", maxHeight: "500px" }}>
            {loading && <Dimmer active><Loader></Loader></Dimmer>}
            {data !== null && <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>用户</Table.HeaderCell>
                        <Table.HeaderCell>总分</Table.HeaderCell>
                        {data.problems.map(item => <Table.HeaderCell key={item.id}>
                            <Link to={`${PUBLIC_URL}/show_problem/${item.id}`}>#{item.id}. {item.title}</Link>
                        </Table.HeaderCell>)}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data.ranklist.map((item, index) => <Table.Row key={item.user.uid}>
                        <Table.Cell>
                            Rank{index + 1}. <Link to={`${PUBLIC_URL}/profile/${item.user.uid}`}>{item.user.username}</Link>
                            <p style={{ color: "grey" }}>{item.user.realName} </p>
                        </Table.Cell>
                        <Table.Cell>{item.totalScore}</Table.Cell>
                        {item.problems.map((prob, idx) => <Table.Cell positive={prob.submission.status === "accepted"} negative={prob.submission.status === "unaccepted"} key={idx}>
                            {prob.submission.id ? <Link to={`${PUBLIC_URL}/show_submission/${prob.submission.id}`}>{prob.score}</Link> : ""}
                        </Table.Cell>)}
                    </Table.Row>)}
                </Table.Body>
            </Table>}
        </Modal.Content>
        <Modal.Actions>
            <Button color="red" disabled={loading} onClick={() => onClose()}>关闭</Button>
        </Modal.Actions>
    </Modal>
};
export default InTeamProblemsetRanklist;
