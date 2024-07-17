import { Button, Dimmer, Grid, Header, Image, Loader, Popup, Segment } from "semantic-ui-react";
import { useDocumentTitle } from "../../common/Utils";
import MainBackground from "./assets/background.png";
import { CSSProperties, useEffect, useState } from "react";
import Pussy from "./assets/cat.png"
import Logo from "./assets/logo.png"
import { Link } from "react-router-dom";
import { PUBLIC_URL } from "../../App";
import { VisualProgrammingConfig } from "./client/types";
import visualProgrammingClient from "./client/VisualProgrammingClient";
import { useSelector } from "react-redux";
import { StateType } from "../../states/Manager";
const MainMenuButtonStyle: CSSProperties = {
    color: "white",
    fontSize: "xx-large",
    backgroundColor: "#67aeda",
    paddingTop: "15px",
    paddingBottom: "15px",
    paddingLeft: "30px",
    paddingRight: "30px",
    marginTop: "28px",
    marginBottom: "28px",
    borderRadius: "10px"
};

const VisualProgrammingMainPage: React.FC<{}> = () => {
    useDocumentTitle("图形化课程入口");
    const [config, setConfig] = useState<VisualProgrammingConfig | null>(null);
    const [loading, setLoading] = useState(false);
    const { username, realName } = useSelector((s: StateType) => s.userState.userData);
    const isLogin = useSelector((s: StateType) => s.userState.login);
    useEffect(() => {
        if (config === null) (async () => {
            try {
                setLoading(true);
                setConfig(await visualProgrammingClient.getConfig());
            } catch { } finally { setLoading(false); }
        })();
    }, [config]);
    const doHomeworkButton = <Button as={isLogin ? Link : undefined} to={`${PUBLIC_URL}/visual_programming/homework_list`} fluid style={{ ...MainMenuButtonStyle, ...(isLogin ? {} : { opacity: "0.45" }) }}>👉点这里做作业👈</Button>;
    return <div style={{ display: "flex", justifyContent: "space-around" }}>
        <Segment style={{ backgroundSize: "100% 100%", backgroundImage: `url(${MainBackground})`, width: "80%" }}>
            {loading && <Dimmer active><Loader active></Loader></Dimmer>}
            <Image src={Logo} style={{ position: "absolute", userSelect: 'none' }}></Image>
            <Grid columns={1} centered>
                <Grid.Column style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "80px", maxWidth: "600px", width: "80%" }}>
                    <Header as="h1" style={{ color: "#de5f50", fontSize: "xxx-large" }}>大卫信奥图形化课程入口</Header>
                    <div style={{ maxWidth: "500px" }}>
                        <Button as="a" href={config?.generalConfigURL} target="_blank" rel="noreferrer" fluid style={{ ...MainMenuButtonStyle, marginTop: "10px" }}>👉点这里看录播课和直播课👈</Button>
                        {isLogin ? doHomeworkButton : <Popup trigger={doHomeworkButton} content="登录后才能做作业！" position="top center" on="hover"></Popup>}
                        <Button as={Link} to={`${PUBLIC_URL}/visual_programming/manual`} fluid style={MainMenuButtonStyle}>👉图形化课程学习方法👈</Button>
                        <div style={{ display: 'flex' }}>
                            {isLogin ? <div style={{ height: '70px', width: '100%' }}>
                                <p style={{ marginTop: "10px", color: "#7ea2c7", fontSize: "xx-large", marginBottom: "400px", textAlign: 'center' }}>欢迎回来，{realName || username}</p>
                            </div> : <>
                                <Button as={Link} to={`${PUBLIC_URL}/visual_programming/login`} fluid style={{ ...MainMenuButtonStyle, backgroundColor: "#eb9a81" }}>👉登录👈</Button>
                                <Button as={Link} to={`${PUBLIC_URL}/visual_programming/register`} fluid style={{ ...MainMenuButtonStyle, backgroundColor: "#eb9a81" }}>👉注册👈</Button>
                            </>}
                        </div>
                    </div>

                    <span style={{ marginTop: "10px", color: "#7ea2c7", fontSize: "large", marginBottom: "290px" }}>有任何不清楚的，可以联系班主任老师</span>
                </Grid.Column>
            </Grid>
            <Image src={Pussy} style={{
                position: "absolute",
                right: "0",
                bottom: "0",
                transform: "scale(0.7)"
            }}></Image>
        </Segment>
    </div>
};

export default VisualProgrammingMainPage;
