import { Button, Dimmer, Divider, Grid, Header, Image, Loader, Segment } from "semantic-ui-react"
import Logo from "./assets/logo.png"
import { useDocumentTitle } from "../../common/Utils";
import { Fragment, useEffect, useState } from "react";
import { HomeworkDisplayListEntry } from "./client/types";
import visualProgrammingClient from "./client/VisualProgrammingClient";
import { Markdown } from "../../common/Markdown";
import { Link } from "react-router-dom";
import { PUBLIC_URL } from "../../App";
import _ from "lodash";

const VisualProgrammingHomeworkList: React.FC<{}> = () => {
    useDocumentTitle("图形化课程作业列表");

    const [pageCount, setPageCount] = useState(0);
    const [page, setPage] = useState(1);
    const [data, setData] = useState<HomeworkDisplayListEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const loadPage = async (page: number) => {
        try {
            setLoading(true);
            const { data, pageCount } = await visualProgrammingClient.getDisplayListPage(page);
            setPageCount(pageCount);
            setPage(page);
            setData(data);
            setLoaded(true);
        } catch { } finally { setLoading(false); }
    };
    useEffect(() => {
        if (!loaded) loadPage(1);
    }, [loaded]);
    return <Segment style={{ backgroundColor: "#d6eefa" }}>
        <Image src={Logo} style={{ position: "absolute", userSelect: 'none' }}></Image>
        <div style={{ display: "flex", justifyContent: "space-around", flexDirection: "column", alignItems: "center" }}>
            <Header as="h1" style={{ color: "#de5f50", fontSize: "xxx-large", marginBottom: "5px" }}>图形化课程作业</Header>
            <Segment style={{ width: "60%", marginTop: "5px" }}>
                {!loaded && <div style={{ height: "600px" }}></div>}
                {loading && <Dimmer active><Loader active></Loader></Dimmer>}
                {loaded && <>
                    {data.map(item => <Fragment key={item.id}>
                        <Header as="h2">{item.name}</Header>
                        <Grid columns={item.image_url === "" ? 1 : 2}>
                            {item.image_url !== "" && <Grid.Column style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Image style={{ borderRadius: "5px" }} src={item.image_url}></Image>
                            </Grid.Column>}
                            <Grid.Column>
                                <Markdown markdown={item.description}></Markdown>
                                <div style={{ display: "flex", flexDirection: "row", marginTop: "10px", justifyContent: "flex-end" }}>
                                    {item.course_url !== "" && <Button as="a" href={item.course_url} target="_blank" rel="noreferrer" style={{ backgroundColor: "#659a14", color: "white", borderRadius: "15px", marginRight: "20px" }}>看课程</Button>}
                                    <Button as={Link} to={`${PUBLIC_URL}/visual_programming/submit/${item.id}`} style={{ backgroundColor: "#de5f50", color: "white", borderRadius: "15px" }}>去创作</Button>
                                </div>
                            </Grid.Column>
                        </Grid>
                        <Divider></Divider>
                    </Fragment>)}
                </>}

                <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
                    <Button circular size="tiny" style={{ backgroundColor: "#57baec", color: "white", fontSize: "medium" }} icon="angle left" onClick={page !== 1 ? () => loadPage(page - 1) : undefined}></Button>
                    {_.range(1, pageCount + 1).map(item => <span style={{ color: page === item ? "#57baec" : "#a6aaac", paddingLeft: "9px", paddingRight: "9px", paddingTop: "10px", fontWeight: "bold", fontSize: "large", cursor: item !== page ? "pointer" : undefined }} key={item} onClick={item !== page ? () => loadPage(item) : undefined}>
                        {item}
                    </span>)}
                    <Button circular size="tiny" style={{ backgroundColor: "#57baec", color: "white", marginLeft: "3px", fontSize: "medium" }} icon="angle right" onClick={page !== pageCount ? () => loadPage(page + 1) : undefined}></Button>
                </div>
            </Segment>
        </div>
    </Segment>
}

export default VisualProgrammingHomeworkList;
