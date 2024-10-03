import { Button, Dimmer, Form, Loader, Modal } from "semantic-ui-react";
import { RefundEntry } from "../client/types";
import { useState } from "react";
import { ComplexUserLabel, timeStampToString } from "../../../common/Utils";
import { useAceTheme } from "../../../states/StateUtils";
import AceEditor from "react-ace";
import { showConfirm, showSuccessModal } from "../../../dialogs/Dialog";
import onlineVMClient from "../client/OnlineVMClient";
const ResolveAbnormalRefundModal: React.FC<{ refund: RefundEntry; onClose: (shouldRefresh: boolean) => void; }> = ({ refund, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState("");
    const aceTheme = useAceTheme();
    const doResolve = () => {
        showConfirm("请确定已经人工完成了这笔退款后，再将其标记为解决。将其标记为解决会将对应金额从用户余额里扣除。", async () => {
            try {
                setLoading(true);
                await onlineVMClient.resolveAbnormalRefund(refund.refund_id, reason);
                showSuccessModal("操作完成！")
                onClose(true);
            } catch { } finally {
                setLoading(false);
            }
        });
    };
    return <Modal size="small" open>
        <Modal.Header>处理异常退款</Modal.Header>
        <Modal.Content>
            {loading && <Dimmer active><Loader></Loader></Dimmer>}
            <Form>
                <Form.Group widths={3}>
                    <Form.Field>
                        <label>退款用户</label>
                        <ComplexUserLabel user={refund.user}></ComplexUserLabel>
                    </Form.Field>
                    <Form.Field>
                        <label>退款金额</label>
                        {refund.amount / 100}
                    </Form.Field>
                    <Form.Field>
                        <label>发起时间</label>
                        {timeStampToString(refund.create_time)}
                    </Form.Field>
                </Form.Group>
                <Form.Field>
                    <label>退款内容描述</label>
                    <span>{refund.description}</span>
                </Form.Field>
                <Form.Field>
                    <label>管理员备注</label>
                    <AceEditor
                        value={refund.admin_description || ""}
                        name="new-comment-edit"
                        mode="plain_text"
                        width="100%"
                        height="200px"
                        wrapEnabled
                        theme={aceTheme}

                    ></AceEditor>
                </Form.Field>
                <Form.Field>
                    <label>处理备注</label>
                    <Form.TextArea value={reason} onChange={(_, d) => setReason(d.value as string)}></Form.TextArea>
                </Form.Field>
            </Form>
        </Modal.Content>
        <Modal.Actions>
            <Button color="red" disabled={loading} onClick={() => onClose(false)}>取消</Button>
            <Button color="green" disabled={loading} onClick={doResolve}>处理</Button>
        </Modal.Actions>
    </Modal>
};

export default ResolveAbnormalRefundModal;
