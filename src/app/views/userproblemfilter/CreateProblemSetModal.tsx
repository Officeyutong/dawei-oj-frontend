import { Button, Divider, Form, Icon, Modal, Table } from "semantic-ui-react";
import { UsableProblemEntry } from "./client/types";
import { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { PUBLIC_URL } from "../../App";
import ProblemTagLabel from "../utils/ProblemTagLabel";
import { ProblemTagEntry } from "../../common/types";
import { showErrorModal, showSuccessModal } from "../../dialogs/Dialog";
import problemsetClient from "../problemset/client/ProblemsetClient";

const CreateProblemSetModal: React.FC<{
    problems: UsableProblemEntry[];
    closeCallback: () => void;
    tagMapping: Map<string, ProblemTagEntry>
}> = ({ problems, closeCallback, tagMapping }) => {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("新建习题集");
    const [timeLimit, setTimeLimit] = useState<number | undefined>(undefined);
    const [publicProblemset, setPublicProblemset] = useState(false);
    const history = useHistory();
    const doCreate = async () => {
        try {
            setLoading(true);
            if (title.trim().length === 0) {
                showErrorModal("请不要使用空标题"); return;
            }
            const id = await problemsetClient.createProblemset();
            const resp = await problemsetClient.getProblemsetEditInfo(id);
            await problemsetClient.updateProblemset({
                id,
                description: `用户通过题目筛选页面创建的习题集`,
                foreignProblems: [],
                name: title,
                problems: problems.map(x => x.id),
                showRanklist: 0,
                private: publicProblemset ? 1 : 0,
                timeLimit: timeLimit || 0,
                invitationCode: resp.invitationCode
            });
            showSuccessModal(`创建完成！新的习题集ID是${id}`);
            history.push(`${PUBLIC_URL}/problemset/show/${id}`);
        } catch { } finally {
            setLoading(false);
        }
    };

    return <Modal open size="small" closeOnDimmerClick={true}>
        <Modal.Header>使用选择的题目创建习题集</Modal.Header>
        <Modal.Content>
            <Form widths="equal">
                <Form.Group widths={3}>
                    <Form.Input value={title} onChange={(_, d) => setTitle(d.value)} label="习题集标题"></Form.Input>
                    <Form.Input value={timeLimit === undefined ? 0 : timeLimit} onChange={(_, d) => setTimeLimit(parseInt(d.value))} type="number" disabled={timeLimit === undefined} label="时间限制(秒)"></Form.Input>
                </Form.Group>
                <Form.Checkbox checked={timeLimit !== undefined} onChange={() => timeLimit === undefined ? setTimeLimit(3600) : setTimeLimit(undefined)} label="启用时间限制" toggle></Form.Checkbox>
                <Form.Checkbox checked={publicProblemset} onChange={() => setPublicProblemset(c => !c)} label="公开习题集" toggle></Form.Checkbox>
            </Form>
            <Divider></Divider>
            <Table basic="very">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>
                            题目编号
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            题目
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {problems.map((x, i) => <Table.Row key={x.id}>
                        <Table.Cell textAlign="center">{x.id}</Table.Cell>
                        <Table.Cell >
                            <Link to={`${PUBLIC_URL}/show_problem/${x.id}`} style={{ fontSize: "16px" }}>
                                {x.title}
                            </Link>
                            <div style={{ maxWidth: "300px", overflowWrap: "break-word", paddingTop: 10 }}>
                                {x.tags.map(y => <ProblemTagLabel
                                    key={y}
                                    data={tagMapping.has(y) ? tagMapping.get(y)! : { color: "black", display: y }}
                                ></ProblemTagLabel>)}
                            </div>
                        </Table.Cell>

                    </Table.Row>)}
                </Table.Body>
            </Table>
        </Modal.Content>
        <Modal.Actions>
            <Button disabled={loading} color="green" icon labelPosition="right" onClick={doCreate}>
                <Icon name="checkmark"></Icon>
                确认
            </Button>
            <Button disabled={loading} color="red" onClick={closeCallback}>
                取消
            </Button>
        </Modal.Actions>
    </Modal>
};

export default CreateProblemSetModal
