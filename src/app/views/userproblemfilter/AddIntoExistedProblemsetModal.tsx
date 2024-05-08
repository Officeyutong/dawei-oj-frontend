import { Button, Dimmer, Divider, Form, Grid, Header, Loader, Modal, Table } from "semantic-ui-react";
import { ProblemTagEntry } from "../../common/types";
import { UsableProblemEntry } from "./client/types"
import { useEffect, useMemo, useState } from "react";
import { SimplifiedProblemsetListEntry } from "../problemset/client/types";
import problemsetClient from "../problemset/client/ProblemsetClient";
import { useInputValue } from "../../common/Utils";
import { Link } from "react-router-dom";
import { PUBLIC_URL } from "../../App";
import ProblemTagLabel from "../utils/ProblemTagLabel";
import { showErrorModal, showSuccessModal } from "../../dialogs/Dialog";

const AddIntoExistedProblemsetModal: React.FC<{
    problems: UsableProblemEntry[];
    tagMapping: Map<string, ProblemTagEntry>;
    onClose: () => void;
}> = ({ problems, tagMapping, onClose }) => {
    const [problemsetList, setProblemsetList] = useState<SimplifiedProblemsetListEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const searchText = useInputValue("");
    const [selectedProblemset, setSelectedProblemset] = useState<SimplifiedProblemsetListEntry | null>(null);
    const submit = async () => {
        try {
            if (selectedProblemset === null) {
                showErrorModal("请选择一个习题集");
                return;
            }
            setLoading(true);
            const data = await problemsetClient.getProblemsetEditInfo(selectedProblemset.id);
            data.problems = [...data.problems, ...problems.map(s => s.id).filter(s => !data.problems.includes(s))];
            await problemsetClient.updateProblemset({
                ...data
            });
            showSuccessModal("操作完成！");
        } catch { } finally {
            setLoading(false);
        }
    };
    const filteredData = useMemo(() => {
        return problemsetList.filter(t => t.name.includes(searchText.value));
    }, [searchText.value, problemsetList]);
    useEffect(() => {
        if (!loaded) (async () => {
            try {
                setLoading(true);
                setProblemsetList(await problemsetClient.getSimplifiedProblemsetList());
                setLoaded(true);
            } catch { } finally { setLoading(false); }
        })();
    }, [loaded]);

    return <Modal open>
        <Modal.Header>添加到现有习题集</Modal.Header>
        <Modal.Content>
            {loading && <Dimmer active><Loader active></Loader></Dimmer>}
            <Grid columns={2}>
                <Grid.Column>
                    <Header as="h4">选择习题集</Header>
                    <Form>
                        <Form.Input label="搜索关键字" {...searchText}></Form.Input>
                        {selectedProblemset && <Form.Field>
                            <label>当前已选中</label>
                            <Link to={`${PUBLIC_URL}/problemset/show/${selectedProblemset.id}`}>#{selectedProblemset.id}. {selectedProblemset.name}</Link>
                        </Form.Field>}
                    </Form>
                    <Divider></Divider>
                    <div style={{ maxHeight: "600px", overflowY: "scroll" }}>
                        <Table >
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>习题集</Table.HeaderCell>
                                    <Table.HeaderCell>操作</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {filteredData.map(item => <Table.Row key={item.id}>
                                    <Table.Cell><Link to={`${PUBLIC_URL}/problemset/show/${item.id}`}>#{item.id}. {item.name}</Link></Table.Cell>
                                    <Table.Cell>
                                        <Button size="small" color="green" onClick={() => setSelectedProblemset(item)}>选中</Button>
                                    </Table.Cell>
                                </Table.Row>)}
                            </Table.Body>
                        </Table>

                    </div>
                </Grid.Column>
                <Grid.Column>
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
                </Grid.Column>
                <Divider vertical></Divider>
            </Grid>
        </Modal.Content>
        <Modal.Actions>
            <Button color="green" onClick={submit} loading={loading} disabled={selectedProblemset === null}>提交</Button>
            <Button color="red" onClick={onClose} loading={loading}>关闭</Button>
        </Modal.Actions>
    </Modal>
};

export default AddIntoExistedProblemsetModal;
