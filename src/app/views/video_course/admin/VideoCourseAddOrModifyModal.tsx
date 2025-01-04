import { Button, Dimmer, Form, Input, Loader, Modal } from "semantic-ui-react";
import { VideoCourseEntryWithoutSchema, VideoCourseSchema } from "../client/types";
import { useEffect, useState } from "react";
import { videoRecordPlayClient } from "../client/VideoCourseClient";
import { Schema, validate } from "jsonschema";
import { showErrorModal } from "../../../dialogs/Dialog";
import AceEditor from "react-ace";
import { useAceTheme } from "../../../states/StateUtils";

const SCHEMA: Schema = {
    "type": "array",
    "items": {
        "oneOf": [
            {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer"
                    },
                    "type": {
                        "type": "string",
                        "enum": ["video"]
                    },
                    "next": {
                        "type": ["integer", "null"]
                    },
                    "video_id": {
                        "type": "integer"
                    }
                },
                "required": ["id", "type", "next", "video_id"],
                "additionalProperties": false
            },
            {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer"
                    },
                    "type": {
                        "type": "string",
                        "enum": ["choice_question"]
                    },
                    "title": {
                        "type": "string"
                    },
                    "content": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "content": {
                                    "type": "string"
                                },
                                "next": {
                                    "type": "integer"
                                }
                            },
                            "required": ["content", "next"],
                            "additionalProperties": false
                        }
                    }
                },
                "required": ["id", "type", "title", "content"],
                "additionalProperties": false
            }
        ]
    }
}
    ;
function verifySchema(text: string): undefined | string {
    try {
        const parsed = JSON.parse(text);
        const result = validate(parsed, SCHEMA);
        if (!result.valid) {
            return result.toString();
        }
        const schema = parsed as VideoCourseSchema;
        const allIds = new Set<number>();
        let nullOutCount = 0;
        for (const entry of schema) {
            allIds.add(entry.id);
            if (entry.type === "video" && entry.next === null) nullOutCount++;
        }
        if (nullOutCount !== 1) {
            return "必须有恰好一个next为null的节点";
        }
        for (const entry of schema) {
            if (entry.type === "video" && entry.next !== null && !allIds.has(entry.next)) {
                return `节点 ${entry.id} 的后继非法`
            }
            if (entry.type === "choice_question") {
                for (const choice of entry.content) {
                    if (!allIds.has(choice.next)) return `节点 ${entry.id} 的选项 ${choice.content} 的后继非法`;
                }
            }
        }
    } catch (e) {
        return String(e);
    }
}

const VideoCourseAddOrModifyModal: React.FC<{
    onClose: (shouldUpdate: boolean) => void;
    currentData: null | VideoCourseEntryWithoutSchema;
}> = ({ onClose, currentData }) => {
    const [title, setTitle] = useState("");
    const [schema, setSchema] = useState("");

    const creating = currentData === null;

    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const theme = useAceTheme();
    useEffect(() => {
        if (!loaded) (async () => {
            try {
                setLoading(true);
                if (currentData) {
                    const resp = await videoRecordPlayClient.getVideoCourse(currentData.id);
                    setTitle(resp.title);
                    setSchema(JSON.stringify(resp.schema, undefined, 4));

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
                await videoRecordPlayClient.updateVideoCourse(currentData.id, title, JSON.parse(schema) as VideoCourseSchema);
            } else {
                await videoRecordPlayClient.addVideoCourse(title, JSON.parse(schema) as VideoCourseSchema);
            }
            onClose(true);
        } catch { } finally {
            setLoading(false);
        }
    };

    return <Modal open size="small">
        <Modal.Header>
            {creating ? "添加视频课程" : "修改视频课程"}
        </Modal.Header>
        <Modal.Content>
            {loading && <Dimmer active page><Loader></Loader></Dimmer>}
            <Form>
                {currentData && <Form.Field>
                    <label>课程ID</label>
                    {currentData.id}
                </Form.Field>}
                <Form.Field>
                    <label>标题</label>
                    <Input value={title} onChange={(e, _) => setTitle(e.target.value)}></Input>
                </Form.Field>
                <Form.Field>
                    <label>课程结构</label>
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

export default VideoCourseAddOrModifyModal;
