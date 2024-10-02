import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Dimmer, Icon, Image, Loader, Modal } from "semantic-ui-react";
import { OrderPaymentStatus } from "../client/types";
import onlineVMClient from "../client/OnlineVMClient";
import QRCode from "qrcode";
import { showErrorModal, showSuccessModal } from "../../../dialogs/Dialog";
import { DateTime } from "luxon";

const QRcodePaymentModal: React.FC<{ wechatPayURL: string; amount: number; orderId: number; expireTime: luxon.DateTime; createOrderTime: luxon.DateTime; onClose: (shouldJumpToOrderList?: boolean) => void }> = ({ wechatPayURL, amount, orderId, expireTime, createOrderTime, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [qrcode, setQRCode] = useState("");
  const [time, setTime] = useState<number | undefined>(undefined);
  const [IsQRcodeVaild, setisQRcodeVaild] = useState<boolean>(true);
  const [paymentStatus, setPaymentStatus] = useState<OrderPaymentStatus>("unpaid");
  const [refreshCount, setRefreshCount] = useState<number>(0)
  const tickRef = useRef<Function | undefined>(undefined);

  const initModal = useCallback(async () => {
    setLoading(true)
    setQRCode(await QRCode.toDataURL(wechatPayURL));

    setTime(Math.floor(expireTime.toSeconds() - DateTime.now().toSeconds()))
    setLoading(false)
  }, [expireTime, wechatPayURL])
  const doFinishPay = async () => {
    try {
      setLoading(true)
      const { status } = (await onlineVMClient.refreshOrderStatus(orderId));
      if (status !== 'paid') {
        showErrorModal(`没有查询到支付结果，如在${(expireTime.toSeconds() - createOrderTime.toSeconds()) * 2 / 60}分钟后还未到账，请联系管理员解决`)
      }
      if (status === 'paid') {
        showSuccessModal('支付成功')
        onClose(true)
      }

    } catch { } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    initModal();
  }, [initModal])

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
    const status = (await onlineVMClient.refreshOrderStatus(orderId)).status;
    setPaymentStatus(status)
  }, [orderId]);

  useEffect(() => {
    if (refreshCount >= 10) {
      setTimeout(async () => {
        await refreshPaymentStatus();
        setRefreshCount(c => c + 1)
      }, 5000);
    }
    if (refreshCount >= 0 && refreshCount < 10) {
      setTimeout(async () => {
        await refreshPaymentStatus();
        setRefreshCount(c => c + 1)
      }, 1000);
    }
  }, [refreshCount, refreshPaymentStatus])

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

  return <>
    <Modal open size="small">
      {loading && <Dimmer active><Loader></Loader></Dimmer>}
      <Modal.Header>支付</Modal.Header>
      <Modal.Content>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span style={{ fontSize: "large" }}>请使用微信扫描此二维码进行支付</span>
          <span style={{ display: "block", fontSize: "large" }}>应付金额: <span style={{ color: "red", fontSize: "x-large", fontWeight: "bold" }}>
            {amount / 100}元
          </span></span>
          <Image disabled={!IsQRcodeVaild} size="medium" src={qrcode}></Image>
          {IsQRcodeVaild ? <span style={{ fontSize: "large", display: "block" }}>此二维码会在 <span style={{ color: "red", fontSize: "x-large", fontWeight: "bold" }}>{time}</span> 秒后过期，请及时使用</span>
            : <span style={{ fontSize: "large", display: "block", color: "red" }}>此二维码已过期</span>}
        </div>
        {!IsQRcodeVaild && <div style={{ position: 'absolute', right: '40%', top: "40%" }}>
          <Icon name="ban" size="massive" />
        </div>}

      </Modal.Content>
      <Modal.Actions>
        <Button disabled={loading} color="green" onClick={doFinishPay}>我已完成支付</Button>
        <Button disabled={loading} color="red" onClick={() => onClose(false)}>取消支付</Button>
      </Modal.Actions>
    </Modal>
  </>
};

export default QRcodePaymentModal;

