import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { videoRecordPlayClient } from "./client/VideoCourseClient";
import { Accordion, AccordionContent, AccordionTitle, Button, Dimmer, Grid, Header, Icon, Loader, Segment } from "semantic-ui-react";
import { CourseNameQueryResponse, VideoCourseDirectoryEntry } from "./client/types";
import { useDocumentTitle } from "../../common/Utils";
const VideoCourseDirectoryDetail: React.FC<{}> = () => {
  const { courseid } = useParams<{ courseid: string }>();
  const [data, setData] = useState<VideoCourseDirectoryEntry | null>(null);
  const [courseTitles, setCourseTitles] = useState<Map<number, CourseNameQueryResponse[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);
  useDocumentTitle(`录播课程目录`)
  useEffect(() => {
    if (!loaded) {
      (async () => {
        try {
          setLoading(true);
          const data = await videoRecordPlayClient.getVideoCourseDirectory(Number(courseid))
          setData(data)
          setLoaded(true);
        } catch { } finally {
          setLoading(false);
        }
      })()
    }
  }, [courseid, loaded])
  const handleAccordionClick = async (ids: number[], index: number) => {
    if (!activeIndex.has(index)) {
      const set = new Set(activeIndex);
      set.add(index);
      setActiveIndex(set)
    } else {
      const set = new Set(activeIndex);
      set.delete(index);
      setActiveIndex(set)
    }
    if (!courseTitles.get(index)) {
      try {
        setLoading(true)
        const courses = await videoRecordPlayClient.batchQueryCourseNames(ids)
        const map = new Map(courseTitles)
        map.set(index, courses)
        setCourseTitles(map)
      } catch { } finally {
        setLoading(false);
      }
    }
  }
  return (
    <>
      <Header as="h1">课程目录</Header>
      <Button onClick={() => window.location.href = '/video_course/video_course_directory'} primary>返回课程选择</Button>
      {data !== null && <Segment stacked>
        <Header as="h2">{data.title}</Header>
        {loading && <Dimmer page active><Loader></Loader></Dimmer>}
        <Grid columns={1} style={{ display: 'flex', justifyContent: "center", alignItem: "center" }}>
          {data.schema.map((item, index) => <Grid.Column key={item.title}>
            <Accordion styled style={{ width: "100%" }}>
              <AccordionTitle
                active={activeIndex.has(index)}
                index={index}
                onClick={() => handleAccordionClick(item.courses, index)}
              >
                <Icon name='dropdown' />
                {item.title}
              </AccordionTitle>
              {courseTitles && courseTitles.get(index) && <AccordionContent active={activeIndex.has(index)}>
                {courseTitles.get(index)?.map((item) => <Segment>
                  <p style={{ marginLeft: "2rem", fontSize: '1.5rem', fontWeight: 'bold' }}>第{item.id}课. <span style={{ fontSize: "1rem" }}>{item.title}</span></p>
                </Segment>)}
              </AccordionContent>}
            </Accordion>
          </Grid.Column>)}
        </Grid>
      </Segment >}
    </>
  )
}
export default VideoCourseDirectoryDetail

