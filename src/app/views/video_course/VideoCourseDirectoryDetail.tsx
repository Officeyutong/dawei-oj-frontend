import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { videoRecordPlayClient } from "./client/VideoCourseClient";
import { Accordion, AccordionContent, AccordionTitle, Button, Container, Dimmer, Grid, Header, Icon, Loader, Segment, Image, Progress, SegmentGroup, Divider } from "semantic-ui-react";
import { CourseNameQueryResponse, VideoCourseDirectoryEntry, VideoPlayRecordEntry } from "./client/types";
import { useDocumentTitle } from "../../common/Utils";
import { PUBLIC_URL } from "../../App";
import { useSelector } from "react-redux";
import { StateType } from "../../states/Manager";
import NoneImage from "../../assets/noneimage.png"
const VideoCourseDirectoryDetail: React.FC<{}> = () => {
  const { courseid } = useParams<{ courseid: string }>();

  const [data, setData] = useState<VideoCourseDirectoryEntry | null>(null);
  const [courseTitles, setCourseTitles] = useState<Map<number, CourseNameQueryResponse[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [playRecord, setPlayRecord] = useState<Map<number, VideoPlayRecordEntry>>(new Map())
  const [lastestRecord, setLastestRecord] = useState<VideoPlayRecordEntry | null>(null)
  const userDetails = useSelector((s: StateType) => s.userState.userData)
  const WatchedPercent = useMemo(() => {
    if (data) {
      let count = 0;
      for (const item of data.schema) {
        count += item.courses.length
      }
      const res = Math.floor((playRecord.size / count) * 100)
      return res
    }

  }, [data, playRecord])
  useDocumentTitle(`录播课程目录`)
  useEffect(() => {
    if (!loaded) {
      (async () => {
        try {
          setLoading(true);
          const [data, playrecord] = await Promise.all([videoRecordPlayClient.getVideoCourseDirectory(Number(courseid)), videoRecordPlayClient.getPlayRecord(userDetails.uid, undefined, undefined, Number(courseid))])
          setData(data)
          console.log([...Array<Number>(data.schema.length).keys()])
          const map = new Map()
          for (const item of playrecord) {
            map.set(item.video_course.id, item)
          }
          setPlayRecord(map)
          setLastestRecord(playrecord[0])
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
      {data && <Segment style={{ boxShadow: "none", display: "flex", flexDirection: "row" }}>

        <Image src={data.preview_image_url === '' ? NoneImage : data.preview_image_url} style={{ height: "15rem", width: "20rem" }}></Image>
        <div style={{ marginLeft: "1rem", display: 'flex', flexDirection: "column", justifyContent: "space-between", width: "70%" }}>
          <Header as="h2" style={{ marginLeft: '1rem' }}>{data.title}</Header>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "row", width: '100%', color: "grey", verticalAlign: "top" }}>
              <span style={{ boxSizing: "border-box", lineHeight: "1rem" }}>学习进度：</span>
              <Progress percent={WatchedPercent} size='small' color="blue" style={{ width: "70%" }} progress />
            </div>
            {lastestRecord && <div>
              <Button primary
                size="small"
                disabled={lastestRecord === null}
                style={{ margin: '0.5rem' }}
                as={Link}
                to={lastestRecord !== null ? `${PUBLIC_URL}/video_course/video_display/${lastestRecord.video_course_directory.id}/${lastestRecord.video_course.id}/${lastestRecord.node_id}` : ''}>
                继续学习</Button>
              <span style={{ color: "grey" }}>上次浏览：{lastestRecord.video_course.title}</span>
            </div>}
          </div>

        </div>


      </Segment >}
      {
        data !== null && <SegmentGroup style={{ boxShadow: "none" }}>
          {loading && <Dimmer active><Loader></Loader></Dimmer>}
          <Segment style={{ padding: "0" }}>
            <p style={{ marginLeft: "1.5rem", color: "#1678c2", height: "3rem", display: "flex", alignItems: "center", width: "4%", justifyContent: "center", borderBottomColor: "#1678c2", borderBottom: "solid", fontWeight: "bold" }}>
              目录
            </p>
          </Segment>
          <Segment>
            <Grid columns={1} >
              {data.schema.map((item, index) => <Grid.Column key={item.title}>
                <Accordion style={{ width: "100%" }}>
                  <AccordionTitle
                    active={activeIndex.includes(index)}
                    index={index}
                    onClick={() => handleAccordionClick(item.courses, index)}
                    style={{ fontSize: "2rem" }}
                  >
                    <Icon name='dropdown' />
                    {item.title}
                  </AccordionTitle>
                  <Divider></Divider>
                  {courseTitles && courseTitles.get(index) && <AccordionContent active={activeIndex.includes(index)} style={activeIndex.includes(index) ? { display: "flex", justifyContent: "center", alignItems: 'center', flexDirection: "column", border: "none", boxShadow: "none" } : {}}>
                    {courseTitles.get(index)?.map((course, idx) => <Container key={course.id} style={{ border: "none", boxShadow: "none" }}>
                      <Segment style={{ width: "90%", display: "flex", justifyContent: "space-between", border: "none", boxShadow: "none" }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: "center", flexDirection: "column" }}>
                          <Link style={{ marginLeft: "2rem", fontSize: '1.5rem', fontWeight: 'bold', display: 'inline', color: playRecord.get(course.id) ? "grey" : "black" }} to={`${PUBLIC_URL}/video_course/video_display/${data.id}/${course.id}/1`}>第{idx + 1}课. <span style={{ fontSize: "1rem" }}>{course.title}</span></Link>
                          <p style={{ marginTop: "1rem", color: "grey" }}>视频|{playRecord.get(course.id) ? "已观看" : "未观看"}</p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: "center" }}>
                          <Button primary disabled={playRecord.get(course.id) ? false : true} style={{ marginLeft: '1rem' }} as={Link} to={playRecord.get(course.id) ? `${PUBLIC_URL}/video_course/video_display/${data.id}/${course.id}/${playRecord.get(course.id)?.node_id}` : ''}>返回上次观看</Button>
                        </div>
                      </Segment>
                      <Divider></Divider>
                    </Container>)}

                  </AccordionContent>}
                </Accordion>
              </Grid.Column>)}
            </Grid></Segment>
        </SegmentGroup >
      }
    </>
  )
}
export default VideoCourseDirectoryDetail

