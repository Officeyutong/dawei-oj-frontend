import React, { lazy, Suspense } from "react";
import { useRouteMatch } from "react-router";
import { Route } from "react-router-dom";
import GeneralDimmedLoader from "../utils/GeneralDimmedLoader";

const TeamList = lazy(() => import("./TeamList"));
const TeamShow = lazy(() => import("./show/TeamShow"));
const TeamEdit = lazy(() => import("./edit/TeamEdit"));

const TeamRouter: React.FC<React.PropsWithChildren<{}>> = () => {
    const match = useRouteMatch();
    return <>
        <Route exact path={`${match.path}/team`}>
            <Suspense fallback={<GeneralDimmedLoader />}>
                <TeamList></TeamList>
            </Suspense>
        </Route>
        <Route exact path={`${match.path}/team/:team`}>
            <Suspense fallback={<GeneralDimmedLoader />}>
                <TeamShow></TeamShow>
            </Suspense>
        </Route>
        <Route exact path={`${match.path}/edit_team/:team`}>
            <Suspense fallback={<GeneralDimmedLoader />}>
                <TeamEdit></TeamEdit>
            </Suspense>
        </Route>
    </>
};

export default TeamRouter;
