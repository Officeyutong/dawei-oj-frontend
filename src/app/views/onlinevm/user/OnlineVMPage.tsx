import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom";
import { Button, Dimmer, Loader } from "semantic-ui-react"
import onlineVMClient from "../client/OnlineVMClient";
import { DateTime } from "luxon";
import { showErrorPopup } from "../../../dialogs/Utils";
import { timeStampToString } from "../../../common/Utils";
import { StateType } from "../../../states/Manager";
import { useSelector } from "react-redux";

const OnlineVMPage = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [loadingText, setLoadingText] = useState<string>('')
  const [url, setUrl] = useState<string>('')
  const [createTime, setCreateTime] = useState<number>(0);
  const { orderid } = useParams<{ orderid: string, createtime: string }>();
  const tickRef = useRef<Function | undefined>(undefined);
  const iframeURL = 'https://img.qcloud.com/qcloud/app/active_vnc/index.html?InstanceVncUrl='
  const { initialRequestDone } = useSelector((s: StateType) => s.userState)
  const { uid } = useSelector((s: StateType) => s.userState.userData)

  const getVNCUrl = async (orderId: number) => {
    try {
      setLoadingText('加载中')
      const url = await onlineVMClient.getVNCUrl(orderId)
      setUrl(url.url)
    } catch { } finally {
      setLoadingText('')
    }
  }
  useEffect(() => {
    const oid = orderid;
    getVNCUrl(Number(oid))
  }, [orderid])

  useEffect(() => {
    (async () => {
      if (initialRequestDone) {
        const cTime = (await onlineVMClient.getVMOrderList(1, uid, [Number(orderid)])).data[0].create_time
        setCreateTime(Number(cTime))
      }
    })()
  }, [initialRequestDone, orderid, uid])
  useEffect(() => {
    tickRef.current = tick;
  });

  const tick = () => {
    if ((((DateTime.now().toSeconds() - createTime) % 3600) / 60) > 55) {
      showErrorPopup('已经快到达一个计费周期，如继续使用虚拟机将会进行扣费，如无需使用请销毁虚拟机')
    }
  };

  useEffect(() => {
    const scanTimer = setInterval(() => {
      if (tickRef.current)
        tickRef.current()
    }, 60000);

    return () => clearInterval(scanTimer);
  }, [createTime]);

  useEffect(() => {

  })
  const handleFullScreen = () => {
    if (iframeRef.current) {
      setLoadingText('全屏加载中')
      iframeRef.current.requestFullscreen()
      setLoadingText('')
    }
  }
  const handleOpenVM = async () => {
    try {
      setLoadingText('正在开机')
      await onlineVMClient.startVM(Number(orderid))
      setTimeout(() => {
        getVNCUrl(Number(orderid))
        setLoadingText('')
      }, 10000)
    } catch { } finally { }
  }
  return (<>
    {loadingText !== '' && <Dimmer active>
      <Loader>{loadingText}</Loader>
    </Dimmer>}
    <div id='screen' style={{ width: "100%", height: "60rem", display: "flex" }}>
      <iframe ref={iframeRef} title='vmiframe' src={iframeURL + url} frameBorder="no" allowFullScreen={true} style={{ width: '100%' }}></iframe>

    </div>
    <Button style={{ postion: 'absolute' }} disable={loadingText !== ''} onClick={handleFullScreen}>全屏</Button>
    <Button style={{ postion: 'absolute' }} disabled={loadingText !== ''} onClick={handleOpenVM}>开机</Button>
    <p>虚拟机创建时间：{timeStampToString(createTime)}   虚拟机当前已经运行{Math.ceil(DateTime.now().diff(DateTime.fromSeconds(createTime)).as("seconds") / 3600)}小时</p>
  </>)
}

export default OnlineVMPage