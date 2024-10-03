import { Button, Dimmer, Form, Input, Loader, Modal, TextArea } from "semantic-ui-react";
import { OnlineVMProduct, OnlineVMProductUpdateRequest } from "../client/types";
import { useState } from "react";
import onlineVMClient from "../client/OnlineVMClient";
import { useAceTheme } from "../../../states/StateUtils";
import AceEditor from "react-ace";
import { Schema, validate } from "jsonschema";
import { showErrorModal } from "../../../dialogs/Dialog";

const ChargeSchema: Schema = {
    type: "array",
    items: {
        type: "object",
        properties: {
            charge: { type: "integer", required: true },
            duration: {
                type: "array", required: true, items: [
                    { type: "integer" },
                    {
                        oneOf: [
                            { type: "integer" },
                            { type: "null" }
                        ]
                    }
                ]
            }
        }
    }
};

const ProductEditModal: React.FC<{ product: OnlineVMProduct; onClose: (shouldRefresh: boolean) => void }> = ({ onClose, product }) => {
    const [loading, setLoading] = useState(false);
    const aceTheme = useAceTheme();
    const [data, setData] = useState<OnlineVMProductUpdateRequest>(
        {
            charge_schema: JSON.stringify(product.charge_schema, undefined, 4),
            description: product.description,
            name: product.name,
            tencent_cloud_params: product.tencent_cloud_params || "{}"
        }
    );
    const doSave = async () => {
        const validateResult = validate(JSON.parse(data.charge_schema), ChargeSchema, { throwAll: false });
        if (!validateResult.valid) {
            showErrorModal(`收费模式不合法：${validateResult.errors}`);
            return;
        }

        try {
            setLoading(true);
            await onlineVMClient.updateProduct(product.product_id, data);
            onClose(true);
        } catch { }
        finally {
            setLoading(false);
        }
    };

    return <Modal size="small" open>
        <Modal.Header>编辑产品</Modal.Header>
        <Modal.Content>
            {loading && <Dimmer active><Loader></Loader></Dimmer>}
            <Form>
                <Form.Field>
                    <label>产品名</label>
                    <Input value={data.name} onChange={(_, d) => setData({ ...data, name: d.value })}></Input>
                </Form.Field>
                <Form.Field>
                    <label>产品介绍</label>
                    <TextArea value={data.description} onChange={(_, d) => setData({ ...data, description: d.value as string })}>

                    </TextArea>
                </Form.Field>
                <Form.Field>
                    <label>腾讯云创建参数</label>
                    <AceEditor
                        onChange={d => setData({ ...data, tencent_cloud_params: d })}
                        value={data.tencent_cloud_params}
                        name="tencent-cloud-params"
                        mode="plain_text"
                        width="100%"
                        height="200px"
                        wrapEnabled
                        theme={aceTheme}
                    ></AceEditor>
                </Form.Field>
                <Form.Field>
                    <label>收费模式</label>
                    <AceEditor
                        onChange={d => setData({ ...data, charge_schema: d })}
                        value={data.charge_schema}
                        name="charge_schema"
                        mode="plain_text"
                        width="100%"
                        height="200px"
                        wrapEnabled
                        theme={aceTheme}
                    ></AceEditor>
                </Form.Field>
            </Form>
        </Modal.Content>
        <Modal.Actions>
            <Button size="small" disabled={loading} onClick={() => onClose(false)}>关闭</Button>
            <Button size="small" disabled={loading} onClick={doSave}>保存</Button>
        </Modal.Actions>
    </Modal>
};

export default ProductEditModal;
