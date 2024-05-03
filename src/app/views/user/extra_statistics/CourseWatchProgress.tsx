import { Table } from "semantic-ui-react";
import { UserExtraStatistics } from "../client/types";

const CourseWatchProgress: React.FC<{ data: UserExtraStatistics["course_watch"] }> = ({ data }) => {

    return <Table>
        <Table.Header>
            <Table.Row>
                <Table.HeaderCell>课程名</Table.HeaderCell>
                <Table.HeaderCell>看课百分比</Table.HeaderCell>
                <Table.HeaderCell>看课时长</Table.HeaderCell>
            </Table.Row>
        </Table.Header>
        <Table.Body>
            {data.map((item) => <Table.Row key={item.course_id}>
                <Table.Cell>{item.course_name}</Table.Cell>
                <Table.Cell>{Math.floor((item.watched / item.total * 100)).toFixed(2)}%</Table.Cell>
                <Table.Cell>{item.watched}秒</Table.Cell>
            </Table.Row>)}
        </Table.Body>
    </Table>
};

export default CourseWatchProgress;
