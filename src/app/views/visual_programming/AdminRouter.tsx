import { lazy, Suspense } from "react";
import { Route, useRouteMatch } from "react-router-dom"
import GeneralDimmedLoader from "../utils/GeneralDimmedLoader";
const VisualProgrammingManagement = lazy(() => import("./management/VisualProgrammingManagement"));
const VisualProgramminAdminRouter: React.FC<{}> = () => {
    const match = useRouteMatch();

    return <>
        <Route exact path={`${match.path}/management`}>
            <Suspense fallback={<GeneralDimmedLoader></GeneralDimmedLoader>}>
                <VisualProgrammingManagement></VisualProgrammingManagement>
            </Suspense>
        </Route>
    </>
};

export default VisualProgramminAdminRouter;
