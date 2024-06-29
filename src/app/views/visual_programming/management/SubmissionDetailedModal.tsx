import { useEffect, useState } from "react";
import { Button, Dimmer, Loader, Modal } from "semantic-ui-react";
import { HomeworkSubmissionListEntry } from "../client/types";
import visualProgrammingClient from "../client/VisualProgrammingClient";
import { showErrorModal } from "../../../dialogs/Dialog";

const SubmissionDetailedModal: React.FC<{ uid: number; homeworkId: number; submissionId: number; closeCallback: (shouldRefresh: boolean) => void; }> = ({ submissionId, closeCallback, uid, homeworkId }) => {
    const [data, setData] = useState<HomeworkSubmissionListEntry | null>(null);
    const [loading, setLoading] = useState(false);
    const save = async () => {

    };
    useEffect(() => {
        if (data === null) {
            (async () => {
                try {
                    setLoading(true);
                    const data = await visualProgrammingClient.getHomeworkSubmissionList(
                        undefined, "no", uid, homeworkId, 1, [submissionId]
                    )
                    if (data.data.length === 0) {
                        showErrorModal("非法提交ID");
                        return;
                    }
                    setData(data.data[0]);
                    setLoading(false);
                } catch { } finally {

                }
            })();
        }
    }, [data, homeworkId, submissionId, uid]);
    return <Modal size="small" open>
        <Modal.Header>
            查看提交详情
        </Modal.Header>
        <Modal.Content>
            {loading && <Dimmer active><Loader active></Loader></Dimmer>}
            {data !== null && <>
                {JSON.stringify(data)}
            </>}
        </Modal.Content>
        <Modal.Actions>
            <Button color="red" size="small" disabled={loading} onClick={() => closeCallback(false)}>取消</Button>
            <Button color="green" size="small" onClick={save} disabled={loading}>保存</Button>
        </Modal.Actions>
    </Modal>
};

export default SubmissionDetailedModal;
