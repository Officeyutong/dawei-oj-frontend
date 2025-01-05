import { useEffect, useState } from "react";
import { Dimmer, Grid, Header, Loader, Segment } from "semantic-ui-react";
import { VideoCourseDirectoryEntryWithoutSchemaWithPermission } from "./client/types";
import { videoRecordPlayClient } from "./client/VideoCourseClient";

const VideoCourseDirectory: React.FC<{}> = () => {
    const [data, setData] = useState<VideoCourseDirectoryEntryWithoutSchemaWithPermission[]>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
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
            {loading && <Dimmer page active><Loader></Loader></Dimmer>}
            <Grid columns={3}>
                {data.map(item => <Grid.Column key={item.id}>
                    <Segment style={{ cursor: "pointer" }}>{item.title}</Segment>
                </Grid.Column>)}
            </Grid>
        </Segment>
    </>
};

export default VideoCourseDirectory;
