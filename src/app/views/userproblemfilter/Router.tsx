import React, { lazy, Suspense } from "react";
import { useRouteMatch } from "react-router";
import { Route } from "react-router-dom";
import GeneralDimmedLoader from "../utils/GeneralDimmedLoader";

const UserProblemFilter = lazy(() => import("./UserProblemFilter"));
const UserProblemFilterRouter: React.FC<React.PropsWithChildren<{}>> = () => {
    const match = useRouteMatch();
    return <>
        <Route exact path={`${match.path}/list`}>
            <Suspense fallback={<GeneralDimmedLoader />}>
                <UserProblemFilter></UserProblemFilter>
            </Suspense>
        </Route>
    </>
};

export default UserProblemFilterRouter;
