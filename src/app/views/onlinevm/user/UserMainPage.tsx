import { useEffect, useState } from "react";
import { OnlineVMProduct, UserBasicInfo } from "../client/types";
import onlineVMClient from "../client/OnlineVMClient";
import { Button, ButtonGroup, ButtonOr, Dimmer, Grid, GridColumn, GridRow, Header, Loader, Segment, Statistic, StatisticValue } from "semantic-ui-react";
import RechargeModal from "./RechargeModal";
import { Link, useHistory } from "react-router-dom";
import { PUBLIC_URL } from "../../../App";
import { useDocumentTitle } from "../../../common/Utils";
import { useSelector } from "react-redux";
import { StateType } from "../../../states/Manager";
import { showSuccessModal } from "../../../dialogs/Dialog";
import _ from "lodash";
import doc0 from "../assets/doc0.txt";
import { Markdown } from "../../../common/Markdown";
import axios from "axios";
// import { PieChart } from "@opd/g2plot-react";

const UserMainPage: React.FC<{}> = () => {
    const [basicInfo, setBasicInfo] = useState<UserBasicInfo | null>(null);
    const [amount, setAmount] = useState<string[] | null>(null)
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [showRechargeModal, setShowRechargeModal] = useState(false);
    // const [pieChartData, setPieChartData] = useState<({ name: string, hours: number })[] | null>(null);
    // const [sumHours, setSumHours] = useState<number>(0)
    const [products, setProducts] = useState<OnlineVMProduct[]>([]);
    const [usedHours, setUsedHours] = useState<{ hours: number }[]>([]);
    const [markdownString, setMarkdownString] = useState<string | null>(null);
    const history = useHistory();
    const selfUid = useSelector((s: StateType) => s.userState.userData.uid);
    useDocumentTitle("个人基本信息")
    useEffect(() => {
        if (!loaded) {
            (async () => {
                try {
                    setLoading(true);
                    const [a, prods, markdown] = await Promise.all([onlineVMClient.getUserBasicInfo(), onlineVMClient.getProducts(), axios.get(doc0)]);
                    const hours = await Promise.all(prods.map(item => onlineVMClient.getUsedHourForProduct(item.product_id)));
                    setBasicInfo(a);
                    setProducts(prods);
                    setUsedHours(hours);
                    setMarkdownString(markdown.data as string);
                    // const chartData = _.zip(prods, hours).map(([prod, hour]) => {
                    //     return { name: prod!.name, hours: Number(hour!.hours) }
                    // })
                    // setPieChartData(chartData)
                    // const hoursSum = hours.reduce((prev, item) => {
                    //     return prev + item.hours;
                    // }, 0)
                    // setSumHours(Number(hoursSum))

                    setAmount(String(a.remainedAmount / 100).split('.'))
                    setLoaded(true);
                } catch { } finally {
                    setLoading(false);
                }
            })();
        }
    }, [loaded]);

    const doRefund = async () => {
        try {
            setLoading(true);
            await onlineVMClient.requestRefund(selfUid);
            setBasicInfo(await onlineVMClient.getUserBasicInfo());
            showSuccessModal('退款申请提交成功，请关注到账情况。');

        } catch { } finally {
            setLoading(false);
        }
    };

    return <>
        {showRechargeModal && <RechargeModal
            allowAmount={basicInfo!.allowRechargeAmount}
            onClose={flag => {
                if (flag) history.push(`${PUBLIC_URL}/onlinevm/recharge_order_list`)
                setShowRechargeModal(false);
            }}
        ></RechargeModal>}
        <Header as="h2">基本信息</Header>
        {loading && <Dimmer page active><Loader></Loader></Dimmer>}
        <Segment>
            <Header as="h3">用户费用信息</Header>
            {loaded && basicInfo && <Grid columns={2} divided>
                <Grid.Row>
                    <Grid.Column>
                        <p>当前余额：</p>
                        <div>
                            {amount && <p style={{ fontWeight: 'bold', display: 'inline', marginRight: '5rem' }}>
                                <span style={{ fontSize: "2rem" }}>{amount[0]}</span>
                                {amount[1] && <span style={{ fontSize: '1rem' }}>.{amount[1]}</span>}元
                            </p>}
                            <ButtonGroup>
                                <Button positive onClick={() => setShowRechargeModal(true)}>充值</Button>
                                <ButtonOr />
                                <Button onClick={() => doRefund()}>退款</Button>
                            </ButtonGroup>
                        </div>

                        <Segment >
                            <Grid columns={2} divided>
                                <GridRow>
                                    <GridColumn>
                                        <Link to={`${PUBLIC_URL}/onlinevm/balance_change_list`} style={{ display: "block" }}>查看余额变动详情 </Link>
                                    </GridColumn>
                                    <GridColumn>
                                        <Link to={`${PUBLIC_URL}/onlinevm/refund_list`} style={{ display: "block" }}>查看退款记录</Link>
                                    </GridColumn>
                                </GridRow>
                            </Grid>
                        </Segment>

                    </Grid.Column>
                </Grid.Row>
            </Grid >}
        </Segment >
        {loaded && <Segment>
            <Header as="h3">用户虚拟机总览</Header>
            <div>
                {
                    _.zip(products, usedHours).map(([prod, hour]) =>
                        <div key={prod!.product_id} style={{ display: 'inline-block', marginRight: '0.5rem', marginTop: '0.5rem' }}>
                            <Segment key={prod!.product_id} style={{ display: 'flex', justifyContent: 'center', alignItems: "center", flexDirection: "column" }}>
                                <div style={{ height: "14rem", width: "14rem" }}>
                                    <Header>{prod!.name}</Header>
                                    使用时长：
                                    <Statistic><StatisticValue>{hour!.hours}</StatisticValue>小时</Statistic>
                                </div>
                            </Segment>
                        </div>
                    )
                }
            </div>
            {/* <div style={{ marginTop: '1rem', overflow: "hidden" }}>
                {pieChartData && <PieChart
                    radius={1}
                    innerRadius={0.36}
                    data={pieChartData}
                    angleField="hours"
                    colorField="name"
                    label={{
                        type: 'inner',
                        offset: '-50%',
                        autoRotate: false,
                        content: (s: any) => `${(s.percent as number * 100).toFixed(0)}% (${s.name})`,
                        style: {
                            fontSize: 14,
                            textAlign: 'center',
                            fill: 'black'
                        },
                    }}
                    statistic={{
                        title: false,
                        content: {
                            style: {
                                whiteSpace: "pre-wrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                fontSize: "14px"
                            },
                            content: `总计 ${sumHours} 小时`,
                        },
                    }}
                ></PieChart>}
            </div> */}
            <Button style={{ marginTop: "1rem" }} color='green' onClick={() => { window.location.href = `${PUBLIC_URL}/onlinevm/vm_order_list` }}>创建新虚拟机</Button>
        </Segment >}
        {markdownString !== null && <Segment>
            <Markdown markdown={markdownString}></Markdown>
        </Segment>}


    </>;
};

export default UserMainPage;
