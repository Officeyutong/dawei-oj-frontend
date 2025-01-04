import { Button, Dimmer, Form, Input, Loader, Modal } from "semantic-ui-react";
import { VideoClipEntry } from "../client/types";
import { useInputValue } from "../../../common/Utils";
import { useState } from "react";
import { videoRecordPlayClient } from "../client/VideoCourseClient";

const VideoClipAddOrModifyModal: React.FC<{
    onClose: (shouldUpdate: boolean) => void;
    currentData: null | VideoClipEntry;
}> = ({ onClose, currentData }) => {
    const ossPath = useInputValue(currentData?.oss_path || "");
    const description = useInputValue(currentData?.description || "");

    const creating = currentData === null;

    const [loading, setLoading] = useState(false);

    const doSave = async () => {
        try {
            setLoading(true);
            if (currentData) {
                await videoRecordPlayClient.updateVideoClip(currentData.id, ossPath.value, description.value);
            } else {
                await videoRecordPlayClient.addVideoClip(ossPath.value, description.value);
            }
            onClose(true);
        } catch { } finally {
            setLoading(false);
        }
    };

    return <Modal open size="small">
        <Modal.Header>
            {creating ? "添加视频切片" : "修改视频切片"}
        </Modal.Header>
        <Modal.Content>
            {loading && <Dimmer active page><Loader></Loader></Dimmer>}
            <Form>
                {currentData && <Form.Field>
                    <label>切片ID</label>
                    {currentData.id}
                </Form.Field>}
                <Form.Field>
                    <label>OSS路径</label>
                    <Input {...ossPath}></Input>
                </Form.Field>
                <Form.Field>
                    <label>描述</label>
                    <Input {...description}></Input>
                </Form.Field>
            </Form>
        </Modal.Content>
        <Modal.Actions>
            <Button disabled={loading} color="red" onClick={() => onClose(false)}>取消</Button>
            <Button disabled={loading} color="green" onClick={doSave}>保存</Button>
        </Modal.Actions>
    </Modal>
};

export default VideoClipAddOrModifyModal;
