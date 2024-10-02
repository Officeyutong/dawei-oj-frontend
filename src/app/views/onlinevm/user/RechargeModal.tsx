import { useState } from "react";
import { Button, Dimmer, Form, Loader, Message, Modal } from "semantic-ui-react";
import { CreateOrderResponse } from "../client/types";
import onlineVMClient from "../client/OnlineVMClient";
import { showErrorModal } from "../../../dialogs/Dialog";
import QRcodePaymentModal from "./QRcodePaymentModal";
import { DateTime } from "luxon";
import { useHistory } from "react-router-dom";
import { PUBLIC_URL } from "../../../App";

const RechargeModal: React.FC<{ allowAmount: number[]; onClose: (shouldJumpToOrderList: boolean) => void }> = ({ allowAmount, onClose }) => {
    const [order, setOrder] = useState<null | CreateOrderResponse>(null);
    const [loading, setLoading] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState(0);
    const [showChargeModel, setShowChargeModel] = useState<boolean>(false)
    const history = useHistory();

    const createOrder = async () => {
        try {
            setLoading(true);
            const resp = await onlineVMClient.createOrder(allowAmount[selectedAmount]);
            setOrder(resp);
            setShowChargeModel(true)
        } catch (e) { showErrorModal(String(e)); } finally {
            setLoading(false);
        }
    };

    return <Modal open size="small">
        {order === null && <Modal.Header>余额充值</Modal.Header>}
        {order !== null && <Modal.Header>支付</Modal.Header>}
        <Modal.Content>
            {loading && <Dimmer active><Loader></Loader></Dimmer>}
            {order === null && <>
                <Form>
                    <Form.Field>
                        <label>充值金额</label>
                        {allowAmount.map((item, idx) => <Button active={idx === selectedAmount} onClick={() => setSelectedAmount(idx)} key={item}>{item / 100}元</Button>)}

                    </Form.Field>
                </Form>
                <Message info>
                    <Message.Header>说明</Message.Header>
                    <Message.Content>
                        充值仅限于上面可以选择的金额。未使用的余额可以在充值一年内全额退款。
                    </Message.Content>
                </Message></>}
            {showChargeModel && order !== null && <>
                <QRcodePaymentModal wechatPayURL={order.payUrl} amount={allowAmount[selectedAmount]} orderId={order.orderId}
                    expireTime={DateTime.fromSeconds((order.expireAfter + order.createTime))} createOrderTime={DateTime.fromSeconds(order.createTime)} onClose={(flag) => {
                        if (flag !== undefined) {
                            if (flag) {
                                history.push(`${PUBLIC_URL}/onlinevm/recharge_order_list`)

                            }
                            onClose(flag)
                            setShowChargeModel(false)
                        }
                    }}></QRcodePaymentModal>
            </>}
        </Modal.Content>
        <Modal.Actions>
            {order === null && <>
                <Button disabled={loading} onClick={createOrder} color="green">下单</Button>
                <Button disabled={loading} onClick={() => onClose(false)} >取消</Button>
            </>}
        </Modal.Actions>
    </Modal>
};

export default RechargeModal;

