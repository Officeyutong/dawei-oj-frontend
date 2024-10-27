import { Button, Divider, Header, Segment, Table } from "semantic-ui-react";
import { SubmissionInfo } from "../client/types";
import { useMemo, useState } from "react";
import { SubtaskEntry } from "../../problem/client/types";
import JudgeStatusLabel from "../../utils/JudgeStatusLabel";
import ScoreLabel from "../../utils/ScoreLabel";
import MemoryCostLabel from "../../utils/MemoryCostLabel";

import "highlight.js/styles/default.css"
import * as clipboard from "clipboardy";
import hljs from 'highlight.js';
interface SubtaskResultAndCodeViewProps {
    data: SubmissionInfo;
    defaultFoldedTasks: string[];
    showFileName: boolean;
}
const SubtaskResultAndCodeView: React.FC<SubtaskResultAndCodeViewProps> = ({ data, defaultFoldedTasks: defaultExpandedTasks, showFileName }) => {
    const problemSubtasks = useMemo(() => data === null ? new Map<string, SubtaskEntry>() : new Map(data.problem.subtasks.map(x => [x.name, x])), [data]);
    const [foldedTasks, setFoldedTasks] = useState<string[]>(defaultExpandedTasks);
    const foldedTasksSet = useMemo(() => new Set(foldedTasks), [foldedTasks]);
    const renderedCode = useMemo(() => {
        if (data === null) return "";
        if (data.code.length <= 25 * 1024) {
            return hljs.highlight(data.code, { language: data.hljs_mode, ignoreIllegals: true }).value;
        } else {
            return data.code;
        }
    }, [data]);
    return <>
        {Object.keys(data.judge_result).length !== 0 && <Header as="h3">
            子任务得分
        </Header>}
        {Object.entries(data.judge_result).map(([name, item]) => <div key={name}>
            <Divider></Divider>
            <Header as="h3">
                {name}
            </Header>
            <Table basic="very" celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>得分/总分</Table.HeaderCell>
                        <Table.HeaderCell>状态</Table.HeaderCell>
                        <Table.HeaderCell>操作</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    <Table.Row>
                        <Table.Cell>
                            {problemSubtasks.has(name) ? <ScoreLabel fullScore={problemSubtasks.get(name)!.score} score={item.score}></ScoreLabel> : <span style={{ fontWeight: "bold" }}>{item.score}</span>}
                        </Table.Cell>
                        <Table.Cell>
                            <JudgeStatusLabel status={item.status}></JudgeStatusLabel>
                        </Table.Cell>
                        <Table.Cell>
                            {foldedTasksSet.has(name) ? <Button size="small" color="green" onClick={() => setFoldedTasks([...foldedTasks, name])}>展开</Button> : <Button size="small" color="red" onClick={() => setFoldedTasks(c => c.filter(t => t !== name))} >折叠</Button>}
                        </Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>
            <Table style={{ maxWidth: "900px" }}>
                <Table.Header>
                    <Table.Row>
                        {showFileName && <><Table.HeaderCell>输入文件</Table.HeaderCell>
                            <Table.HeaderCell>输出文件</Table.HeaderCell></>}
                        <Table.HeaderCell>分数</Table.HeaderCell>
                        <Table.HeaderCell>状态</Table.HeaderCell>
                        <Table.HeaderCell>时间占用</Table.HeaderCell>
                        <Table.HeaderCell>空间占用</Table.HeaderCell>
                        <Table.HeaderCell>附加信息</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                {(!foldedTasksSet.has(name)) && <Table.Body>
                    {item.testcases.map((testcase, i) => <Table.Row key={i}>
                        {showFileName && <>     <Table.Cell><a href={`/api/download_file/${data.problem.rawID}/${testcase.input}`}>{testcase.input}</a></Table.Cell>
                            <Table.Cell><a href={`/api/download_file/${data.problem.rawID}/${testcase.output}`}>{testcase.output}</a></Table.Cell></>}
                        <Table.Cell>
                            {testcase.full_score !== 0 ? <ScoreLabel fullScore={testcase.full_score} score={testcase.score}></ScoreLabel> : <span style={{ fontWeight: "bold" }}>{testcase.score}</span>}

                        </Table.Cell>
                        <Table.Cell><JudgeStatusLabel status={testcase.status}></JudgeStatusLabel></Table.Cell>
                        <Table.Cell>{testcase.time_cost !== -1 && <>{testcase.time_cost} ms</>}</Table.Cell>
                        <Table.Cell>{testcase.memory_cost !== -1 && <MemoryCostLabel memoryCost={testcase.memory_cost}></MemoryCostLabel>}</Table.Cell>
                        <Table.Cell>{testcase.message}</Table.Cell>
                    </Table.Row>)}
                </Table.Body>}
            </Table>
        </div>)}
        <Header as="h3">
            代码
        </Header>
        <Table basic="very" celled>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>编程语言</Table.HeaderCell>
                    <Table.HeaderCell>代码长度</Table.HeaderCell>
                    <Table.HeaderCell>操作</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                <Table.Row>
                    <Table.Cell>{data.language_name}</Table.Cell>
                    <Table.Cell>{Math.ceil(data.code.length / 1024)} KB</Table.Cell>
                    <Table.Cell> <Button size="tiny" color="green" onClick={() => clipboard.write(data.code)}>复制代码</Button></Table.Cell>
                </Table.Row>
            </Table.Body>
        </Table>
        <Segment style={{ overflowX: "scroll" }}>
            <pre style={{ marginTop: 0 }} className="code-block" dangerouslySetInnerHTML={{ __html: renderedCode }}>
            </pre>
        </Segment>
    </>
};

export default SubtaskResultAndCodeView;
