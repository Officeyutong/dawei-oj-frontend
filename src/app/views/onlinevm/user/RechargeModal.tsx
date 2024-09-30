import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Dimmer, Form, Icon, Image, Loader, Message, Modal } from "semantic-ui-react";
import { CreateOrderResponse, OrderPaymentStatus } from "../client/types";
import onlineVMClient from "../client/OnlineVMClient";
import QRCode from "qrcode";
import { showErrorModal, showSuccessModal } from "../../../dialogs/Dialog";

const RechargeModal: React.FC<{ allowAmount: number[]; onClose: (shouldJumpToOrderList: boolean) => void }> = ({ allowAmount, onClose }) => {
    const [order, setOrder] = useState<null | CreateOrderResponse>(null);
    const [loading, setLoading] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState(0);
    const [qrcode, setQRCode] = useState("");
    const [time, setTime] = useState<number | undefined>(undefined);
    const [IsQRcodeVaild, setisQRcodeVaild] = useState<boolean>(true);
    const [paymentStatus, setPaymentStatus] = useState<OrderPaymentStatus>("unpaid");
    const [refreshCount, setRefreshCount] = useState<number>(0)
    const tickRef = useRef<Function | undefined>(undefined);

    const doFinishPay = async () => {
        try {
            setLoading(true)
            const { status } = (await onlineVMClient.refreshOrderStatus(order!.orderId));
            if (status !== 'paid') {
                showErrorModal(`没有查询到支付结果，如在${(order!.expireAfter * 2) / 60}分钟后还未到账，请联系管理员解决`)
            }
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
            setTime(resp.expireAfter)
            setQRCode(await QRCode.toDataURL(resp.payUrl));
        } catch (e) { showErrorModal(String(e)); } finally {
            setLoading(false);
        }
    };

    const tick = () => {
        if (time !== undefined && time > 0) {
            setTime(time - 1);
        }
    };
    useEffect(() => {
        tickRef.current = tick;
    });

    useEffect(() => {
        const scanTimer = setInterval(() => {
            if (tickRef.current)
                tickRef.current()
        }, 1000);

        return () => clearInterval(scanTimer);
    }, []);

    useEffect(() => {
        if (time !== undefined && time === 0) {
            (async function resetQRcode() {
                setQRCode(await QRCode.toDataURL('please do not scan expired QRcode'));
            })()
            setisQRcodeVaild(false)
            showErrorModal('该二维码已经过期，请重新刷新页面')
        }
    }, [time])

    const refreshPaymentStatus = useCallback(async () => {
        if (order) {
            const status = (await onlineVMClient.refreshOrderStatus(order.orderId)).status;
            setPaymentStatus(status)
        }
    }, [order]);

    useEffect(() => {
        if (refreshCount >= 10 && order) {
            setTimeout(async () => {
                await refreshPaymentStatus();
                setRefreshCount(c => c + 1)
            }, 5000);
        }
        if (refreshCount >= 0 && refreshCount < 10 && order) {
            setTimeout(async () => {
                await refreshPaymentStatus();
                setRefreshCount(c => c + 1)
            }, 1000);
        }
    }, [order, refreshCount, refreshPaymentStatus])

    useEffect(() => {
        if (paymentStatus === 'paid' || IsQRcodeVaild === false) {
            setRefreshCount(-1);
        }
        if (paymentStatus === 'error') {
            showErrorModal('支付出现异常，请重试，如多次出现异常请联系管理员')
            setisQRcodeVaild(false)
        }
        if (paymentStatus === 'paid') {
            showSuccessModal('支付成功')
            onClose(true)
        }
    }, [IsQRcodeVaild, onClose, paymentStatus])

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
                <Image disabled={!IsQRcodeVaild} size="medium" src={qrcode}></Image>
                {IsQRcodeVaild ? <span style={{ fontSize: "large", display: "block" }}>此二维码会在 <span style={{ color: "red", fontSize: "x-large", fontWeight: "bold" }}>{time}</span> 秒后过期，请及时使用</span>
                    : <span style={{ fontSize: "large", display: "block", color: "red" }}>此二维码已过期</span>}
            </div>}
            {!IsQRcodeVaild && <div style={{ position: 'absolute', right: '40%', top: "40%" }}>
                <Icon name="ban" size="massive" />
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

