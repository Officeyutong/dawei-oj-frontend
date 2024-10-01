import { Button, Dimmer, Form, Loader, Modal } from "semantic-ui-react";
import { useAceTheme } from "../../states/StateUtils";
import { RefundEntry } from "./client/types";
import { useEffect, useState } from "react";
import onlineVMClient, { translateRefundStatus } from "./client/OnlineVMClient";
import { showErrorModal } from "../../dialogs/Dialog";
import UserLink from "../utils/UserLink";
import { timeStampToString } from "../../common/Utils";
import AceEditor from "react-ace";

const RefundDetailModal: React.FC<{ uid?: number; refundId: number; onClose: () => void; }> = ({ uid, refundId, onClose }) => {
    const aceTheme = useAceTheme();
    const [data, setData] = useState<RefundEntry | null>(null);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        if (!loaded) (async () => {
            try {
                setLoading(true);
                const resp = (await onlineVMClient.getRefundList(1, uid, [refundId])).data;
                if (resp.length === 0) {
                    showErrorModal("非法退款ID");
                    onClose();
                }
                setLoaded(true);
                setData(resp[0]);
            } catch { } finally {
                setLoading(false);
            }
        })();
    }, [loaded, onClose, refundId, uid]);
    return <Modal size="small" open>
        <Modal.Header>查看退款详情</Modal.Header>
        <Modal.Content>
            {loading && <Dimmer active><Loader></Loader></Dimmer>}
            {loaded && data !== null && <Form>
                <Form.Group widths={4}>
                    <Form.Field>
                        <label>退款编号</label>
                        {data?.refund_id}
                    </Form.Field>
                    <Form.Field>
                        <label>退款用户</label>
                        <UserLink data={data.user}></UserLink>
                        {data.user.real_name && `（${data.user.real_name}）`}
                    </Form.Field>
                    <Form.Field>
                        <label>退款金额</label>
                        {(data.amount / 100).toFixed(2)}
                    </Form.Field>
                    <Form.Field>
                        <label>支付状态</label>
                        {translateRefundStatus(data.refund_status)}
                    </Form.Field>
                </Form.Group>
                <Form.Group widths={3}>
                    <Form.Field>
                        <label>退款创建时间</label>
                        {timeStampToString(data.create_time)}
                    </Form.Field>
                    <Form.Field>
                        <label>退款状态最后更新时间</label>
                        {timeStampToString(data.last_update_time)}
                    </Form.Field>
                </Form.Group>
                <Form.Field>
                    <label>退款内容描述</label>
                    <span>{data.description}</span>
                </Form.Field>
                {data.admin_description && <Form.Field>
                    <label>管理员备注</label>
                    <AceEditor
                        value={data.admin_description}
                        name="new-comment-edit"
                        mode="plain_text"
                        width="100%"
                        height="200px"
                        wrapEnabled
                        theme={aceTheme}
                    ></AceEditor>
                </Form.Field>}
            </Form>}
        </Modal.Content>
        <Modal.Actions>
            <Button color="green" disabled={loading} onClick={onClose}>关闭</Button>
        </Modal.Actions>
    </Modal>
};

export default RefundDetailModal;
