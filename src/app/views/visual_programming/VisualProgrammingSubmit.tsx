import { useParams } from "react-router-dom";
import { useDocumentTitle } from "../../common/Utils";
import { Grid, Header, Segment } from "semantic-ui-react";
import { useEffect } from "react";

const VisualProgrammingSubmit: React.FC<{}> = () => {
    const { id } = useParams<{ id: string }>();
    useDocumentTitle("可视化作业提交");
    useEffect(() => {
        const oldColor = document.body.style.backgroundColor;
        document.body.style.backgroundColor = "#d6eefa";
        return () => { document.body.style.backgroundColor = oldColor };
    }, []);
    return <div style={{ display: "flex", justifyContent: "space-around",width:"100%" }}>
        <Grid columns={2}>
            <Grid.Column>
                <Header as="h1" style={{ color: "#3e6143" }}>作业目录</Header>
            </Grid.Column>
            <Grid.Column>

            </Grid.Column>
        </Grid>
    </div>

};

export default VisualProgrammingSubmit;
