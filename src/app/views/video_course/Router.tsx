import React, { lazy, Suspense } from "react";
import { Route, useRouteMatch } from "react-router-dom";
import GeneralDimmedLoader from "../utils/GeneralDimmedLoader";
const VideoCourseAdmin = lazy(() => import("./admin/VideoCourseAdmin"));
const VideoCourseDirectory = lazy(() => import("./VideoCourseDirectory"));
const VideoCourseDirectoryDetail = lazy(() => import("./VideoCourseDirectoryDetail"));
const VideoDisplay = lazy(() => import("./VideoDispaly"));
const VideoCourseRouter: React.FC<React.PropsWithChildren<{}>> = () => {
    const match = useRouteMatch();
    return <>
        <Route exact path={`${match.path}/admin`}>
            <Suspense fallback={<GeneralDimmedLoader />}>
                <VideoCourseAdmin></VideoCourseAdmin>
            </Suspense>
        </Route>
        <Route exact path={`${match.path}/video_course_directory`}>
            <Suspense fallback={<GeneralDimmedLoader />}>
                <VideoCourseDirectory></VideoCourseDirectory>
            </Suspense>
        </Route>
        <Route exact path={`${match.path}/video_course_directory_detail/:courseid`}>
            <Suspense fallback={<GeneralDimmedLoader />}>
                <VideoCourseDirectoryDetail></VideoCourseDirectoryDetail>
            </Suspense>
        </Route>
        <Route exact path={`${match.path}/video_display/:coursedirectoryid/:courseid/:node`}>
            <Suspense fallback={<GeneralDimmedLoader />}>
                <VideoDisplay></VideoDisplay>
            </Suspense>
        </Route>
    </>
};

export default VideoCourseRouter;
