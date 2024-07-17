import { Button, Dimmer, Loader, Modal, Table } from "semantic-ui-react";
import { HomeworkSubmissionListEntry } from "./client/types";
import { useEffect, useState } from "react";
import visualProgrammingClient from "./client/VisualProgrammingClient";
import { timeStampToString } from "../../common/Utils";
import SubmissionDetailedModal, { BasicSubmissionDetailProps } from "./management/SubmissionDetailedModal";

const UserSubmissionListModal: React.FC<{ uid: number; homeworkId: number; closeCallback: () => void; }> = ({ uid, homeworkId, closeCallback }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<HomeworkSubmissionListEntry[] | null>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<Omit<BasicSubmissionDetailProps, "allowNewComment"> | null>(null);

    useEffect(() => {
        if (data === null) (async () => {
            try {
                setLoading(true);
                setData((await visualProgrammingClient.getHomeworkSubmissionList(
                    undefined, "no", [uid], homeworkId, 1, undefined
                )).data);

            } catch { } finally {
                setLoading(false);
            }
        })();
    }, [data, homeworkId, uid]);
    return <>
        {selectedSubmission !== null && <SubmissionDetailedModal
            {...selectedSubmission}
            allowNewComment={false}
            closeCallback={() => {
                setSelectedSubmission(null);
            }}
        ></SubmissionDetailedModal>}
        <Modal open size="small">
            <Modal.Header>
                查看自己的提交
            </Modal.Header>
            <Modal.Content>
                {loading && <Dimmer active><Loader active></Loader></Dimmer>}
                {data && <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>提交时间</Table.HeaderCell>
                            <Table.HeaderCell>是否已点评</Table.HeaderCell>
                            <Table.HeaderCell>操作</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {data.map(item => <Table.Row key={item.submission_id}>
                            <Table.Cell>{timeStampToString(item.submit_time)}</Table.Cell>
                            <Table.Cell>
                                {item.comment ? "已点评" : "未点评"}
                            </Table.Cell>
                            <Table.Cell>
                                <Button color="green" size="small" onClick={() => setSelectedSubmission({ homeworkId: item.homework_id, submissionId: item.submission_id, uid: item.user.uid })}>查看详情</Button>
                            </Table.Cell>
                        </Table.Row>)}
                    </Table.Body>
                </Table>}
            </Modal.Content>
            <Modal.Actions>
                <Button size="small" color="red" onClick={closeCallback}>关闭</Button>
            </Modal.Actions>
        </Modal>
    </>
};

export default UserSubmissionListModal;
