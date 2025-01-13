import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { videoRecordPlayClient } from "./client/VideoCourseClient";
import { Accordion, AccordionContent, AccordionTitle, Button, Container, Dimmer, Grid, Header, Icon, Loader, Segment } from "semantic-ui-react";
import { CourseNameQueryResponse, VideoCourseDirectoryEntry, VideoPlayRecordEntry } from "./client/types";
import { useDocumentTitle } from "../../common/Utils";
import { PUBLIC_URL } from "../../App";
import { useSelector } from "react-redux";
import { StateType } from "../../states/Manager";
const VideoCourseDirectoryDetail: React.FC<{}> = () => {
  const { courseid } = useParams<{ courseid: string }>();

  const [data, setData] = useState<VideoCourseDirectoryEntry | null>(null);
  const [courseTitles, setCourseTitles] = useState<Map<number, CourseNameQueryResponse[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [playRecord, setPlayRecord] = useState<Map<number, VideoPlayRecordEntry>>(new Map())
  const userDetails = useSelector((s: StateType) => s.userState.userData)

  useDocumentTitle(`录播课程目录`)
  useEffect(() => {
    if (!loaded) {
      (async () => {
        try {
          setLoading(true);
          const [data, playrecord] = await Promise.all([videoRecordPlayClient.getVideoCourseDirectory(Number(courseid)), videoRecordPlayClient.getPlayRecord(userDetails.uid, undefined, undefined, Number(courseid))])
          setData(data)
          const map = new Map()
          for (const item of playrecord) {
            map.set(item.video_course.id, item)
          }
          setPlayRecord(map)
          setLoaded(true);
        } catch { } finally {
          setLoading(false);
        }
      })()
    }
  }, [courseid, loaded, userDetails.uid])
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
                {courseTitles.get(index)?.map((course, idx) => <Container key={course.id}>
                  <Segment style={{ width: "90%" }}>
                    <Link style={{ marginLeft: "2rem", fontSize: '1.5rem', fontWeight: 'bold', display: 'inline' }} to={`${PUBLIC_URL}/video_course/video_display/${data.id}/${course.id}/1`}>第{idx + 1}课. <span style={{ fontSize: "1rem" }}>{course.title}</span></Link>
                    <Icon name="circle" color={playRecord.get(course.id) ? "teal" : "orange"} style={{ marginLeft: "50%" }}></Icon>
                    <span style={{ color: playRecord.get(course.id) ? "teal" : "orange" }}>{playRecord.get(course.id) ? "已观看" : "未观看"}</span>
                    <Button primary disabled={playRecord.get(course.id) ? false : true} style={{ marginLeft: '1rem' }} as={Link} to={playRecord.get(course.id) ? `${PUBLIC_URL}/video_course/video_display/${data.id}/${course.id}/${playRecord.get(course.id)?.node_id}` : ''}>返回上次观看</Button>
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

