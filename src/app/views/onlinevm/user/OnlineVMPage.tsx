import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom";
import { Button, Dimmer, Loader, Table } from "semantic-ui-react"
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
  const [ranTime, setRanTime] = useState<{ hours: number, minutes: number, seconds: number } | null>(null);
  const { orderid } = useParams<{ orderid: string, createtime: string }>();
  const tickRef = useRef<(() => void) | null>(null);
  const aliveTickRef = useRef<(() => void) | null>(null);
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
    aliveTickRef.current = aliveTick;
  });

  const aliveTick = () => {
    const ranTime = DateTime.now().diff(DateTime.fromSeconds(createTime), ['hours', "minutes", 'seconds'])
    setRanTime(ranTime);
  };

  useEffect(() => {
    const scanTimer = setInterval(() => {
      if (aliveTickRef.current)
        aliveTickRef.current()
    }, 1000);

    return () => clearInterval(scanTimer);
  }, []);

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
    } catch { } finally { setLoadingText('') }
  }
  return (<>
    {loadingText !== '' && <Dimmer active>
      <Loader>{loadingText}</Loader>
    </Dimmer>}
    <div id='screen' style={{ width: "100%", height: "60rem", display: "flex" }}>
      <iframe ref={iframeRef} title='vmiframe' src={iframeURL + url} frameBorder="no" allowFullScreen={true} style={{ width: '100%' }}></iframe>
    </div>
    <div style={{ marginTop: "19px" }}>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>虚拟机创建时间</Table.HeaderCell>
            <Table.HeaderCell>虚拟机已经运行了</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>{timeStampToString(createTime)}</Table.Cell>
            <Table.Cell              >
              {ranTime !== null && <>{Math.ceil(ranTime.hours)}小时
                {Math.ceil(ranTime.minutes)}分钟
                {Math.ceil(ranTime.seconds)}秒</>}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      <Button style={{ postion: 'absolute' }} disable={loadingText !== ''} onClick={handleFullScreen}>全屏</Button>
      <Button style={{ postion: 'absolute' }} disabled={loadingText !== ''} onClick={handleOpenVM}>发送开机指令</Button>
    </div>
  </>)
}

export default OnlineVMPage
