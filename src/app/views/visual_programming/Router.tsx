import { Link, Route, Switch, useRouteMatch } from "react-router-dom"
import { lazy, Suspense, useEffect, useState } from "react";
import GeneralDimmedLoader from "../utils/GeneralDimmedLoader";
import Logo from "./assets/logo.png"
import { Dimmer, Header, Image, Loader, Menu, MenuItem, Popup } from "semantic-ui-react";
import { PUBLIC_URL } from "../../App";
import { useBackgroundColor } from "../../common/Utils";
import { useSelector } from "react-redux";
import { StateType } from "../../states/Manager";
import userClient from "../user/client/UserClient";
import { showSuccessPopup } from "../../dialogs/Utils";

const VisualProgrammingMainPage = lazy(() => import("./VisualProgrammingMainPage"));
const VisualProgrammingHomeworkList = lazy(() => import("./VisualProgrammingHomeworkList"));
const VisualProgrammingSubmit = lazy(() => import("./VisualProgrammingSubmit"));
const VisualProgrammingManual = lazy(() => import("./VisualProgrammingManual"));
const VisualProgrammingLogin = lazy(() => import("./user/VisualProgrammingLogin"));
const VisualProgrammingRegister = lazy(() => import("./user/VisualProgrammingRegister"));
const VisualProgrammingSMSLogin = lazy(() => import("./user/VisualProgrammingSMSLogin"));
const VisualProgrammingProfileEdit = lazy(() => import("./user/VisualProgrammingProfileEdit"));
const VisualProgrammingResetPassword = lazy(() => import("./user/VisualProgrammingResetPassword"));
const VisualProgrammingRouter: React.FC<React.PropsWithChildren<{}>> = () => {
    const { uid, username, realName } = useSelector((s: StateType) => s.userState.userData);
    const { login } = useSelector((s: StateType) => s.userState);
    const { initialRequestDone } = useSelector((s: StateType) => s.userState);
    const [profileImage, setProfileImage] = useState<String>('');
    const [loading, setLoading] = useState<boolean>(false)
    const match = useRouteMatch();
    useBackgroundColor('#d6eefa')
    const handleLogout = async () => {
        try {
            setLoading(true);
            await userClient.logout()
            showSuccessPopup("登出完成，将要跳转");
            window.location.href = '/visual_programming/main'
        } catch { } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        if (initialRequestDone && uid) {
            setProfileImage(String(uid))
        }
    }, [initialRequestDone, realName, uid])
    return (<>
        {loading && <Dimmer active>
            <Loader></Loader>
        </Dimmer>}
        <div style={{ position: 'absolute', width: '100%', height: '10%', zIndex: '999', userSelect: 'none', top: '0' }}>
            <Image src={Logo} as={Link} to={`${PUBLIC_URL}/visual_programming/main`} style={{ position: "absolute", marginTop: '1%', marginLeft: '1%' }}></Image>
            {login && <Popup
                on='hover'
                pinned
                hoverable
                position="bottom center"
                style={{ padding: "0" }}
                trigger={
                    <Header as='h2' style={{ position: 'absolute', marginTop: '1%', marginRight: '4%', right: '0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Image circular src={`/api/user/profile_image/${profileImage}`} />
                        <Header as='h5' style={{ margin: '0' }}>{username}</Header>
                        {realName && <Header as='h5' style={{ margin: '0' }}>{realName}</Header>}
                    </Header>}>
                <Menu vertical style={{ width: '10rem', padding: "0", margin: "0" }}>
                    <MenuItem as={Link} to={`${PUBLIC_URL}/visual_programming/profile_edit`}>
                        个人设置
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>退出登录</MenuItem>
                </Menu>
            </Popup>}
        </div >
        <Switch>
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
            <Route exact path={`${match.path}/login`}>
                <Suspense fallback={<GeneralDimmedLoader />}>
                    <VisualProgrammingLogin></VisualProgrammingLogin>
                </Suspense>
            </Route>
            <Route exact path={`${match.path}/register`}>
                <Suspense fallback={<GeneralDimmedLoader />}>
                    <VisualProgrammingRegister></VisualProgrammingRegister>
                </Suspense>
            </Route>
            <Route exact path={`${match.path}/smslogin`}>
                <Suspense fallback={<GeneralDimmedLoader />}>
                    <VisualProgrammingSMSLogin></VisualProgrammingSMSLogin>
                </Suspense>
            </Route>
            <Route exact path={`${match.path}/profile_edit`}>
                <Suspense fallback={<GeneralDimmedLoader />}>
                    <VisualProgrammingProfileEdit></VisualProgrammingProfileEdit>
                </Suspense>
            </Route>
            <Route exact path={`${match.path}/phone_reset_password`}>
                <Suspense fallback={<GeneralDimmedLoader />}>
                    <VisualProgrammingResetPassword />
                </Suspense>
            </Route>
        </Switch>
    </>
    )
}
export default VisualProgrammingRouter;
