import { useState } from "react";
import { Button, Form, Modal } from "semantic-ui-react";
import { RemoteOJ } from "./client/types";
import { useInputValue } from "../../common/Utils";
import { showErrorModal } from "../../dialogs/Dialog";
import { useHistory } from "react-router-dom";
import problemClient from "./client/ProblemClient";
import { PUBLIC_URL } from "../../App";

interface ImportRemoteProblemModalProps {
    onClose: () => void;
};

const ImportRemoteProblemModal: React.FC<ImportRemoteProblemModalProps> = ({ onClose }) => {
    const [selectedOj, setSelectedOj] = useState<RemoteOJ>("luogu");
    const [loading, setLoading] = useState(false);
    const problemId = useInputValue("");
    const history = useHistory();
    const run = async () => {
        if (problemId.value.trim() === "") {
            showErrorModal("请输入题目ID");
            return;
        }
        try {
            setLoading(true);
            const { newProblemID } = await problemClient.addRemoteJudgeProblem(selectedOj, problemId.value);
            history.push(`${PUBLIC_URL}/show_problem/${newProblemID}`);
            onClose();
        } catch { } finally {
            setLoading(false);
        }
    };
    return <Modal open size="small">
        <Modal.Header>添加远程评测题目</Modal.Header>
        <Modal.Content>
            <Form>
                <Form.Group inline>
                    <label>源OJ</label>
                    <Form.Radio label="洛谷" value="luogu" checked={selectedOj === "luogu"} onChange={(_, { value }) => setSelectedOj(value as RemoteOJ)}></Form.Radio>
                </Form.Group>
                <Form.Input label="源OJ题目ID" {...problemId}></Form.Input>
            </Form>
        </Modal.Content>
        <Modal.Actions>
            <Button color="red" onClick={onClose} disabled={loading}>关闭</Button>
            <Button color="green" onClick={run} disabled={loading} loading={loading}>确定</Button>
        </Modal.Actions>
    </Modal>
};

export default ImportRemoteProblemModal;
