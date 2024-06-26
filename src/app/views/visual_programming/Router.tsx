import { Route, useRouteMatch } from "react-router-dom"
import VisualProgrammingMainPage from "./VisualProgrammingMainPage";

const VisualProgrammingRouter: React.FC<React.PropsWithChildren<{}>> = () => {
    const match = useRouteMatch();

    return <>
        <Route exact path={`${match.path}/main`}>
            <VisualProgrammingMainPage></VisualProgrammingMainPage>
        </Route>
    </>
}
export default VisualProgrammingRouter;
