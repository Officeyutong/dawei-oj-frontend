import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ChoiceQuestion, ProblemEditReceiveInfo, WrittenTestQuestion } from "../client/types";
import problemClient from "../client/ProblemClient";
import { useDocumentTitle } from "../../../common/Utils";
import { Button, Dimmer, Divider, Form, Grid, Header, Input, Loader, Radio, Segment } from "semantic-ui-react";
import { showErrorModal, showSuccessModal } from "../../../dialogs/Dialog";
import SimpleAceWrapper from "../../utils/SimpleAceWrapper";
import WrittenTestStatementAndSubmit from "../WrittenTestStatementAndSubmit";

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

const WrittenProblemEdit: React.FC<{}> = () => {
    const params = useParams<{ problemID: string }>();
    const pid = parseInt(params.problemID);
    const [data, setData] = useState<ProblemEditReceiveInfo | null>(null);

    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        if (!loaded) {
            (async () => {
                try {
                    const data = await problemClient.getProblemInfo(pid, true);
                    if (data.problem_type !== "written_test") {
                        showErrorModal("当前题目非笔试题目！请先把题目类型更改为笔试题目。");
                        return;
                    }
                    setData(data);
                    setLoaded(true);
                } catch { } finally { }
            })();
        }
    }, [loaded, pid]);
    useDocumentTitle(`${data?.id || "加载中..."} - 笔试题目编辑`);
    const updateProblemAt = (idx: number, newval: WrittenTestQuestion<true>) => {
        const newArr = [...data!.writtenTestStatement];
        newArr[idx] = newval;
        setData({ ...data!, writtenTestStatement: newArr });
    }
    const save = async () => {
        try {
            setLoading(true);
            const subtaskCount = data!.writtenTestStatement.length;
            // 修改子任务分布
            let maxScore;
            if (subtaskCount > 100) maxScore = subtaskCount;
            else maxScore = 100;
            const scorePerSubtask = Math.floor(maxScore / subtaskCount);
            const lastSubtaskScore = scorePerSubtask + maxScore % subtaskCount;
            const newData = { ...data! };
            newData.subtasks = [];
            for (let i = 0; i < subtaskCount; i++) {
                const currTaskScore = i !== subtaskCount - 1 ? scorePerSubtask : lastSubtaskScore;
                newData.subtasks.push({
                    name: `prob-${i}`,
                    score: currTaskScore,
                    method: "sum",
                    memory_limit: 0,
                    time_limit: 0,
                    testcases: [
                        { full_score: currTaskScore, input: "placeholder", output: "placeholder" }
                    ],
                    comment: `对应于小题 ${i + 1} 的占位符`
                });
            }
            await problemClient.updateProblemInfo(pid, {
                ...newData,
                newProblemID: pid,
            });
            showSuccessModal("操作完成");
        } catch { } finally {
            setLoading(false);
        }
    };
    return <div>
        {(!data || loading) && <Dimmer active><Loader></Loader></Dimmer>}
        {data && <>
            <Header as="h1">笔试题目编辑 {data.id}</Header>
            <Segment stacked>
                <Grid columns={2}>
                    <Grid.Column width={8}>
                        <Form>
                            <Form.Field>
                                <label>题目名</label>
                                <Input value={data.title} onChange={(_, d) => setData({ ...data, title: d.value })}></Input>
                            </Form.Field>
                            <Form.Field>
                                <label>题目背景</label>
                                <SimpleAceWrapper
                                    mode="markdown"
                                    onChange={d => setData({ ...data, background: d })}
                                    value={data.background}
                                ></SimpleAceWrapper>
                            </Form.Field>
                            <Form.Field>
                                <label>题目内容</label>
                                <SimpleAceWrapper
                                    mode="markdown"
                                    onChange={d => setData({ ...data, content: d })}
                                    value={data.content}
                                ></SimpleAceWrapper>
                            </Form.Field>

                        </Form>
                        <Divider></Divider>
                        <Header as="h3">题面</Header>
                        {data.writtenTestStatement.map((item, idx) => <div key={idx}>
                            <Header as="h4">小题 {idx + 1}</Header>
                            <Form>
                                <Form.Field>
                                    <label>小题内容</label>
                                    <SimpleAceWrapper
                                        mode="markdown"
                                        onChange={d => {
                                            const newVal = [...data.writtenTestStatement];
                                            newVal[idx].statement = d;
                                            setData({ ...data, writtenTestStatement: newVal });
                                        }}
                                        value={item.statement}
                                    ></SimpleAceWrapper>
                                </Form.Field>
                                <Form.Group>
                                    <label>小题类型</label>
                                    <Form.Field control={Radio} label="单选题" checked={item.type === "choice" && item.single === true} onChange={(_: any, { checked }: any) => {
                                        if (checked) updateProblemAt(idx, { type: "choice", single: true, statement: item.statement, answer: ["A"], choices: ["X", "Y", "Z", "W"] })
                                    }}></Form.Field>
                                    <Form.Field control={Radio} label="多选题" checked={item.type === "choice" && item.single === false} onChange={(_: any, { checked }: any) => {
                                        if (checked) updateProblemAt(idx, { type: "choice", single: false, statement: item.statement, answer: ["A", "B"], choices: ["X", "Y", "Z", "W"] })
                                    }}></Form.Field>
                                    <Form.Field control={Radio} label="填空题" checked={item.type === "fill_blank"} onChange={(_: any, { checked }: any) => {
                                        if (checked) updateProblemAt(idx, { type: "fill_blank", statement: item.statement, answer: "xxxx" })
                                    }}></Form.Field>
                                </Form.Group>
                                {item.type === "fill_blank" && <Form.Field>
                                    <label>正确答案</label>
                                    <SimpleAceWrapper mode="markdown" value={item.answer} onChange={d => {
                                        updateProblemAt(idx, { ...item, answer: d });
                                    }}></SimpleAceWrapper>
                                </Form.Field>}
                                {item.type === "choice" && <>
                                    {item.choices.map((choice, idxChoice) => <Form.Field>
                                        <label>选项 {LETTERS[idxChoice]}</label>
                                        <Input value={choice} onChange={(_, d) => {
                                            const newVal = [...data.writtenTestStatement];
                                            (newVal[idx] as ChoiceQuestion).choices[idxChoice] = d.value;
                                            setData({ ...data, writtenTestStatement: newVal });
                                        }}
                                            action={{
                                                content: "删除",
                                                color: "red",
                                                onClick: () => {
                                                    const newVal = [...data.writtenTestStatement];
                                                    (newVal[idx] as ChoiceQuestion).choices.splice(idxChoice, 1)
                                                    setData({ ...data, writtenTestStatement: newVal });
                                                }
                                            }}
                                        ></Input>
                                    </Form.Field>)}
                                    <Form.Group inline>
                                        <label>正确答案</label>
                                        {item.choices.map((_, idxChoice) => <Form.Checkbox onClick={() => {
                                            if (item.single) {
                                                updateProblemAt(idx, { ...item, answer: [LETTERS[idxChoice]] })
                                            } else {
                                                if (item.answer.includes(LETTERS[idxChoice])) updateProblemAt(idx, { ...item, answer: item.answer.filter(t => t !== LETTERS[idxChoice]) });
                                                else updateProblemAt(idx, { ...item, answer: [...item.answer, LETTERS[idxChoice]] })
                                            }
                                        }} checked={item.answer.includes(LETTERS[idxChoice])} radio={item.single} label={LETTERS[idxChoice]}></Form.Checkbox>)}
                                    </Form.Group>
                                    <Form.Button size="small" color="green" onClick={() => {
                                        updateProblemAt(idx, { ...item, choices: [...item.choices, "XXXX"] })
                                    }}>添加选项</Form.Button>
                                </>}

                                <Form.Button size="small" color="red" onClick={() => {
                                    const newVal = [...data.writtenTestStatement];
                                    newVal.splice(idx, 1);
                                    setData({ ...data, writtenTestStatement: newVal });
                                }}>删除本小题</Form.Button>
                            </Form>
                            <Divider></Divider>
                        </div>)}
                        <Button size="small" color="green" onClick={() => {
                            setData({ ...data, writtenTestStatement: [...data.writtenTestStatement, { type: "fill_blank", answer: "xxxxx", statement: "xxxxx" }] });
                        }}>添加小题</Button>
                    </Grid.Column>
                    <Grid.Column>
                        <WrittenTestStatementAndSubmit
                            statement={data}
                            content={data.writtenTestStatement}
                        ></WrittenTestStatementAndSubmit>
                    </Grid.Column>
                </Grid>
                <Divider></Divider>
                <Button color="green" onClick={save} loading={loading} disabled={loading}>保存</Button>
            </Segment>
        </>}
    </div>
};

export default WrittenProblemEdit;
