import { useEffect, useState } from "react";
import { UserBasicInfo } from "../client/types";
import onlineVMClient from "../client/OnlineVMClient";
import { Button, Dimmer, Grid, Header, Loader } from "semantic-ui-react";
import RechargeModal from "./RechargeModal";
import { useHistory } from "react-router-dom";
import { PUBLIC_URL } from "../../../App";
import { useDocumentTitle } from "../../../common/Utils";

const UserMainPage: React.FC<{}> = () => {
    const [basicInfo, setBasicInfo] = useState<UserBasicInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [showRechargeModal, setShowRechargeModal] = useState(false);
    const history = useHistory();
    useDocumentTitle("个人基本信息")
    useEffect(() => {
        if (!loaded) {
            (async () => {
                try {
                    setLoading(true);
                    const [a] = await Promise.all([onlineVMClient.getUserBasicInfo()]);
                    setBasicInfo(a);
                    setLoaded(true);
                } catch { } finally {
                    setLoading(false);
                }
            })();
        }
    }, [loaded]);
    return <>
        {showRechargeModal && <RechargeModal
            allowAmount={basicInfo!.allowRechargeAmount}
            onClose={flag => {
                if (flag) history.push(`${PUBLIC_URL}/onlinevm/recharge_order_list`)
                setShowRechargeModal(false);
            }}
        ></RechargeModal>}
        <Header as="h2">基本信息</Header>
        {loading && <Dimmer active><Loader></Loader></Dimmer>}
        {loaded && basicInfo && <Grid columns={2} divided>
            <Grid.Row>
                <Grid.Column>
                    当前余额： {basicInfo.remainedAmount}
                    <Button color="green" onClick={() => setShowRechargeModal(true)}>充值 </Button>
                </Grid.Column>
            </Grid.Row>
        </Grid>}
    </>;
};

export default UserMainPage;
