import { useEffect, useState } from "react";
import { Button, Dimmer, Form, Loader, Message, Modal } from "semantic-ui-react";
import { HomeworkSubmissionListEntry } from "../client/types";
import visualProgrammingClient from "../client/VisualProgrammingClient";
import { showConfirm, showErrorModal } from "../../../dialogs/Dialog";
import UserLink from "../../utils/UserLink";
import { timeStampToString } from "../../../common/Utils";
import { Markdown } from "../../../common/Markdown";
import AceEditor from "react-ace";
import { useAceTheme } from "../../../states/StateUtils";
import { showSuccessPopup } from "../../../dialogs/Utils";
import { useSelector } from "react-redux";
import { StateType } from "../../../states/Manager";
import VisualProgrammingGradeLabel from "../../utils/VisualProgrammingGradeLabel";
import _ from "lodash";
import { PUBLIC_URL } from "../../../App";
interface BasicSubmissionDetailProps {
    uid: number;
    homeworkId: number;
    submissionId: number;
    allowNewComment: boolean;
};

const SubmissionDetailedModal: React.FC<BasicSubmissionDetailProps & { closeCallback: (shouldRefresh: boolean) => void; }> = ({ submissionId, closeCallback, uid, homeworkId, allowNewComment }) => {
    const allLevels = useSelector((s: StateType) => s.userState.userData.visualProgrammingGradeLevel);
    const [data, setData] = useState<HomeworkSubmissionListEntry | null>(null);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [newGrade, setNewGrade] = useState(0);
    const save = () => {
        const doSave = async () => {
            try {
                setLoading(true);
                await visualProgrammingClient.updateComment(submissionId, newComment, newGrade);
                setLoading(false);
                showSuccessPopup("操作完成！");
                closeCallback(true);
            } catch { } finally {

            }
        };
        if (data!.comment) {
            showConfirm("继续保存将会覆盖已有点评，是否继续？", doSave);
        } else {
            doSave();
        }
    };
    const aceTheme = useAceTheme();
    useEffect(() => {
        if (data === null) {
            (async () => {
                try {
                    setLoading(true);
                    const data = await visualProgrammingClient.getHomeworkSubmissionList(
                        undefined, "no", [uid], homeworkId, 1, [submissionId]
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
    return <Modal size="large" open>
        <Modal.Header>
            查看提交详情
        </Modal.Header>
        <Modal.Content>
            {loading && <Dimmer active><Loader active></Loader></Dimmer>}
            {data !== null && <>
                <Form>
                    <Form.Group widths={5}>
                        <Form.Field>
                            <label>提交用户</label>
                            <div onClick={() => window.open(`/profile/${data.user.uid}`)}>{data.user.username} {data.user.real_name && `（${data.user.real_name}）`}</div>
                        </Form.Field>
                        <Form.Field>
                            <label>提交时间</label>
                            <span>{timeStampToString(data.submit_time)}</span>
                        </Form.Field>
                        <Form.Field>
                            <label>文件大小</label>
                            <span>{(data.file_size / 1024).toFixed(2)} KB</span>
                        </Form.Field>
                        <Form.Field>
                            <label>文件名/下载</label>
                            <a href={`/api/visualprogramming/homework/download_submission_file/${data.submission_id}`} target="_blank" rel="noreferrer">{data.file_name}</a>
                        </Form.Field>
                        <Form.Field>
                            <label>在线查看</label>
                            <a href={`/scratch?oj_submission_id=${data.submission_id}`} target="_blank" rel="noreferrer">点击此处</a>
                        </Form.Field>
                    </Form.Group>
                    {data.comment && <>
                        <Form.Group widths={3}>
                            <Form.Field>
                                <label>点评用户</label>
                                <UserLink data={data.comment}></UserLink>
                            </Form.Field>
                            <Form.Field>
                                <label>点评时间</label>
                                <span>{timeStampToString(data.comment.comment_time)}</span>
                            </Form.Field>
                            <Form.Field>
                                <label>点评等级</label>
                                <VisualProgrammingGradeLabel level={data.comment.comment_grade}></VisualProgrammingGradeLabel>
                            </Form.Field>
                        </Form.Group>
                        <Form.Field>
                            <label>点评内容</label>
                            <div style={{ overflowY: "scroll", maxHeight: "400px" }}>
                                <Markdown markdown={data.comment.comment}></Markdown>
                            </div>
                        </Form.Field>
                    </>}
                    {allowNewComment && <>
                        <Form.Field>
                            <label>编写新点评</label>
                            <AceEditor
                                onChange={d => setNewComment(d)}
                                value={newComment}
                                name="new-comment-edit"
                                mode="markdown"
                                width="100%"
                                height="200px"
                                theme={aceTheme}
                            ></AceEditor>
                        </Form.Field>
                        <Form.Group>
                            <label>新点评等级</label>
                            {_.range(0, allLevels.length).map(item => <Form.Radio label={allLevels[item]} checked={item === newGrade} onChange={() => setNewGrade(item)} key={item} />)}
                        </Form.Group>
                        <Message info>
                            <Message.Header>提示</Message.Header>
                            <Message.Content>
                                <p>如果要在点评中显示图片，可以前往<a target="_blank" rel="noreferrer" href={`${PUBLIC_URL}/imagestore/list`}>OJ内置的图床</a>上传图片后，复制对应Markdown代码嵌入。</p>
                            </Message.Content>
                        </Message>
                    </>}
                </Form>
            </>}
        </Modal.Content>
        <Modal.Actions>
            <Button color="red" size="small" disabled={loading} onClick={() => closeCallback(false)}>取消</Button>
            {allowNewComment && <Button color="green" size="small" onClick={save} disabled={loading}>保存</Button>}
        </Modal.Actions>
    </Modal>
};
export type { BasicSubmissionDetailProps }
export default SubmissionDetailedModal;
