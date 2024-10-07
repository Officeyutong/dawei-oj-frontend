import { useEffect, useState } from "react";
import { Button, Dimmer, Form, Loader, Modal } from "semantic-ui-react";
import { OnlineVMOrderEntry } from "./client/types";
import onlineVMClient, { translateVMOrderStatus } from "./client/OnlineVMClient";
import { ComplexUserLabel, timeStampToString } from "../../common/Utils";
import ChargeSchemaList from "./utils/ChargeSchemaList";
import AceEditor from "react-ace";
import { useAceTheme } from "../../states/StateUtils";

const VMOrderDetailModal: React.FC<{ uid?: number; orderId: number; onClose: () => void }> = ({ uid, orderId, onClose }) => {
    const aceTheme = useAceTheme();
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [data, setData] = useState<OnlineVMOrderEntry | null>(null);
    useEffect(() => {
        if (!loaded) (async () => {
            try {
                setLoading(true);
                setData((await onlineVMClient.getVMOrderList(1, uid, [orderId])).data[0]);
                setLoaded(true);
            } catch { } finally {
                setLoading(false);
            }
        })();
    }, [loaded, orderId, uid])
    return <Modal open size="small">
        <Modal.Header>查看虚拟机订单详情</Modal.Header>
        <Modal.Content>
            {loading && <Dimmer active><Loader></Loader></Dimmer>}
            {loaded && data !== null && <Form>

                <Form.Group widths={4}>
                    <Form.Field>
                        <label>订单编号</label>
                        {data.order_id}
                    </Form.Field>
                    <Form.Field>
                        <label>订单用户</label>
                        <ComplexUserLabel user={data.user}></ComplexUserLabel>
                    </Form.Field>
                    <Form.Field>
                        <label>订单状态</label>
                        {translateVMOrderStatus(data.status)}
                    </Form.Field>
                    <Form.Field>
                        <label>产品名</label>
                        {data.product.name}
                    </Form.Field>

                </Form.Group>
                <Form.Group widths={3}>
                    <Form.Field>
                        <label>创建时间</label>
                        {timeStampToString(data.create_time)}
                    </Form.Field>
                    <Form.Field>
                        <label>最后更新时间</label>
                        {timeStampToString(data.last_update_time)}
                    </Form.Field>
                    <Form.Field>
                        <label>腾讯云实例ID</label>
                        {data.tencent_cloud_id}
                    </Form.Field>
                </Form.Group>
                <Form.Field>
                    <label>收费模式</label>
                    <ChargeSchemaList data={data.charge_schema}></ChargeSchemaList>
                </Form.Field>
                <Form.Field>
                    <label>备注</label>
                    <AceEditor
                        value={data.description}
                        name="user_desc"
                        mode="plain_text"
                        width="100%"
                        height="100px"
                        wrapEnabled
                        theme={aceTheme}
                        readOnly={true}
                    ></AceEditor>
                </Form.Field>
                {data.admin_description && <Form.Field>
                    <label>管理员备注</label>
                    <AceEditor
                        value={data.admin_description}
                        name="admin_desc"
                        mode="plain_text"
                        width="100%"
                        height="300px"
                        wrapEnabled
                        theme={aceTheme}
                        readOnly={true}
                    ></AceEditor>
                </Form.Field>}
            </Form>}
        </Modal.Content>
        <Modal.Actions>
            <Button size="small" color="red" onClick={() => onClose()} disabled={loading}>关闭</Button>
        </Modal.Actions>
    </Modal>
}

export default VMOrderDetailModal;
