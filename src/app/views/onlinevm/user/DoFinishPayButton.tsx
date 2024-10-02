import { Button } from "semantic-ui-react"
import onlineVMClient from "../client/OnlineVMClient";
import { showErrorModal, showSuccessModal } from "../../../dialogs/Dialog";
import { useState } from "react";

const DoFinishPayButton: React.FC<{ loading: boolean, orderId: number, expireTime: number, onClose: (flag?: boolean) => void }> = ({ loading, orderId, expireTime, onClose }) => {
  const [load, setLoad] = useState(false)
  const doFinishPay = async () => {
    try {
      setLoad(true)
      const { status } = (await onlineVMClient.refreshOrderStatus(orderId));
      if (status !== 'paid') {
        showErrorModal(`没有查询到支付结果，如在${(expireTime * 2) / 60}分钟后还未到账，请联系管理员解决`)
      }
      if (status === 'paid') {
        showSuccessModal('支付成功')
        onClose(true)
      }

    } catch { } finally {
      setLoad(false)
    }
  }

  return (
    <Button disabled={load} color="green" onClick={doFinishPay}>我已完成支付</Button>
  )
}
export default DoFinishPayButton