import React from "react";

import { Route, BrowserRouter, useRouteMatch, Switch } from "react-router-dom";

import BaseView from "./views/BaseView";
import AdminView from "./views/admin/AdminView";
import HomePage from "./views/homepage/HomePage";
import UserRouter from "./views/user/Router";
import ProblemRouter from "./views/problem/Router";
import ProblemSolutionRouter from "./views/problemsolution/Router";
import PermissionPackRouter from "./views/permissionpack/Router";
import ContestRouter from "./views/contest/Router";
import ProblemsetRouter from "./views/problemset/Router";
import VirtualContestRouter from "./views/virtualcontest/Router";
import { useSelector } from "react-redux";
import { StateType } from "./states/Manager";
import SubmissionRouter from "./views/submission/Router";
import TeamRouter from "./views/team/Router";
import ProblemtodoRouter from "./views/problemtodo/Router";
import OnlineIDERouter from "./views/ide/Router";
import DiscussionRouter from "./views/discussion/Router";
import ImportFromSYZOJ from "./views/ImportFromSYZOJ";
import MiscRouter from "./views/misc/MiscRouter";
import ChallengeRouter from "./views/challenge/Router";
import ImageStoreRouter from "./views/imagestore/Router";
import BlogRouter from "./views/blog/Router";
import ErrorAndSuccess from "./views/ErrorAndSuccess";
import CardRouter from "./views/card/Router";
import { useBaseViewDisplay } from "./states/StateUtils";
import PreliminaryRouter from "./views/preliminary/Router";
import WikiRouter from "./views/wiki/Router";
import UserProblemFilterRouter from "./views/userproblemfilter/Router";
import MonitoredUserRouter from "./views/monitoreduser/Router";
import HomePageNew from "./views/homepage/new/HomePageNew";
import { PUBLIC_URL } from "./App";
import BaseViewNew from "./views/BaseViewNew";
import WechatStatistics from "./views/wechat_statistics/WechatStatistics";

const SubRoutes = () => {
    const [displayBaseView,] = useBaseViewDisplay();
    const match = useRouteMatch();
    // console.log("match = ", match);
    const routers = <>
        <ProblemRouter></ProblemRouter>
        <UserRouter></UserRouter>
        <ContestRouter></ContestRouter>
        <SubmissionRouter></SubmissionRouter>
        <TeamRouter></TeamRouter>
        <OnlineIDERouter></OnlineIDERouter>
        <DiscussionRouter></DiscussionRouter>
        <MiscRouter></MiscRouter>
        <Route exact path={`${match.path}/`}>
            <HomePageNew></HomePageNew>
        </Route>
        <Route exact path={`${match.path}/admin`}>
            <AdminView></AdminView>
        </Route>
        <Route exact path={`${match.path}/home-old`}>
            <HomePage></HomePage>
        </Route>
        <Route path={`${match.path}/problemsolution`}>
            <ProblemSolutionRouter></ProblemSolutionRouter>
        </Route>
        <Route path={`${match.path}/problemset`}>
            <ProblemsetRouter></ProblemsetRouter>
        </Route>
        <Route path={`${match.path}/problemtodo`}>
            <ProblemtodoRouter></ProblemtodoRouter>
        </Route>
        <Route path={`${match.path}/virtualcontest`}>
            <VirtualContestRouter></VirtualContestRouter>
        </Route>
        <Route path={`${match.path}/permissionpack`}>
            <PermissionPackRouter></PermissionPackRouter>
        </Route>
        <Route path={`${match.path}/import_from_syzoj`}>
            <ImportFromSYZOJ></ImportFromSYZOJ>
        </Route>
        <Route path={`${match.path}/challenge`}>
            <ChallengeRouter></ChallengeRouter>
        </Route>
        <Route path={`${match.path}/imagestore`}>
            <ImageStoreRouter></ImageStoreRouter>
        </Route>
        <Route path={`${match.path}/blog`}>
            <BlogRouter></BlogRouter>
        </Route>
        <Route path={`${match.path}/card`}>
            <CardRouter></CardRouter>
        </Route>
        <Route path={`${match.path}/preliminary`}>
            <PreliminaryRouter></PreliminaryRouter>
        </Route>
        <Route path={`${match.path}/wiki`}>
            <WikiRouter></WikiRouter>
        </Route>
        <Route path={`${match.path}/userproblemfilter`}>
            <UserProblemFilterRouter></UserProblemFilterRouter>
        </Route>
        <Route path={`${match.path}/monitoreduser`}>
            <MonitoredUserRouter></MonitoredUserRouter>
        </Route>
        <Route path={`${match.path}/error`}>
            <ErrorAndSuccess error={true}></ErrorAndSuccess>
        </Route>
        <Route path={`${match.path}/success`}>
            <ErrorAndSuccess error={false}></ErrorAndSuccess>
        </Route>
    </>
    const { baseContainerMaxWidth, baseContainerWidth } = useSelector((s: StateType) => s);

    const innerWithContainer = <div style={{ marginTop: "50px", marginBottom: "70px", display: "flex", justifyContent: "center" }}>
        <div style={{ minWidth: "70%", width: baseContainerWidth, maxWidth: baseContainerMaxWidth, marginLeft: "auto", marginRight: "auto" }}>{routers}</div>
    </div>
    return (() => {
        if (displayBaseView === "new") return <BaseViewNew>{innerWithContainer}</BaseViewNew>
        else if (displayBaseView === "old") return <BaseView>{innerWithContainer}</BaseView>;
        else return innerWithContainer;
    })();
};
const MyRouter: React.FC<React.PropsWithChildren<{}>> = () => {
    const clientLoaded = useSelector((s: StateType) => s.generalClient !== null && s.unwrapClient !== null && s.unwrapExtraClient !== null);
    return <BrowserRouter>
        {clientLoaded && <Route path={`${PUBLIC_URL}`}>
            <Switch>
                <Route path={`${PUBLIC_URL}/wechat_statistics_view`}>
                    <WechatStatistics></WechatStatistics>
                </Route>
                <SubRoutes></SubRoutes>
            </Switch>

        </Route>}
    </BrowserRouter>;
}
export default MyRouter;
