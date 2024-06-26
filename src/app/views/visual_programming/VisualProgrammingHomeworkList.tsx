import { Header, Image, Segment } from "semantic-ui-react"
import Logo from "./assets/logo.png"
import { useDocumentTitle } from "../../common/Utils";
const VisualProgrammingHomeworkList: React.FC<{}> = () => {
    useDocumentTitle("图形化课程作业列表");
    return <Segment style={{ backgroundColor: "#d6eefa" }}>
        <Image src={Logo} style={{ position: "absolute" }}></Image>
        <div style={{ display: "flex", justifyContent: "space-around", flexDirection: "column", alignItems: "center" }}>
            <Header as="h1" style={{ color: "#de5f50", fontSize: "xxx-large", marginBottom: "5px" }}>图形化课程作业</Header>
            <Segment style={{ width: "80%", marginTop: "5px" }}>
                sssssssss
            </Segment>
        </div>
    </Segment>
}

export default VisualProgrammingHomeworkList;
