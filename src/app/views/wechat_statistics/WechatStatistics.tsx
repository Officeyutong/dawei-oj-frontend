import { Route, Switch, useRouteMatch } from "react-router-dom";
import WechatStatisticaLogin from "./WechatStatisticsLogin";
import WechatStatisticsDetails from "./WechatStatisticsDetails";
import { useSelector } from "react-redux";
import { StateType } from "../../states/Manager";

const WechatStatistics = () => {

    const match = useRouteMatch();
    const { displayRepoInFooter, appName, companyName } = useSelector((s: StateType) => s.userState.userData);
    return <div style={{ marginTop: "10vh" }}>
        <Switch>
            <Route exact path={`${match.path}/login`}>
                <WechatStatisticaLogin></WechatStatisticaLogin>
            </Route>
            <Route exact path={`${match.path}/details`}>
                <WechatStatisticsDetails></WechatStatisticsDetails>
            </Route>
        </Switch>
        <div style={{ marginTop: "60%", display: "flex", justifyContent: "center", color: "darkgrey" }}>
            {displayRepoInFooter ? <>
                {appName} powered by <a href="https://github.com/Officeyutong/HelloJudge2">HelloJudge2</a>
            </> : <>
                {appName} by {companyName}
            </>
            }
        </div>
    </div>
};

export default WechatStatistics;
