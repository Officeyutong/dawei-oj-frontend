import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { videoRecordPlayClient } from "./client/VideoCourseClient";
import { Accordion, AccordionContent, AccordionTitle, Button, Container, Dimmer, Grid, Header, Icon, Loader, Segment } from "semantic-ui-react";
import { CourseNameQueryResponse, VideoCourseDirectoryEntry } from "./client/types";
import { useDocumentTitle } from "../../common/Utils";
import { PUBLIC_URL } from "../../App";
const VideoCourseDirectoryDetail: React.FC<{}> = () => {
  const { courseid } = useParams<{ courseid: string }>();
  const [data, setData] = useState<VideoCourseDirectoryEntry | null>(null);
  const [courseTitles, setCourseTitles] = useState<Map<number, CourseNameQueryResponse[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number[]>([]);
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
    if (!activeIndex.includes(index)) {
      setActiveIndex([...activeIndex, index])
    } else {
      setActiveIndex(activeIndex.filter((item) => item !== index))
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
      <Button as={Link} to={`${PUBLIC_URL}/video_course/video_course_directory`} primary>返回课程选择</Button>
      {data !== null && <Segment stacked>
        <Header as="h2">{data.title}</Header>
        {loading && <Dimmer active><Loader></Loader></Dimmer>}
        <Grid columns={1} >
          {data.schema.map((item, index) => <Grid.Column key={item.title}>
            <Accordion styled style={{ width: "100%" }}>
              <AccordionTitle
                active={activeIndex.includes(index)}
                index={index}
                onClick={() => handleAccordionClick(item.courses, index)}
              >
                <Icon name='dropdown' />
                {item.title}
              </AccordionTitle>
              {courseTitles && courseTitles.get(index) && <AccordionContent active={activeIndex.includes(index)} style={activeIndex.includes(index) ? { display: "flex", justifyContent: "center", alignItems: 'center', flexDirection: "column" } : {}}>
                {courseTitles.get(index)?.map((course, idx) => <Container as={Link} to={`${PUBLIC_URL}/video_course/video_display/${data.id}/${course.id}/1`}>
                  <Segment style={{ width: "90%" }}>
                    <p style={{ marginLeft: "2rem", fontSize: '1.5rem', fontWeight: 'bold' }}>第{idx + 1}课. <span style={{ fontSize: "1rem" }}>{course.title}</span></p>
                  </Segment>
                </Container>)}
              </AccordionContent>}
            </Accordion>
          </Grid.Column>)}
        </Grid>
      </Segment >}
    </>
  )
}
export default VideoCourseDirectoryDetail

