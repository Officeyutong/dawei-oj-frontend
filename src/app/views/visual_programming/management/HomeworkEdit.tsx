import { useEffect, useState } from "react";
import { Button, Dimmer, Form, Input, Loader, Modal, Popup } from "semantic-ui-react";
import { HomeworkUpdateRequest } from "../client/types";
import visualProgrammingClient from "../client/VisualProgrammingClient";
import AceEditor from "react-ace";
import { useAceTheme } from "../../../states/StateUtils";
const HomeworkEdit: React.FC<{ id: number; closeCallback: (shouldRefresh: boolean) => void; }> = ({ id, closeCallback }) => {
    const [data, setData] = useState<HomeworkUpdateRequest | null>(null);
    const [loading, setLoading] = useState(false);


    const save = async () => {
        try {
            setLoading(true);
            await visualProgrammingClient.updateHomework(id, data!);
            closeCallback(true);
        } catch {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (data === null) (async () => {
            try {
                setLoading(true);
                setData(await visualProgrammingClient.getHomeworkDetail(id));
            } catch { } finally {
                setLoading(false);
            }
        })();
    }, [data, id]);
    const aceTheme = useAceTheme();
    return <Modal open>
        <Modal.Header>编辑作业内容</Modal.Header>
        <Modal.Content>
            {loading && <Dimmer active><Loader active></Loader></Dimmer>}
            {data !== null && <Form>
                <Form.Input label="作业名称" value={data.name} onChange={(d, _) => setData({ ...data, name: d.target.value })}></Form.Input>
                <Form.Field>
                    <label>图片链接</label>
                    <Popup trigger={<Input value={data.image_url} onChange={(d, _) => setData({ ...data, image_url: d.target.value })}></Input>} on="focus" content="作业列表页面所展示的图片的链接。留空则不显示图片"></Popup>
                </Form.Field>
                <Form.Field>
                    <label>课程链接</label>
                    <Popup trigger={<Input value={data.course_url} onChange={(d, _) => setData({ ...data, course_url: d.target.value })}></Input>} on="focus" content="用户点击看课程按钮后所跳转到的链接。留空则不显示看课程按钮"></Popup>
                </Form.Field>
                <Form.Field>
                    <label>测试链接</label>
                    <Popup trigger={<Input value={data.exam_url} onChange={(d, _) => setData({ ...data, exam_url: d.target.value })}></Input>} on="focus" content="用户点击去测试按钮后所跳转到的链接。留空则不显示去测试按钮"></Popup>
                </Form.Field>
                <Form.Field>
                    <label>课程简介</label>
                    <AceEditor
                        onChange={v => setData({ ...data, description: v })}
                        value={data.description}
                        name="course-description-visual-programming"
                        theme={aceTheme}
                        mode="markdown"
                        width="100%"
                        height="200px"
                    ></AceEditor>

                </Form.Field>
                <Form.Field>
                    <label>嵌入式播放器HTML</label>
                    <Popup trigger={<AceEditor
                        onChange={v => setData({ ...data, video_embed_html: v })}
                        value={data.video_embed_html}
                        name="course-video_embed-visual-programming"
                        theme={aceTheme}
                        mode="plain_text"
                        width="100%"
                        height="200px"
                    ></AceEditor>} on="focus" content="视频播放的HTML代码，留空则不显示视频"></Popup>

                </Form.Field>
            </Form>}
        </Modal.Content>
        <Modal.Actions>
            <Button color="green" onClick={save} disabled={loading}>保存</Button>
            <Button color="red" onClick={() => closeCallback(false)} disabled={loading}>取消</Button>
        </Modal.Actions>
    </Modal>
};

export default HomeworkEdit;
