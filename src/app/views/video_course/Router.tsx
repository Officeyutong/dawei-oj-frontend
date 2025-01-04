import React, { lazy, Suspense } from "react";
import { Route, useRouteMatch } from "react-router-dom";
import GeneralDimmedLoader from "../utils/GeneralDimmedLoader";
const VideoCourseAdmin = lazy(() => import("./admin/VideoCoruseAdmin"));
const VideoCourseRouter: React.FC<React.PropsWithChildren<{}>> = () => {
    const match = useRouteMatch();
    return <>
        <Route exact path={`${match.path}/admin`}>
            <Suspense fallback={<GeneralDimmedLoader />}>
                <VideoCourseAdmin></VideoCourseAdmin>
            </Suspense>
        </Route>
    </>
};

export default VideoCourseRouter;
