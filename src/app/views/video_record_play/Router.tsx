import React from "react";
// import { Route } from "react-router-dom";
// import GeneralDimmedLoader from "../utils/GeneralDimmedLoader";
// const VirtualContestCreate = lazy(() => import("./VirtualContestCreate"));
// const VirtualContestList = lazy(() => import("./VirtualContestList"));

const VideoRecordPlayRouter: React.FC<React.PropsWithChildren<{}>> = () => {
    // const match = useRouteMatch();
    return <>
        {/* <Route exact path={`${match.path}/create/:id`}>
            <Suspense fallback={<GeneralDimmedLoader />}>
                <VirtualContestCreate></VirtualContestCreate>
            </Suspense>
        </Route>
        <Route exact path={`${match.path}/list`}>
            <Suspense fallback={<GeneralDimmedLoader />}>
                <VirtualContestList></VirtualContestList>
            </Suspense>
        </Route> */}
    </>
};

export default VideoRecordPlayRouter;
