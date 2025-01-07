import { useEffect, useState } from "react";
import { Button, Container, Dimmer, Grid, Header, Icon, Loader, Segment } from "semantic-ui-react";
import { VideoCourseDirectoryEntryWithoutSchemaWithPermission } from "./client/types";
import { videoRecordPlayClient } from "./client/VideoCourseClient";
import { useDocumentTitle } from "../../common/Utils";
import { Link } from "react-router-dom";
import { PUBLIC_URL } from "../../App";

const VideoCourseDirectory: React.FC<{}> = () => {
    const [data, setData] = useState<VideoCourseDirectoryEntryWithoutSchemaWithPermission[]>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [isHover, setIsHover] = useState<number | null>(null)
    useDocumentTitle('录播课程')
    useEffect(() => {
        if (!loaded) (async () => {
            try {
                setLoading(true);
                setData(await videoRecordPlayClient.getAllVideoCourseDirectories(true));
                setLoaded(true);
            } catch { } finally {
                setLoading(false);
            }
        })();
    }, [loaded]);
    return <>
        <Header as="h1">录播</Header>
        <Segment stacked>
            <Button primary style={{ margin: '1rem' }}>返回上次播放</Button>
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
