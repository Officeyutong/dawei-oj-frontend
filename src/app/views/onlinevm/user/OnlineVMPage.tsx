import { useEffect, useMemo, useRef, useState } from "react"
import { useHistory, useParams } from "react-router-dom";
import { Button, Dimmer, DimmerDimmable, Header, Icon, Loader, Message, Segment, Table } from "semantic-ui-react"
import onlineVMClient from "../client/OnlineVMClient";
import { DateTime } from "luxon";
import { showErrorPopup, showSuccessPopup } from "../../../dialogs/Utils";
import { timeStampToString, useDocumentTitle } from "../../../common/Utils";
import { StateType } from "../../../states/Manager";
import { useSelector } from "react-redux";
import { showConfirm, showSuccessModal } from "../../../dialogs/Dialog";
import { PUBLIC_URL } from "../../../App";

const OnlineVMPage = () => {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [loadingText, setLoadingText] = useState<string>('')
    const [url, setUrl] = useState<string>('')
    const [createTime, setCreateTime] = useState<number>(0);
    const [isIframeBlured, setIsIframeBlured] = useState<boolean>(false);
    const [ranTime, setRanTime] = useState<{ hours: number, minutes: number, seconds: number } | null>(null);
    const { orderid } = useParams<{ orderid: string, createtime: string }>();
    const orderIdNum = useMemo(() => parseInt(orderid), [orderid]);
    const tickRef = useRef<(() => void) | null>(null);
    const aliveTickRef = useRef<(() => void) | null>(null);
    const iframeURL = 'https://img.qcloud.com/qcloud/app/active_vnc/index.html?InstanceVncUrl='
    const { initialRequestDone } = useSelector((s: StateType) => s.userState)
    const { uid } = useSelector((s: StateType) => s.userState.userData);
    const history = useHistory();
    useDocumentTitle("连接虚拟机");
    const doDestroy = () => showConfirm("您确定要退还此台虚拟机吗？一旦退还，这台虚拟机所有的数据都会被删除，并且无法找回。退还后，虚拟机将不会再计费。", async () => {
        try {
            setLoadingText('正在退还虚拟机，请勿刷新网页')
            await onlineVMClient.destroyVM(orderIdNum);
            showSuccessPopup("退还成功！");
            history.push(`${PUBLIC_URL}/onlinevm/vm_order_list`);
        } catch { } finally {
            setLoadingText('')
        }
    });

    const getVNCUrl = async (orderId: number) => {
        try {
            setLoadingText('加载中')
            const url = await onlineVMClient.getVNCUrl(orderId)
            setUrl(url.url)
        } catch { } finally {
            if (iframeRef.current) {
                iframeRef.current.focus()
            }

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
    }, []);

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
            if (iframeRef.current) {
                iframeRef.current.focus()
            }
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
        <Header as="h2">
            连接虚拟机
        </Header>
        {loadingText !== '' && <Dimmer active>
            <Loader>{loadingText}</Loader>
        </Dimmer>}
        <div id='screen' style={{ width: "100%", height: "60rem", display: "flex" }}>
            <DimmerDimmable style={{ display: "flex", width: "100%", fontSize: '10rem' }}>
                {isIframeBlured && <Dimmer blurring active as={Segment} onClickOutside={() => {
                    setIsIframeBlured(false)
                    if (iframeRef.current) {
                        iframeRef.current.focus()
                    }
                }}>
                    <Icon name='exclamation' size='massive'></Icon>
                    <Header as='h2' style={{ color: "white" }}>点击此处继续操作虚拟机</Header>
                </Dimmer>}
                <iframe ref={iframeRef} title='vmiframe' src={iframeURL + url} frameBorder="no" allowFullScreen={true} style={{ width: '100%' }} onBlur={() => setIsIframeBlured(true)}
                ></iframe>
            </DimmerDimmable>
        </div>
        <div style={{ marginTop: "19px" }}>
            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>虚拟机创建时间</Table.HeaderCell>
                        <Table.HeaderCell>虚拟机已经创建了</Table.HeaderCell>
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
            <Message warning>
                <Message.Header>注意</Message.Header>
                <Message.Content>
                    <p>在全屏模式时，按Esc键的行为是退出全屏模式。如果希望向虚拟机内发送Esc键，请不要使用全屏模式。</p>
                    <p>“发送远程命令”按钮仅用于向虚拟机发送部分无法直接发送的组合键（比如Ctrl+Alt+Del），真实比赛环境下不存在此按钮和旁边的蓝色提示条。</p>
                    <p>如果在虚拟机内按键盘没有反应，请尝试刷新网页。</p>
                </Message.Content>
            </Message>
            <Button style={{ postion: 'absolute' }} disable={loadingText !== ''} onClick={handleFullScreen}>全屏</Button>
            <Button style={{ postion: 'absolute' }} disabled={loadingText !== ''} onClick={handleOpenVM}>发送开机指令</Button>
            <Button style={{ postion: 'absolute' }} disabled={loadingText !== ""} onClick={doDestroy} color="red">退还</Button>
        </div>
    </>)
}

export default OnlineVMPage
