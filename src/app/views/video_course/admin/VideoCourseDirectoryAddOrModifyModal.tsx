import { Button, Dimmer, Form, Input, Loader, Message, Modal } from "semantic-ui-react";
import { VideoCourseDirectoryEntryWithoutSchema, VideoCourseDirectorySchema, } from "../client/types";
import { useEffect, useState } from "react";
import { videoRecordPlayClient } from "../client/VideoCourseClient";
import { Schema, validate } from "jsonschema";
import { showErrorModal } from "../../../dialogs/Dialog";
import AceEditor from "react-ace";
import { useAceTheme } from "../../../states/StateUtils";

const SCHEMA: Schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "array",
    "title": "VideoCourseDirectorySchema",
    "items": {
        "type": "object",
        "title": "VideoCourseDirectorySchemaEntry",
        "properties": {
            "title": {
                "type": "string",
            },
            "courses": {
                "type": "array",
                "items": {
                    "type": "integer",
                }
            }
        },
        "required": ["title", "courses"],
        "additionalProperties": false
    }
};
function verifySchema(text: string): undefined | string {
    try {
        const parsed = JSON.parse(text);
        const result = validate(parsed, SCHEMA);
        if (!result.valid) {
            return result.toString();
        }

    } catch (e) {
        return String(e);
    }
}

const VideoCourseDirectoryAddOrModifyModal: React.FC<{
    onClose: (shouldUpdate: boolean) => void;
    currentData: null | VideoCourseDirectoryEntryWithoutSchema;
}> = ({ onClose, currentData }) => {
    const [title, setTitle] = useState("");
    const [schema, setSchema] = useState("");
    const [order, setOrder] = useState("");
    const [previewImageURL, setPreviewImageURL] = useState("");
    const creating = currentData === null;

    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const theme = useAceTheme();
    useEffect(() => {
        if (!loaded) (async () => {
            try {
                setLoading(true);
                if (currentData) {
                    const resp = await videoRecordPlayClient.getVideoCourseDirectory(currentData.id);
                    setTitle(resp.title);
                    setOrder(resp.order.toString());
                    setSchema(JSON.stringify(resp.schema, undefined, 4));
                    setPreviewImageURL(resp.preview_image_url);

                }
                setLoaded(true);
            } catch { } finally { setLoading(false); }
        })();
    }, [currentData, loaded]);
    const doSave = async () => {
        try {
            setLoading(true);
            const verifyResult = verifySchema(schema);
            if (verifyResult !== undefined) {
                showErrorModal(verifyResult);
                return;
            }
            if (currentData) {
                await videoRecordPlayClient.updateVideoCourseDirectory(currentData.id, title, JSON.parse(schema) as VideoCourseDirectorySchema, parseInt(order), previewImageURL);
            } else {
                await videoRecordPlayClient.addVideoCourseDirectory(title, JSON.parse(schema) as VideoCourseDirectorySchema, parseInt(order), previewImageURL);
            }
            onClose(true);
        } catch { } finally {
            setLoading(false);
        }
    };

    return <Modal open size="small">
        <Modal.Header>
            {creating ? "添加视频课目录" : "修改视频课目录"}
        </Modal.Header>
        <Modal.Content>
            {loading && <Dimmer active page><Loader></Loader></Dimmer>}
            <Form>
                {currentData && <Form.Field>
                    <label>课程目录ID</label>
                    {currentData.id}
                </Form.Field>}
                <Form.Field>
                    <label>标题</label>
                    <Input value={title} onChange={(e, _) => setTitle(e.target.value)}></Input>
                </Form.Field>
                <Form.Field>
                    <label>排序</label>
                    <Input value={order} onChange={(e, _) => setOrder(e.target.value)}></Input>
                </Form.Field>
                <Form.Field>
                    <label>预览图片URL</label>
                    <Input value={previewImageURL} onChange={(e, _) => setPreviewImageURL(e.target.value)}></Input>
                    <Message info>
                        <Message.Header>提示</Message.Header>
                        <Message.Content>
                            这里设置用于在视频课目录列表页面展示的图片的网址。留空时会显示默认的空白图片。
                        </Message.Content>
                    </Message>
                </Form.Field>
                <Form.Field>
                    <label>课程目录结构</label>
                    <AceEditor
                        value={schema}
                        onChange={t => setSchema(t)}
                        theme={theme}
                        mode="plain_text"
                        width="100%"
                        height="400px"
                    ></AceEditor>
                </Form.Field>
            </Form>
        </Modal.Content>
        <Modal.Actions>
            <Button color="red" onClick={() => onClose(false)}>取消</Button>
            <Button color="green" onClick={doSave}>保存</Button>
        </Modal.Actions>
    </Modal>
};

export default VideoCourseDirectoryAddOrModifyModal;
