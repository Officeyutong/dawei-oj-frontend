import { useEffect, useState } from "react";
import { Button, Dimmer, Form, Loader, Modal } from "semantic-ui-react";
import { TransactionEntry } from "./client/types";
import onlineVMClient from "./client/OnlineVMClient";
import { ComplexUserLabel, timeStampToString } from "../../common/Utils";
import AceEditor from "react-ace";
import { useAceTheme } from "../../states/StateUtils";

const TransactionDetailModal: React.FC<{ transactionId: number; uid?: number; onClose: () => void; }> = ({ transactionId, onClose, uid }) => {
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [data, setData] = useState<TransactionEntry | null>(null);
    const aceTheme = useAceTheme();
    useEffect(() => {
        if (!loaded) (async () => {
            try {
                setLoading(true);
                const { data } = await onlineVMClient.getTransactionList(1, uid, [transactionId]);
                setData(data[0]);
                setLoaded(true);
            } catch { } finally {
                setLoading(false);
            }
        })();
    }, [loaded, transactionId, uid]);
    return <Modal size="small" open>
        <Modal.Header>查看交易记录详情</Modal.Header>
        <Modal.Content>
            {loading && <Dimmer active><Loader></Loader></Dimmer>}
            {loaded && data !== null && <Form>
                <Form.Group widths={4}>
                    <Form.Field>
                        <label>交易编号</label>
                        {data.id}
                    </Form.Field>
                    <Form.Field>
                        <label>交易用户</label>
                        <ComplexUserLabel user={data.user}></ComplexUserLabel>
                    </Form.Field>
                    <Form.Field>
                        <label>交易时间</label>
                        {timeStampToString(data.time)}
                    </Form.Field>
                    <Form.Field>
                        <label>交易数额</label>
                        {data.amount / 100}
                    </Form.Field>
                </Form.Group>
                <Form.Field>
                    <label>交易内容描述</label>
                    <span>{data.description}</span>
                </Form.Field>
                <Form.Group widths={3}>
                    <Form.Field>
                        <label>关联充值订单ID</label>
                        {data.related_order_id || "无"}
                    </Form.Field>
                    <Form.Field>
                        <label>关联操作员ID</label>
                        {data.related_operator_id || "无"}
                    </Form.Field>
                    <Form.Field>
                        <label>关联退款单</label>
                        {data.related_refund_id || "无"}
                    </Form.Field>
                </Form.Group>
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
            <Button disabled={loading} onClick={() => onClose()}>关闭</Button>
        </Modal.Actions>
    </Modal>
};

export default TransactionDetailModal;
