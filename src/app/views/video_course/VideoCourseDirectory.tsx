import { useEffect, useState } from "react";
import { Button, Container, Dimmer, Grid, Header, Icon, Loader, Segment } from "semantic-ui-react";
import { VideoCourseDirectoryEntryWithoutSchemaWithPermission, VideoPlayRecordEntry } from "./client/types";
import { videoRecordPlayClient } from "./client/VideoCourseClient";
import { useDocumentTitle } from "../../common/Utils";
import { Link } from "react-router-dom";
import { PUBLIC_URL } from "../../App";
import { StateType } from "../../states/Manager";
import { useSelector } from "react-redux";

const VideoCourseDirectory: React.FC<{}> = () => {
    const [data, setData] = useState<VideoCourseDirectoryEntryWithoutSchemaWithPermission[]>([]);
    const [playRecord, setPlayRecord] = useState<VideoPlayRecordEntry[] | null>(null)
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [isHover, setIsHover] = useState<number | null>(null)
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
        <Segment stacked>
            {playRecord && <Button primary disabled={playRecord.length === 0} style={{ margin: '1rem' }} as={Link} to={playRecord.length !== 0 ? `${PUBLIC_URL}/video_course/video_display/${playRecord[0].video_course_directory.id}/${playRecord[0].video_course.id}/${playRecord[0].node_id}` : ''}>返回上次播放</Button>}
            {loading && <Dimmer page active><Loader></Loader></Dimmer>}
            <Grid columns={3}>
                {data.map(item => <Grid.Column key={item.id}>
                    <Container as={Link} to={`${PUBLIC_URL}/video_course/video_course_directory_detail/${item.id}`} disabled={!item.has_permission}>
                        <Segment style={{ fontSize: "1.5em", backgroundColor: (isHover === item.id) && item.has_permission !== false ? '#E0E0E0' : 'white', cursor: item.has_permission ? 'pointer' : 'default', width: '100%', height: "100%" }}
                            disabled={!item.has_permission}
                            onMouseEnter={() => setIsHover(item.id)}
                            onMouseLeave={() => setIsHover(null)}>
                            {item.title}
                            <Icon style={{ marginLeft: '1rem' }} color={item.has_permission === true ? 'green' : 'red'} name={item.has_permission === true ? 'lock open' : 'lock'}>
                            </Icon>
                        </Segment>
                    </Container>
                </Grid.Column>)}
            </Grid>
        </Segment >
    </>
};

export default VideoCourseDirectory;
