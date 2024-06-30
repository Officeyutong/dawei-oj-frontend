import { Route, Switch, useRouteMatch } from "react-router-dom"
import VisualProgrammingMainPage from "./VisualProgrammingMainPage";
import VisualProgrammingHomeworkList from "./VisualProgrammingHomeworkList";
import VisualProgrammingSubmit from "./VisualProgrammingSubmit";
import VisualProgrammingManual from "./VisualProgrammingManual";

const VisualProgrammingRouter: React.FC<React.PropsWithChildren<{}>> = () => {
    const match = useRouteMatch();

    return <Switch>
        <Route exact path={`${match.path}/main`}>
            <VisualProgrammingMainPage></VisualProgrammingMainPage>
        </Route>
        <Route exact path={`${match.path}/homework_list`}>
            <VisualProgrammingHomeworkList></VisualProgrammingHomeworkList>
        </Route>
        <Route exact path={`${match.path}/submit/:id`}>
            <VisualProgrammingSubmit></VisualProgrammingSubmit>
        </Route>
        <Route exact path={`${match.path}/manual`}>
            <VisualProgrammingManual></VisualProgrammingManual>
        </Route>
    </Switch>
}
export default VisualProgrammingRouter;
