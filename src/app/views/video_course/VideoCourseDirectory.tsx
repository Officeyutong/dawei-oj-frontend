import { useEffect, useState } from "react";
import { Button, Card, Container, Dimmer, Grid, Header, Loader, Segment } from "semantic-ui-react";
import { VideoCourseDirectoryEntryWithoutSchemaWithPermission, VideoPlayRecordEntry } from "./client/types";
import { videoRecordPlayClient } from "./client/VideoCourseClient";
import { useDocumentTitle } from "../../common/Utils";
import { Link } from "react-router-dom";
import { PUBLIC_URL } from "../../App";
import { StateType } from "../../states/Manager";
import { useSelector } from "react-redux";
import NoneImage from "../../assets/noneimage.png"
const VideoCourseDirectory: React.FC<{}> = () => {
    const [data, setData] = useState<VideoCourseDirectoryEntryWithoutSchemaWithPermission[]>([]);
    const [playRecord, setPlayRecord] = useState<VideoPlayRecordEntry[] | null>(null)
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const uid = useSelector((s: StateType) => s.userState.userData.uid)
    useDocumentTitle('录播课程')
    useEffect(() => {
        if (!loaded) (async () => {
            try {
                setLoading(true);
                setPlayRecord(await videoRecordPlayClient.getPlayRecord(uid, 1))
                setData(await videoRecordPlayClient.getAllVideoCourseDirectories(true));
                setLoaded(true);
            } catch { } finally {
                setLoading(false);
            }
        })();
    }, [loaded, uid]);
    return <>
        <Header as="h1">录播</Header>
        <Segment style={{ backgroundColor: "#eef2f7", border: "none", boxShadow: "none" }}>
            <Segment style={{ boxShadow: "none" }}>{playRecord && <Button primary disabled={playRecord.length === 0} style={{ margin: '0.5rem' }} as={Link} to={playRecord.length !== 0 ? `${PUBLIC_URL}/video_course/video_display/${playRecord[0].video_course_directory.id}/${playRecord[0].video_course.id}/${playRecord[0].node_id}` : ''}>返回上次播放</Button>}</Segment>
            {loading && <Dimmer page active><Loader></Loader></Dimmer>}
            <Grid columns={3}>
                {data.map(item => <Grid.Column key={item.id}>
                    <Container as={Link} to={item.has_permission ? `${PUBLIC_URL}/video_course/video_course_directory_detail/${item.id}` : null} disabled={!item.has_permission}>
                        <Card
                            image={NoneImage}
                            header={item.title}
                            description='大卫信奥'
                        />
                    </Container>
                </Grid.Column>)}
            </Grid>
        </Segment >
    </>
};

export default VideoCourseDirectory;
