import { CSSProperties, useEffect, useState } from "react";
import { Header, Progress, Segment, Table } from "semantic-ui-react";
import { PUBLIC_URL } from "../App";
import { Link } from "react-router-dom";
import { timeStampToString } from "../common/Utils";
import { DateTime } from "luxon";
import { useSelector } from "react-redux";
import { StateType } from "../states/Manager";

const TimedProblemSetCard: React.FC<{ extraStyle: CSSProperties }> = ({ extraStyle }) => {
    const [currentTime, setCurrentTime] = useState<DateTime>(DateTime.now());
    useEffect(() => {
        const token = setInterval(() => {
            setCurrentTime(DateTime.now());
        }, 1000)
        return () => clearInterval(token);
    });
    const { currentActiveTimedProblemset } = useSelector((s: StateType) => s.userState.userData);

    const problemSet = currentActiveTimedProblemset;
    const timeDiff = currentTime.toSeconds() - (problemSet?.createTime || 0);
    const progress = ((problemSet?.timeLimit || 1) >= timeDiff) ? Math.ceil(timeDiff / (problemSet?.timeLimit || 1) * 100) : 100;
    return <Segment stacked style={extraStyle}>
        <Header as="h4">
            正在进行的计时习题集
        </Header>
        <Table basic="very">
            <Table.Body>
                <Table.Row>
                    <Table.Cell colSpan={2}><Link to={`${PUBLIC_URL}/problemset/show/${problemSet!.id}`} >
                        #{problemSet!.id}. {problemSet!.name}
                    </Link></Table.Cell>
                </Table.Row>
                <Table.Row>
                    <Table.Cell>开始: {timeStampToString(problemSet!.createTime)}</Table.Cell>
                </Table.Row>
                <Table.Row>
                    <Table.Cell>结束: {timeStampToString(problemSet!.createTime + problemSet!.timeLimit)}</Table.Cell>
                </Table.Row>
                <Table.Row>
                    <Table.Cell>
                        <Progress percent={progress} success={progress === 100} active={progress >= 1 && progress < 100} >
                            {progress >= 100 ? "已完成" : `正在进行 - ${progress}%`}
                        </Progress>
                    </Table.Cell>
                </Table.Row>

            </Table.Body>
        </Table>
    </Segment>;
}

export default TimedProblemSetCard;
