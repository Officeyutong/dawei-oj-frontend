import { Button, Grid, Header, Image, Segment } from "semantic-ui-react";
import { useDocumentTitle } from "../../common/Utils";
import MainBackground from "./assets/background.png";
import { CSSProperties } from "react";
import Pussy from "./assets/cat.png"
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
    borderRadius:"10px"
};

const VisualProgrammingMainPage: React.FC<{}> = () => {
    useDocumentTitle("图形化课程入口");
    return <Segment style={{ backgroundSize: "100% 100%", backgroundImage: `url(${MainBackground})` }}>
        <Grid columns={1} centered>
            <Grid.Column style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "80px", maxWidth: "600px" }}>
                <Header as="h1" style={{ color: "#de5f50", fontSize: "xxx-large" }}>大卫信奥图形化课程入口</Header>
                <div style={{ maxWidth: "500px" }}>
                    <Button fluid style={{...MainMenuButtonStyle,marginTop:"10px"}}>👉点这里看录播课和直播课👈</Button>
                    <Button fluid style={MainMenuButtonStyle}>👉点这里做作业👈</Button>
                    <Button fluid style={MainMenuButtonStyle}>👉图形化课程学习方法👈</Button>
                </div>
                <span style={{ marginTop:"10px",color: "#7ea2c7", marginBottom: "300px", fontSize: "large" }}>有任何不清楚的，可以联系班主任老师</span>

            </Grid.Column>
        </Grid>
        <Image src={Pussy} style={{
            position: "absolute",
            right: "0",
            bottom: "0",
            transform: "scale(0.7)"
        }}></Image>
    </Segment>
};

export default VisualProgrammingMainPage;
