import { Button, Grid, Header, Segment } from "semantic-ui-react";
import { useDocumentTitle } from "../../common/Utils";
import MainBackground from "./assets/background.png";
import { CSSProperties } from "react";

const MainMenuButtonStyle: CSSProperties = {
    color: "white",
    fontSize: "xx-large",
    backgroundColor: "#7ea2c7",
    paddingTop: "15px",
    paddingBottom: "15px",
    paddingLeft: "30px",
    paddingRight: "30px",
    marginTop: "15px",
    marginBottom: "15px"
};

const VisualProgrammingMainPage: React.FC<{}> = () => {
    useDocumentTitle("图形化课程入口");
    return <Segment style={{ backgroundSize: "100% 100%", backgroundImage: `url(${MainBackground})` }}>
        <Grid columns={1} centered>
            <Grid.Column style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "80px", maxWidth: "600px" }}>
                <Header as="h1" style={{ color: "#de5f50", fontSize: "xxx-large" }}>大卫信奥图形化课程入口</Header>
                <div style={{ maxWidth: "500px" }}>
                    <Button fluid style={MainMenuButtonStyle}>👉点这里看录播课和直播课👈</Button>
                    <Button fluid style={MainMenuButtonStyle}>👉点这里做作业👈</Button>
                    <Button fluid style={MainMenuButtonStyle}>👉图形化课程学习方法👈</Button>
                </div>
                <span style={{ color: "#7ea2c7", marginBottom: "200px", fontSize: "large" }}>有任何不清楚的，可以联系班主任老师</span>
            </Grid.Column>
        </Grid>
    </Segment>
};

export default VisualProgrammingMainPage;
