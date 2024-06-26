import { Route, useRouteMatch } from "react-router-dom"
import VisualProgrammingManagement from "./management/VisualProgrammingManagement";

const VisualProgramminAdminRouter: React.FC<{}> = () => {
    const match = useRouteMatch();

    return <>
        <Route exact path={`${match.path}/management`}>
            <VisualProgrammingManagement></VisualProgrammingManagement>
        </Route>
    </>
};

export default VisualProgramminAdminRouter;
