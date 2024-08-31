import { useEffect, useRef, useState } from "react";
import { Button, Dimmer, Form, Grid, Loader, Modal } from "semantic-ui-react";
import { HomeworkDetail } from "../client/types";
import visualProgrammingClient from "../client/VisualProgrammingClient";
import { showErrorModal, showSuccessModal } from "../../../dialogs/Dialog";

const TemplateProjectEdit: React.FC<{ onClose: () => void; homeworkId: number }> = ({ onClose, homeworkId }) => {
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const uploadRef = useRef<HTMLInputElement>(null);
    const doUpload = async () => {
        const files = uploadRef.current?.files;
        if (!files) {
            showErrorModal("请选择要上传的文件！");
            return;
        }
        if (files.length !== 1) {
            showErrorModal("请选择恰好一个文件！");
            return;
        }
        const file = files[0];
        const formData = new FormData();
        formData.append(file.name, file, file.name);
        try {
            setLoading(true);
            await visualProgrammingClient.uploadTemplateProject(homeworkId, formData);
            setData(await visualProgrammingClient.getHomeworkDetail(homeworkId));
            showSuccessModal("上传完成！");
        } catch { } finally {
            setLoading(false);
        }
    };
    const doDelete = async () => {
        try {
            setLoading(true);
            await visualProgrammingClient.clearTemplateProject(homeworkId);
            setData(await visualProgrammingClient.getHomeworkDetail(homeworkId));
        } catch { } finally {
            setLoading(false);
        }
    };
    const [data, setData] = useState<null | HomeworkDetail>(null);
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setData(await visualProgrammingClient.getHomeworkDetail(homeworkId));
                setLoaded(true);
            } catch { } finally {
                setLoading(false);
            }
        })();
    }, [homeworkId, loaded]);
    return <Modal size="small" open>
        <Modal.Header>编辑模板项目</Modal.Header>
        <Modal.Content>
            {loading && <Dimmer active><Loader active></Loader></Dimmer>}
            {data !== null && <Form>
                <Form.Field>
                    <label>当前状态</label>
                    {data.has_template_project && <Grid columns={1}>
                        <Grid.Column>
                            当前作业有模板项目，<a href={visualProgrammingClient.getTemplateProjectUrl(homeworkId)} target="_blank" rel="noreferrer">点此下载</a>。
                        </Grid.Column>
                        <Grid.Column>
                            <Button color="green" loading={loading} onClick={doDelete}>删除当前模板项目</Button>
                        </Grid.Column>
                    </Grid>}
                    {!data.has_template_project && <div>当前作业没有模板项目</div>}
                </Form.Field>
                <Form.Field>
                    <label>上传新的模板项目</label>
                    <Grid columns={1}>
                        <Grid.Column>
                            <input ref={uploadRef} type="file"></input>
                        </Grid.Column>
                        <Grid.Column>
                            <Button color="green" loading={loading} onClick={doUpload}>上传</Button>
                        </Grid.Column>
                    </Grid>
                </Form.Field>
            </Form>}
        </Modal.Content>
        <Modal.Actions>
            <Button color="red" loading={loading} onClick={() => onClose()}>关闭</Button>
        </Modal.Actions>
    </Modal>
};

export default TemplateProjectEdit;
