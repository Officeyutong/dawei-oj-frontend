import { Route, Switch, useRouteMatch } from "react-router-dom"
import { lazy, Suspense } from "react";
import GeneralDimmedLoader from "../utils/GeneralDimmedLoader";

const VisualProgrammingMainPage = lazy(() => import("./VisualProgrammingMainPage"));
const VisualProgrammingHomeworkList = lazy(() => import("./VisualProgrammingHomeworkList"));
const VisualProgrammingSubmit = lazy(() => import("./VisualProgrammingSubmit"));
const VisualProgrammingManual = lazy(() => import("./VisualProgrammingManual"));

const VisualProgrammingRouter: React.FC<React.PropsWithChildren<{}>> = () => {
    const match = useRouteMatch();

    return <Switch>
        <Route exact path={`${match.path}/main`} >
            <Suspense fallback={<GeneralDimmedLoader />}>
                <VisualProgrammingMainPage></VisualProgrammingMainPage>
            </Suspense>
        </Route>
        <Route exact path={`${match.path}/homework_list`}>
            <Suspense fallback={<GeneralDimmedLoader />}>
                <VisualProgrammingHomeworkList></VisualProgrammingHomeworkList>
            </Suspense>
        </Route>
        <Route exact path={`${match.path}/submit/:id`}>

            <Suspense fallback={<GeneralDimmedLoader />}>
                <VisualProgrammingSubmit></VisualProgrammingSubmit>
            </Suspense>
        </Route>
        <Route exact path={`${match.path}/manual`}>

            <Suspense fallback={<GeneralDimmedLoader />}>
                <VisualProgrammingManual></VisualProgrammingManual>
            </Suspense>
        </Route>
    </Switch>
}
export default VisualProgrammingRouter;
