import { useEffect, useMemo, useRef, useState } from "react"
import { videoRecordPlayClient } from "./client/VideoCourseClient"
import { Link, useHistory, useParams } from "react-router-dom";
import { useDocumentTitle, useTimer } from "../../common/Utils";
import { VideoCourseEntry, VideoCourseSchemaQuestion, VideoCourseSchemaVideo, VideoPlayRecordEntry } from "./client/types";
import { Button, Dimmer, Grid, GridColumn, Header, Loader, Radio, Segment } from "semantic-ui-react";
import { PUBLIC_URL } from "../../App";
import { BigPlayButton, ControlBar, CurrentTimeDisplay, DurationDisplay, LoadingSpinner, Player, PlayerReference, PlayToggle, ProgressControl, TimeDivider, VolumeMenuButton } from 'video-react';
import 'video-react/dist/video-react.css';
import { StateType } from "../../states/Manager";
import { useSelector } from "react-redux";
import { Watermark } from 'watermark-js-plus'
import { Markdown } from "../../common/Markdown";
import VideoDisplayAdminView from "./VideoDisplayAdminView";

const VideoDisplay: React.FC<{}> = () => {
    const { courseid, coursedirectoryid, node } = useParams<{ courseid: string, coursedirectoryid: string, node: string }>();
    const [courseDetail, setCourseDetail] = useState<VideoCourseEntry | null>(null)
    const [videoURL, setVideoURL] = useState<string>('')
    const history = useHistory()
    const videoRef = useRef<PlayerReference | null>(null)
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [coursePreNode, setCoursePreNode] = useState<Map<number, number>>(new Map())
    const [playRecord, setPlayRecord] = useState<VideoPlayRecordEntry[] | null>(null)
    const [playEnded, setPlayEnded] = useState<boolean>(false)
    const userDetails = useSelector((s: StateType) => s.userState.userData)
    const [selectedAnswer, setSelectedAnswer] = useState<{ idx: number, next: number } | null>(null)
    const curTimeRef = useRef<number>(0);
    const courseId = useMemo(() => (courseid ? Number(courseid) : null), [courseid]);
    const courseDirectoryId = useMemo(() => (coursedirectoryid ? Number(coursedirectoryid) : null), [coursedirectoryid]);
    const nodeId = useMemo(() => (node ? Number(node) : null), [node]);
    useDocumentTitle('课程播放')

    const { hasVideoCourseManagePermission } = userDetails;
    useDocumentTitle('课程播放')

    const handleUpdateRecord = () => {
        (async () => {
            if (videoRef.current && courseDetail) {
                let watchTime = 0;
                if (courseDetail.schema[Number(node) - 1].type === 'video') {
                    watchTime = videoRef.current.getState().player.currentTime
                }
                if (courseDetail.schema[Number(node) - 1].type === 'choice_question') {
                    watchTime = videoRef.current.getState().player.duration
                }
                await videoRecordPlayClient.updatePlayRecord(Number(courseid), Number(coursedirectoryid), Number(node), Math.floor(watchTime))
            }

        })()
    }

    useTimer(handleUpdateRecord, 5000);
    const handleRefreshRecord = () => {
        (async () => {
            const record = await videoRecordPlayClient.getPlayRecord(userDetails.uid, 1, Number(courseid), Number(coursedirectoryid))
            setPlayRecord(record)
        })()
    }
    useTimer(handleRefreshRecord, 5000);
    useEffect(() => {
        (async () => {
            if (videoRef.current && courseDetail) {
                let watchTime = 0;
                if (courseDetail.schema[Number(node) - 1].type === 'video') {
                    watchTime = videoRef.current.getState().player.currentTime
                }
                if (courseDetail.schema[Number(node) - 1].type === 'choice_question') {
                    watchTime = videoRef.current.getState().player.duration
                }
                await videoRecordPlayClient.updatePlayRecord(Number(courseid), Number(coursedirectoryid), Number(node), Math.floor(watchTime))
            }
        })()
    }, [courseDetail, coursedirectoryid, courseid, node])
    useEffect(() => {
        const watermark = new Watermark({
            contentType: 'multi-line-text',
            content: `${userDetails.realName} ${userDetails.username}`,
            width: 200,
            height: 200,
            fontColor: '#dddfe4'
        })
        watermark.create()
        return (() => {
            watermark.destroy()
        })


    }, [userDetails.realName, userDetails.username,])

    useEffect(() => {
        (async () => {
            try {
                setLoading(true)
                if (!loaded) {
                    const courseDetail = await videoRecordPlayClient.getVideoCourse(Number(courseid))
                    const record = await videoRecordPlayClient.getPlayRecord(userDetails.uid, 1, Number(courseid), Number(coursedirectoryid))
                    setPlayRecord(record)
                    setCourseDetail(courseDetail)
                    setLoaded(true)
                }

            } catch { } finally {
                setLoading(false)
            }

        })()

    }, [coursedirectoryid, courseid, loaded, userDetails.uid])
    useEffect(() => {
        (async () => {
            try {
                setLoading(true)
                if (courseDetail && courseDetail.schema[Number(node) - 1].type === 'video') {
                    const videoURL = await videoRecordPlayClient.getVideoURL((courseDetail.schema[Number(node) - 1] as VideoCourseSchemaVideo).video_id)
                    setVideoURL(videoURL)
                }
                if (courseDetail && courseDetail.schema[Number(node) - 1].type === 'choice_question') {
                    const videoURL = await videoRecordPlayClient.getVideoURL((courseDetail.schema[Number(node) - 2] as VideoCourseSchemaVideo).video_id)
                    setVideoURL(videoURL)
                }
            } catch { } finally {
                setLoading(false)
            }
            if (videoRef && videoRef.current) {
                videoRef.current.load()
            }
        })()
    }, [node, courseDetail])

    useEffect(() => {
        if (courseDetail) {
            const map = new Map<number, number>();
            for (const item of courseDetail.schema) {
                if (!map.get(item.id)) {
                    if (item.type === 'video') {
                        map.set(item.id, item.id - 1)
                    }
                    if (item.type === 'choice_question') {
                        for (const ele of item.content) {
                            map.set(ele.next, item.id)
                        }
                    }
                }
            }
            setCoursePreNode(map);
        }

    }, [courseDetail])

    useEffect(() => {
        if (videoRef && videoRef.current && playRecord && playRecord.length !== 0) {

            videoRef.current.subscribeToStateChange((state) => {
                if (Number(node) === playRecord[0].node_id && videoRef.current) {
                    if (state.seeking) {
                        if ((curTimeRef.current < state.currentTime)) {
                            videoRef.current.seek(curTimeRef.current)
                        }
                    } else {
                        curTimeRef.current = Math.max(state.currentTime, curTimeRef.current)
                    }

                }
            })
        }
    }, [node, playRecord, userDetails.realName, userDetails.username])

    const handleQuestionVideo = () => {
        if (courseDetail && videoRef.current && videoURL) {
            const video = videoRef.current.getState().player
            if ((courseDetail.schema[Number(node) - 1].type === 'choice_question') && video.readyState) {
                videoRef.current.seek(Math.floor(video.duration))
            }

        }
    }

    const adminDebugView = hasVideoCourseManagePermission && courseDetail !== null && <VideoDisplayAdminView
        courseDetail={courseDetail}
        nodeId={parseInt(node)}
    ></VideoDisplayAdminView>

    const handleNextVideo = () => {
        if (playRecord && playRecord.length !== 0 && courseDetail && nodeId) {
            if (((((courseDetail.schema[nodeId - 1]) as VideoCourseSchemaVideo).next === null) || (playRecord.length !== 0 && (Number(node) >= playRecord[0].node_id))) && !playEnded) {
                return true
            } else {
                return false
            }
        } else {
            return true
        }
    }

    return (
        <>
            {courseDetail && playRecord && <div>
                {loading && <Dimmer active><Loader></Loader></Dimmer>}
                <Button as={Link} to={`${PUBLIC_URL}/video_course/video_course_directory_detail/${coursedirectoryid}`} primary>返回课程目录</Button>
                <Header as='h1'>{courseDetail.title}</Header>
                {courseDetail.schema[Number(node) - 1].type === 'video' && <div onContextMenu={(e) => e.preventDefault()}>
                    {videoURL !== '' && <Player ref={videoRef}
                        preload="auto"
                        autoPlay={true}
                        startTime={(playRecord.length !== 0 && Number(node) === playRecord[0].node_id) ? playRecord[0].watched_time : 0}
                        onEnded={() => setPlayEnded(true)}

                    >
                        <BigPlayButton position="center" />
                        <source src={videoURL}></source>
                        <LoadingSpinner />
                        <ControlBar autoHide={false} className="my-class" disableDefaultControls={true} >
                            <PlayToggle />
                            <VolumeMenuButton />
                            <CurrentTimeDisplay />
                            <TimeDivider />
                            <DurationDisplay />
                            <ProgressControl />
                        </ControlBar>
                    </Player>}
                    <Segment style={{ height: "5rem" }}>
                        <Button
                            onClick={() => {
                                const preNode = coursePreNode.get(Number(node))
                                history.push(`${PUBLIC_URL}/video_course/video_display/${coursedirectoryid}/${courseid}/${preNode}`)
                            }}
                            disabled={Number(node) <= 1}
                        >上一段视频</Button>
                        <Button
                            onClick={() => { history.push(`${PUBLIC_URL}/video_course/video_display/${coursedirectoryid}/${courseid}/${(courseDetail.schema[Number(node) - 1] as VideoCourseSchemaVideo).next}`) }}
                            disabled={handleNextVideo()}
                        >下一段视频</Button>
                    </Segment>
                    {adminDebugView}
                </div>
                }
                {courseDetail.schema[Number(node) - 1].type === 'choice_question' && <div>
                    <Header as='h2'>{(courseDetail.schema[Number(node) - 1] as VideoCourseSchemaQuestion).title}</Header>
                    <Grid columns={2}>
                        <GridColumn>
                            <div onContextMenu={(e) => e.preventDefault()}>
                                {videoURL !== '' && <Player ref={videoRef}
                                    preload="auto"
                                    autoPlay={true}
                                    onPlay={handleQuestionVideo}

                                >
                                    <LoadingSpinner />
                                    <BigPlayButton position="center" />
                                    <source src={videoURL}></source>
                                </Player>}
                            </div>
                        </GridColumn>
                        <GridColumn>
                            <Segment >
                                <Grid columns={1} style={{ margin: '2rem' }}>
                                    <Header as='h2'>请选择正确答案</Header>
                                    {(courseDetail.schema[Number(node) - 1] as VideoCourseSchemaQuestion).content.map((item, index) => <Grid.Column key={index} style={{ display: "flex", flexDirection: "row" }}>
                                        <Radio
                                            label={String.fromCharCode(index + 1 + 64) + '.'}
                                            style={{ display: "inline-block", fontWeight: "bold" }}
                                            value={index}
                                            checked={(selectedAnswer && (selectedAnswer.next === item.next) && (selectedAnswer.idx === index)) ? true : false}
                                            onChange={() => setSelectedAnswer({ idx: index, next: item.next })}>
                                        </Radio>
                                        <label><Markdown style={{ marginLeft: "2rem", display: "inline-block" }} markdown={item.content}></Markdown></label>
                                    </Grid.Column>
                                    )}
                                    <Button
                                        style={{ height: "3rem" }}
                                        disabled={selectedAnswer === null}
                                        primary
                                        onClick={() => { history.push(`${PUBLIC_URL}/video_course/video_display/${coursedirectoryid}/${courseid}/${selectedAnswer?.next}`) }}>
                                        提交答案
                                    </Button>
                                </Grid>
                            </Segment>
                        </GridColumn>
                    </Grid>
                    {adminDebugView}
                </div>
                }
            </div>}

        </>
    )
}

export default VideoDisplay
