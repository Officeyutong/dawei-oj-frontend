import { useState } from "react";
import { Button, Dimmer, Form, Image, Loader, Message, Modal } from "semantic-ui-react";
import { CreateOrderResponse } from "../client/types";
import onlineVMClient from "../client/OnlineVMClient";
import QRCode from "qrcode";
import { showErrorModal } from "../../../dialogs/Dialog";

const RechargeModal: React.FC<{ allowAmount: number[]; onClose: (shouldJumpToOrderList: boolean) => void }> = ({ allowAmount, onClose }) => {
    const [order, setOrder] = useState<null | CreateOrderResponse>(null);
    const [loading, setLoading] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState(0);
    const [qrcode, setQRCode] = useState("");
    const doFinishPay = async () => {
        try {
            setLoading(true)
            await onlineVMClient.refreshOrderStatus(order!.orderId);
            onClose(true);
        } catch { } finally {
            setLoading(false);
        }
    };
    const createOrder = async () => {
        try {
            setLoading(true);
            const resp = await onlineVMClient.createOrder(allowAmount[selectedAmount]);
            setOrder(resp);
            setQRCode(await QRCode.toDataURL(resp.payUrl));
        } catch (e) { showErrorModal(String(e)); } finally {
            setLoading(false);
        }
    };
    return <Modal open size="small">
        <Modal.Header>余额充值</Modal.Header>
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
            {order !== null && <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "large" }}>请使用微信扫描此二维码进行支付</span>
                <span style={{ display: "block", fontSize: "large" }}>应付金额: <span style={{ color: "red", fontSize: "x-large", fontWeight: "bold" }}>
                    {allowAmount[selectedAmount] / 100}元
                </span></span>
                <Image size="medium" src={qrcode}></Image>
                <span style={{ fontSize: "large", display: "block" }}>此二维码会在 <span style={{ color: "red", fontSize: "x-large", fontWeight: "bold" }}>{order.expireAfter}</span> 后过期，请及时使用</span>
            </div>}
        </Modal.Content>
        <Modal.Actions>
            {order === null && <>
                <Button disabled={loading} onClick={createOrder} color="green">下单</Button>
                <Button disabled={loading} onClick={() => onClose(false)} >取消</Button>
            </>}
            {order !== null && <>
                <Button disabled={loading} color="green" onClick={doFinishPay}>我已完成支付</Button>
                <Button disabled={loading} color="red" onClick={() => onClose(true)}>取消支付</Button>
            </>}
        </Modal.Actions>
    </Modal>
};

export default RechargeModal;

