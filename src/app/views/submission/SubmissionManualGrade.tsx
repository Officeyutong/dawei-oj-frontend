import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SubmissionInfo, SubtaskJudgeResult } from "./client/types";
import submissionClient from "./client/SubmissionClient";
import { useDocumentTitle } from "../../common/Utils";
import { Button, Checkbox, Dimmer, Divider, Form, Grid, Header, Input, Loader, Segment, Table } from "semantic-ui-react";
import UserLink from "../utils/UserLink";
import { PUBLIC_URL } from "../../App";
import _ from "lodash";
import hljs from "highlight.js";
import ScoreLabel from "../utils/ScoreLabel";
import JudgeStatusLabel from "../utils/JudgeStatusLabel";
import AnsiUp from "ansi_up";
import "./show/Submission.css";
import { SubtaskEntry } from "../problem/client/types";
import { showSuccessModal } from "../../dialogs/Dialog";

const ansiUp = new AnsiUp();

const nanToZero = (t: number) => {
    if (isNaN(t)) return 0; return t;
}

const SubmissionManualGrade = () => {
    const params = useParams<{ submission: string }>();
    const [loaded, setLoaded] = useState(false);
    const [data, setData] = useState<null | SubmissionInfo>(null);
    const [fullScoreOnly, setFullScoreOnly] = useState(false);
    const [newScore, setNewScore] = useState(0);
    const [subtaskScore, setSubtaskScore] = useState<{ [x: string]: SubtaskJudgeResult }>({});
    const [newExtraMessage, setNewExtraMessage] = useState("");
    const [saving, setSaving] = useState(false);
    useDocumentTitle(`提交人工评测 - ${params.submission}`);
    useEffect(() => {
        if (!loaded) {
            (async () => {
                try {
                    const resp = await submissionClient.getSubmissionInfo(parseInt(params.submission));
                    const subtaskRet: { [x: string]: SubtaskJudgeResult } = {};
                    for (const subtask of resp.problem.subtasks) {
                        if (subtask.name in resp.judge_result) {
                            subtaskRet[subtask.name] = resp.judge_result[subtask.name];
                        } else {
                            subtaskRet[subtask.name] = {
                                score: 0,
                                status: "unaccepted",
                                testcases: subtask.testcases.map(t => ({
                                    full_score: t.full_score,
                                    memory_cost: -1,
                                    time_cost: -1,
                                    status: "unaccepted",
                                    score: 0,
                                    message: "",
                                    input: t.input,
                                    output: t.output
                                }))
                            }
                        }

                    }
                    console.log(subtaskRet);
                    setSubtaskScore(subtaskRet);
                    setNewExtraMessage(resp.message);
                    setData(resp);
                    setLoaded(true);
                } catch { } finally { }
            })();
        }
    }, [params, loaded]);
    const fullScore = useMemo(() => {
        if (data) {
            return _.sum(data.problem.subtasks.map(t => t.score));
        } else {
            return 0;
        }
    }, [data])
    const renderedCode = useMemo(() => {
        if (data === null) return "";
        if (data.code.length <= 25 * 1024) {
            return hljs.highlight(data.code, { language: data.hljs_mode, ignoreIllegals: true }).value;
        } else {
            return data.code;
        }
    }, [data]);
    const ansiTranslated = useMemo(() => ansiUp.ansi_to_html(data?.message || ""), [data?.message]);
    const problemSubtasks = useMemo(() => data === null ? new Map<string, SubtaskEntry>() : new Map(data.problem.subtasks.map(x => [x.name, x])), [data]);
    const updateScoreOrMessage = (subtask: string, testcase: number, scoreOrMessage: number | string): boolean => {
        let testcaseResult = subtaskScore[subtask].testcases[testcase];
        if (typeof scoreOrMessage == "string") {
            testcaseResult = {
                ...testcaseResult,
                message: scoreOrMessage
            };

        } else {
            const maxScore = problemSubtasks.get(subtask)!.testcases[testcase].full_score;
            if (scoreOrMessage < 0 || scoreOrMessage > maxScore) return false;
            testcaseResult = {
                ...testcaseResult,
                score: scoreOrMessage,
                status: maxScore === scoreOrMessage ? "accepted" : "unaccepted"
            };
        }
        const newTestcaseList = [...subtaskScore[subtask].testcases];
        newTestcaseList[testcase] = testcaseResult;
        const newSubtaskResult = {
            ...subtaskScore[subtask],
            testcases: newTestcaseList
        }

        const { method: judgeType, score: subtaskFullScore } = problemSubtasks.get(subtask)!;
        newSubtaskResult.score = _.sum(newTestcaseList.map(t => t.score));
        if (judgeType === "min") {
            newSubtaskResult.score = subtaskFullScore > newSubtaskResult.score ? 0 : newSubtaskResult.score;
        }
        if (newSubtaskResult.score === subtaskFullScore) {
            newSubtaskResult.status = "accepted";
        } else {
            newSubtaskResult.status = "unaccepted";
        }
        setSubtaskScore({
            ...subtaskScore,
            [subtask]: newSubtaskResult
        });
        return true;
    };
    const handleSave = async () => {
        try {
            setSaving(true);
            await submissionClient.updateManualGradeResult({
                submission_id: data!.id,
                message: newExtraMessage,
                score: fullScoreOnly ? newScore : subtaskScore
            });
            showSuccessModal("操作完成！");
        } catch { } finally { setSaving(false); }
    }
    return <div>
        <Header as="h1">
            人工评分 {params.submission}
        </Header>
        {!loaded && <Segment>
            <div style={{ height: "400px" }}>
                <Dimmer active>
                    <Loader></Loader>
                </Dimmer>
            </div></Segment>}
        {loaded && data !== null && <Segment stacked>
            <Grid columns={2} divided>
                <Grid.Column width={6}>
                    <Header as={"h3"}>题目信息</Header>
                    <Form>
                        <Form.Group widths={3}>
                            <Form.Field>
                                <label>提交用户</label>
                                <UserLink data={data.user}></UserLink>
                            </Form.Field>
                            <Form.Field>
                                <label>题目</label>
                                <Link to={`${PUBLIC_URL}/show_problem/${data.problem.rawID}`}>
                                    #{data.problem.rawID}. {data.problem.title}
                                </Link>
                            </Form.Field>
                            <Form.Field>
                                <label>题目总分</label>
                                <p>{fullScore}</p>
                            </Form.Field>

                        </Form.Group>
                        <Form.Group widths={2}>
                            <Form.Field>
                                <label>现有分数</label>
                                <ScoreLabel score={data.score} fullScore={fullScore}></ScoreLabel>
                            </Form.Field>
                            <Form.Field>
                                <label>现有状态</label>
                                <JudgeStatusLabel status={data.status} showText></JudgeStatusLabel>
                            </Form.Field>
                        </Form.Group>
                        <Form.Field>
                            <label>现有附加信息</label>
                            <Segment>
                                <span className="raw-span" style={{ width: "100%" }} dangerouslySetInnerHTML={{ __html: ansiTranslated }}></span>
                            </Segment>
                        </Form.Field>
                    </Form>
                </Grid.Column>
                <Grid.Column>
                    <Header as={"h3"}>代码</Header>
                    <Segment style={{ overflowX: "scroll" }}>
                        <pre style={{ marginTop: 0 }} className="code-block" dangerouslySetInnerHTML={{ __html: renderedCode }}>
                        </pre>
                    </Segment>
                </Grid.Column>
            </Grid>
            <Divider></Divider>
            <Header as="h3">新结果设置</Header>
            <Form>
                <Form.Group widths={3}>
                    <Form.Field>
                        <label>只设置总分</label>
                        <Checkbox toggle checked={fullScoreOnly} onClick={() => setFullScoreOnly(t => !t)} ></Checkbox>
                    </Form.Field>
                    <Form.Field>
                        <label>总分</label>
                        {fullScoreOnly ? <Input type="number" value={newScore} onChange={(_, d) => setNewScore(parseInt(d.value))}></Input> : <ScoreLabel fullScore={fullScore} score={newScore}></ScoreLabel>}
                    </Form.Field>
                    <Form.Field>
                        <label>状态</label>
                        <JudgeStatusLabel status={newScore === fullScore ? "accepted" : "unaccepted"} showText></JudgeStatusLabel>
                    </Form.Field>
                </Form.Group>
                <Form.Field>
                    <label>新附加信息</label>
                    <Form.TextArea
                        rows={12}
                        value={newExtraMessage}
                        onChange={(_, d) => setNewExtraMessage(d.value as string)}
                    ></Form.TextArea>
                </Form.Field>
            </Form>
            {!fullScoreOnly && <>
                <Header as="h3">
                    设置子任务分数细节
                </Header>
                {Object.entries(subtaskScore).map(([name, item]) => <div key={name}>
                    <Divider>                    </Divider>

                    <Header as="h3">{name}</Header>
                    <Table basic="very" celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>得分/总分</Table.HeaderCell>
                                <Table.HeaderCell>状态</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            <Table.Row>
                                <Table.Cell><ScoreLabel score={item.score} fullScore={problemSubtasks.get(name)!.score}></ScoreLabel></Table.Cell>
                                <Table.Cell>
                                    <JudgeStatusLabel status={item.status}></JudgeStatusLabel>
                                </Table.Cell>
                            </Table.Row>
                        </Table.Body>
                    </Table>
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>输入文件</Table.HeaderCell>
                                <Table.HeaderCell>输出文件</Table.HeaderCell>
                                <Table.HeaderCell>分数</Table.HeaderCell>
                                <Table.HeaderCell>总分</Table.HeaderCell>
                                <Table.HeaderCell>状态</Table.HeaderCell>
                                <Table.HeaderCell>附加信息</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {item.testcases.map((testcase, i) => <Table.Row key={i}>
                                <Table.Cell><a href={`/api/download_file/${data.problem.rawID}/${testcase.input}`}>{testcase.input}</a></Table.Cell>
                                <Table.Cell><a href={`/api/download_file/${data.problem.rawID}/${testcase.output}`}>{testcase.output}</a></Table.Cell>
                                <Table.Cell>
                                    <Input value={testcase.score} onChange={(_, d) => updateScoreOrMessage(name, i, nanToZero(parseInt(d.value as string)))}></Input>
                                </Table.Cell>
                                <Table.Cell>
                                    <ScoreLabel score={testcase.score} fullScore={testcase.full_score}></ScoreLabel>
                                </Table.Cell>
                                <Table.Cell><JudgeStatusLabel status={testcase.status}></JudgeStatusLabel></Table.Cell>

                                <Table.Cell>
                                    <Input value={testcase.message} onChange={(_, d) => updateScoreOrMessage(name, i, d.value as string)}></Input>
                                </Table.Cell>
                            </Table.Row>)}
                        </Table.Body>
                    </Table>
                </div>)}
            </>}
            <Divider></Divider>
            <Button color="green" onClick={handleSave} loading={saving} >保存</Button>
        </Segment>}
    </div>
}
export default SubmissionManualGrade;
