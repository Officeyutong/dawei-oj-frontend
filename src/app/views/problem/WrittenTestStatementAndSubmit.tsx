import { useEffect, useState } from "react";
import { ProblemMetaBlock } from "./ProblemStatementView";
import { WrittenTestAnswer, WrittenTestQuestion, WrittenTestStatement } from "./client/types";
import { Button, Divider, Form, Grid } from "semantic-ui-react";
import { Markdown } from "../../common/Markdown";
import SimpleAceWrapper from "../utils/SimpleAceWrapper";
import ScoreLabel from "../utils/ScoreLabel";

interface WrittenTestStatementAndSubmitProps {
    statement: WrittenTestStatement;
    content: WrittenTestQuestion<false>[];
    defaultContent?: WrittenTestAnswer[];
    handleSubmit?: (code: string) => void;
    scoreLabels?: { score: number; fullScore: number }[];
}

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

const WrittenTestStatementAndSubmit: React.FC<WrittenTestStatementAndSubmitProps> = ({ content, defaultContent, handleSubmit, statement, scoreLabels }) => {

    const allowSubmit = handleSubmit !== undefined;
    const [answer, setAnswer] = useState<WrittenTestAnswer[] | null>(null);
    useEffect(() => {
        setAnswer(null);
        const currAns = [];
        for (let i = 0; i < content.length; i++) {
            if (content[i].type === "choice") {
                if (defaultContent && defaultContent[i] && typeof defaultContent[i] == "object") currAns.push(defaultContent[i] || []);
                else {
                    currAns.push([]);
                }
            } else if (content[i].type === "fill_blank") {
                if (defaultContent && defaultContent[i] && typeof defaultContent[i] == "string") currAns.push(String(defaultContent[i]));
                else {
                    currAns.push("");
                }
            }
        }
        setAnswer(currAns);

    }, [content, defaultContent]);
    return answer !== null ? <>
        <ProblemMetaBlock name="题目背景" value={statement.background} withCopy={false}></ProblemMetaBlock>
        <ProblemMetaBlock name="题目内容" value={statement.content} withCopy={false}></ProblemMetaBlock>
        {content.map((item, idx) => <div key={idx}>

            {item.type === "fill_blank" && <Form>
                <Form.Field>
                    <label>填空题</label>
                </Form.Field>
                {scoreLabels && scoreLabels[idx] && <Form.Field>
                    <label>得分</label>
                    <ScoreLabel {...scoreLabels[idx]}></ScoreLabel>
                </Form.Field>}
                <Form.Field>
                    <label>题面</label>
                    <Markdown markdown={item.statement}></Markdown>
                </Form.Field>
                <Form.Field>
                    <label>作答</label>
                    {allowSubmit ? <SimpleAceWrapper mode="markdown" value={String(answer[idx]) as string} onChange={d => {
                        const newData = [...answer!];
                        newData[idx] = d;
                        if (allowSubmit)
                            setAnswer(newData);
                    }}></SimpleAceWrapper> : <Markdown markdown={String(answer[idx])}></Markdown>}
                </Form.Field>
            </Form>}
            {item.type === "choice" && <Form>
                <Form.Field>
                    <label>{item.single ? "单选题" : "多选题"}</label>
                </Form.Field>
                {scoreLabels && scoreLabels[idx] && <Form.Field>
                    <label>得分</label>
                    <ScoreLabel {...scoreLabels[idx]}></ScoreLabel>
                </Form.Field>}
                <Form.Field>
                    <Markdown markdown={item.statement}></Markdown>
                </Form.Field>
                {item.choices.map((choice, idx2) => <Form.Field key={idx2}>
                    <div className="ui checkbox">
                        <input readOnly type={item.single ? "radio" : "checkbox"} checked={(answer[idx] as string[]).includes(LETTERS[idx2])} disabled={!allowSubmit} onClick={() => {
                            if (!allowSubmit) return;
                            const newAns = [...answer];
                            if (item.single) {
                                newAns[idx] = [LETTERS[idx2]];
                            } else {
                                const ansRef = newAns[idx] as string[];
                                const findIdx = ansRef.findIndex(t => t === LETTERS[idx2]);
                                if (findIdx === -1) {
                                    ansRef.push(LETTERS[idx2]);
                                } else {
                                    ansRef.splice(findIdx, 1);
                                }
                            }
                            setAnswer(newAns);
                        }}></input>
                        <label><Markdown markdown={`${LETTERS[idx2]}. ${choice}`}></Markdown></label>
                    </div>
                </Form.Field>)}
            </Form>}
            <Divider></Divider>

        </div>)}
        {allowSubmit && <Grid centered columns={3}>
            <Grid.Column>
                <Button color="green" onClick={() => handleSubmit(JSON.stringify(answer))}>提交</Button>
            </Grid.Column>
        </Grid>}
    </> : <div></div>
};

export default WrittenTestStatementAndSubmit;
