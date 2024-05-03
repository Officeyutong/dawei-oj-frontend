import { Accordion, Icon, Table } from "semantic-ui-react";
import { UserExtraStatistics } from "../client/types";
import { Fragment, useState } from "react";

const TeamProblemsetStatistics: React.FC<{ data: UserExtraStatistics["problemset_statistics"] }> = ({ data }) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    return <>
        {data.length === 0 && <p>没有相关数据</p>}
        {data.length > 0 && <Accordion fluid styled>
            {data.filter(item => item.problemsets.length > 0).map(team => <Fragment key={team.team_id}>
                <Accordion.Title
                    key={`title-${team.team_id}`}
                    active={activeIndex === team.team_id}
                    index={team.team_id}
                    onClick={(_, title) => {
                        if (title.index === activeIndex) setActiveIndex(null);
                        else setActiveIndex(title.index as number);
                    }}
                >
                    <Icon name='dropdown' />{team.course_names.join("、")}
                    {/* {team.team_name} */}
                    {/* <p>对应课程: </p> */}
                </Accordion.Title>
                <Accordion.Content key={`content-${team.team_id}`} active={activeIndex === team.team_id}>
                    <p>团队名: {team.team_name}</p>
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>作业名</Table.HeaderCell>
                                <Table.HeaderCell>作业题目数</Table.HeaderCell>
                                <Table.HeaderCell>通过题目数</Table.HeaderCell>
                                <Table.HeaderCell>未通过题目数</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {team.problemsets.map(probset => <Table.Row key={probset.id}>
                                <Table.Cell>{probset.name}</Table.Cell>
                                <Table.Cell>{probset.total_problems}</Table.Cell>
                                <Table.Cell>{probset.accepted_problems}</Table.Cell>
                                <Table.Cell>{probset.total_problems - probset.accepted_problems}</Table.Cell>
                            </Table.Row>)}
                        </Table.Body>
                    </Table>
                </Accordion.Content>
            </Fragment>)}
        </Accordion>}
    </>
};

export default TeamProblemsetStatistics;
