import { Route, useRouteMatch } from "react-router-dom"
import MonitoredUserList from "./MonitoredUserList";

const MonitoredUserRouter: React.FC<React.PropsWithChildren<{}>> = () => {
    const match = useRouteMatch();
    return <>
        <Route exact path={`${match.path}/list`}>
            <MonitoredUserList></MonitoredUserList>
        </Route>
    </>
}

export default MonitoredUserRouter;
