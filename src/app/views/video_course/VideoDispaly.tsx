import { useEffect, useMemo, useRef, useState } from "react"
import { videoRecordPlayClient } from "./client/VideoCourseClient"
import { Link, useHistory, useParams } from "react-router-dom";
import { useDocumentTitle, useTimer } from "../../common/Utils";
import { VideoCourseEntry, VideoCourseSchemaQuestion, VideoCourseSchemaVideo, VideoPlayRecordEntry } from "./client/types";
import { Button, Dimmer, Grid, GridColumn, Header, Loader, Message, MessageHeader, Radio, Segment } from "semantic-ui-react";
import { PUBLIC_URL } from "../../App";
import { BigPlayButton, ControlBar, CurrentTimeDisplay, DurationDisplay, LoadingSpinner, PlaybackRateMenuButton, Player, PlayerReference, PlayToggle, ProgressControl, TimeDivider, VolumeMenuButton } from 'video-react';
import 'video-react/dist/video-react.css';
import { StateType } from "../../states/Manager";
import { useSelector } from "react-redux";
import { Watermark } from 'watermark-js-plus'
import { Markdown } from "../../common/Markdown";
import VideoDisplayAdminView from "./VideoDisplayAdminView";
import { showErrorModal, showSuccessModal } from "../../dialogs/Dialog";
import { showSuccessPopup } from "../../dialogs/Utils";
import QueryString from "qs";

const VideoDisplay: React.FC<{}> = () => {
    const { courseid, coursedirectoryid, node } = useParams<{ courseid: string, coursedirectoryid: string, node: string }>();

    const [courseTitle, setCourseTitle] = useState<string | null>(null)
    const [courseDetail, setCourseDetail] = useState<VideoCourseEntry | null>(null)
    const [videoURL, setVideoURL] = useState<string | null>(null)
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [playRecord, setPlayRecord] = useState<VideoPlayRecordEntry | null>(null)
    const [playEnded, setPlayEnded] = useState<boolean>(false)
    const [selectedAnswer, setSelectedAnswer] = useState<{ idx: number, next: number } | null>(null)
    const [position, setPosition] = useState<{ x: number, y: number }>({ x: 100, y: 100 });
    const [direction, setDirection] = useState<{ x: number, y: number }>({ x: 1, y: 1 });
    const [watermarkCount, setWatermarkCount] = useState<number>(0)

    const videoRef = useRef<PlayerReference | null>(null)
    const curTimeRef = useRef<number>(0);
    const waterMarkContainerRef = useRef(null);
    const waterMarkRef = useRef<HTMLDivElement | null>(null)

    const history = useHistory()

    const userDetails = useSelector((s: StateType) => s.userState.userData)

    const parsed = QueryString.parse(window.location.search.substring(1)) as {
        isNeedJumpToLastFrame?: string;
    }

    const courseId = useMemo(() => (Number(courseid)), [courseid]);
    const courseDirectoryId = useMemo(() => (Number(coursedirectoryid)), [coursedirectoryid]);
    const nodeId = useMemo(() => (Number(node)), [node]);
    const courseSchema = useMemo(() => {
        if (courseDetail) {
            const map = new Map();
            for (const item of courseDetail.schema) {
                map.set(item.id, item)
            }
            return map
        } else {
            return new Map()
        }
    }, [courseDetail])
    const coursePreNode = useMemo(() => {
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
            return map
        } else {
            return new Map()
        }
    }, [courseDetail])

    const { hasVideoCourseManagePermission } = userDetails;
    const speed = 2;

    useDocumentTitle('课程播放')

    const handleUpdateRecord = () => {
        (async () => {
            if (videoRef.current && courseDetail) {
                let watchTime = 0;
                if (courseSchema.get(nodeId).type === 'video') {
                    watchTime = videoRef.current.getState().player.currentTime
                }
                if (courseSchema.get(nodeId).type === 'choice_question') {
                    watchTime = videoRef.current.getState().player.duration
                }
                if (isNaN(watchTime)) watchTime = 0;
                await videoRecordPlayClient.updatePlayRecord(courseId, courseDirectoryId, nodeId, Math.floor(watchTime))
            }

        })()
    }

    useTimer(handleUpdateRecord, 5000);

    useEffect(() => {
        const watermark = new Watermark({
            contentType: 'multi-line-text',
            content: `${userDetails.realName} ${userDetails.username}`,
            width: 200,
            height: 200,
            fontColor: '#dddfe4',
            zIndex: -1
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
                    const [courseDetail, record] = await Promise.all([videoRecordPlayClient.getVideoCourse(courseId),
                    videoRecordPlayClient.getPlayRecord(userDetails.uid, 1, courseId, courseDirectoryId)])

                    if (record.length > 0) {
                        curTimeRef.current = record[0].watched_time
                        if (nodeId && nodeId > record[0].node_id) {
                            showErrorModal(`暂无权限观看该节点(${nodeId})`)
                            history.push(`${PUBLIC_URL}/video_course/video_display/${courseDirectoryId}/${courseId}/${record[0].node_id}`)
                        }
                    } else {
                        if (nodeId !== 1) {
                            showErrorModal('暂无权限观看该节点')
                            history.push(`${PUBLIC_URL}/video_course/video_display/${courseDirectoryId}/${courseId}/1`)
                        }
                    }
                    if (record.length > 0) {
                        setPlayRecord(record[0])
                    }
                    setCourseTitle(courseDetail.title)
                    setCourseDetail(courseDetail)
                    setLoaded(true)
                }

            } catch { } finally {
                setLoading(false)
            }

        })()

    }, [courseDirectoryId, courseId, history, loaded, nodeId, userDetails.uid])

    useEffect(() => {
        (async () => {
            try {
                setLoading(true)
                if (courseSchema.get(nodeId).type === 'video') {
                    const videoURL = await videoRecordPlayClient.getVideoURL((courseSchema.get(nodeId) as VideoCourseSchemaVideo).video_id)
                    setVideoURL(videoURL)
                }
                if (courseSchema.get(nodeId).type === 'choice_question') {
                    const videoURL = await videoRecordPlayClient.getVideoURL((courseSchema.get(nodeId - 1) as VideoCourseSchemaVideo).video_id)
                    setVideoURL(videoURL)
                }
            } catch { } finally {
                setLoading(false)
            }
            if (videoRef && videoRef.current) {
                videoRef.current.load()
            }
        })()
    }, [courseDetail, courseSchema, nodeId])

    const handleLoadStart = () => {
        if (videoRef.current) {
            videoRef.current.subscribeToStateChange((state) => {
                if ((!playRecord || nodeId === playRecord.node_id) && videoRef.current) {
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
    }

    const handleQuestionVideo = () => {
        if (courseDetail && videoRef.current && videoURL) {
            const video = videoRef.current.getState().player
            if ((courseSchema.get(nodeId).type === 'choice_question') && video.readyState) {
                videoRef.current.seek(Math.floor(video.duration))
            }

        }
    }

    const handleNextIdSmallThanCurrentId = () => {
        if (courseDetail && videoRef.current && videoURL) {
            const video = videoRef.current.getState().player
            if (parsed.isNeedJumpToLastFrame === '1' && video.readyState) {
                videoRef.current.seek(Math.floor(video.duration))
            }
        }
    }

    const adminDebugView = hasVideoCourseManagePermission && courseDetail !== null && <VideoDisplayAdminView
        courseDetail={courseDetail}
        nodeId={parseInt(node)}
    ></VideoDisplayAdminView>

    const handleNextVideo = () => {
        if (playRecord && courseDetail && nodeId) {

            if (((courseSchema.get(nodeId) as VideoCourseSchemaVideo).next === null)) {
                return true
            }
            if (playEnded) {
                return false
            }
            if ((playRecord && (nodeId >= playRecord.node_id))) {
                return true
            }

        } else {
            return true
        }
    }

    useEffect(() => {
        if (videoRef.current) {
            if (videoRef.current.getState().player.currentTime === videoRef.current.getState().player.duration && playEnded) {
                if (nodeId !== courseSchema.size && userDetails.hasVideoCourseManagePermission)
                    showSuccessPopup('当前视频切片已经播放完成，正在自动切换到下一节');
                setPlayEnded(false)
                setTimeout(() => {
                    if (courseSchema.get(nodeId).type === 'video') {
                        if (courseSchema.get(nodeId).next !== null) {
                            if (courseSchema.get(nodeId).next < nodeId) {
                                history.push(`${PUBLIC_URL}/video_course/video_display/${courseDirectoryId}/${courseId}/${(courseSchema.get(nodeId) as VideoCourseSchemaVideo).next}?isNeedJumpToLastFrame=1`)
                            } else {
                                history.push(`${PUBLIC_URL}/video_course/video_display/${courseDirectoryId}/${courseId}/${(courseSchema.get(nodeId) as VideoCourseSchemaVideo).next}?isNeedJumpToLastFrame=0`)
                            }

                        }
                    }
                }, 2000);

            }
        }
    }, [courseDirectoryId, courseId, courseSchema, courseSchema.size, history, nodeId, playEnded, userDetails.hasVideoCourseManagePermission])

    useEffect(() => {
        if (videoRef.current) {
            if (videoRef.current.getState().player.currentTime === videoRef.current.getState().player.duration && playEnded) {
                if (nodeId === courseSchema.size) {
                    setPlayEnded(false)
                    showSuccessModal('当前整个课程已播放完成')

                }
            }
        }
    }, [courseSchema.size, nodeId, playEnded])

    useEffect(() => {
        document.onfullscreenchange = (async (e) => {
            setTimeout(() => {
                window.location.reload()
            }, 2000);

        })
    }, [courseDirectoryId, courseId, nodeId])

    useEffect(() => {
        const moveWatermark = () => {
            setPosition((prev) => {
                const container = waterMarkContainerRef.current;
                if (!container) return prev;

                const { offsetWidth: containerWidth, offsetHeight: containerHeight } =
                    container;
                const watermarkSize = 50;

                let newX = prev.x + direction.x * speed;
                let newY = prev.y + direction.y * speed;

                if (newX <= 0 || newX + watermarkSize >= containerWidth) {
                    setDirection((dir) => ({ ...dir, x: -dir.x }));
                    newX = Math.max(0, Math.min(newX, containerWidth - watermarkSize));
                }

                if (newY <= 0 || newY + watermarkSize >= containerHeight) {
                    setDirection((dir) => ({ ...dir, y: -dir.y }));
                    newY = Math.max(0, Math.min(newY, containerHeight - watermarkSize));
                }

                return { x: newX, y: newY };
            });
        };

        const interval = setInterval(moveWatermark, 24);
        return () => clearInterval(interval);
    }, [direction]);
    const handleWaterRemove = () => {
        const watermarkEle = document.querySelector('.watermark')
        const text = `${userDetails.realName} ${userDetails.username}`
        if (waterMarkRef.current) {
            if (!watermarkEle) {
                window.location.reload()
            }

            if ((waterMarkRef.current.offsetTop === position.y) && (waterMarkRef.current.offsetLeft === position.x)) {
                if (watermarkCount < 35) {
                    setWatermarkCount(watermarkCount + 1)
                } else {
                    setWatermarkCount(0)
                    setPosition({ x: 100, y: 100 })
                }
            }
            if (!((watermarkEle as HTMLDivElement).innerText === text)) {
                (watermarkEle as HTMLDivElement).innerText = text
            }
        }
    }
    useTimer(handleWaterRemove, 1024)

    const handleMutationPlayRate = () => {
        const rate = localStorage.getItem("playRate")
        if (videoRef.current) {
            const { player } = videoRef.current.getState();
            player.playbackRate = Number(rate)
        }
        if (loaded) {

            const playRateEle = document.querySelector('.video-react-playback-rate.video-react-menu-button-popup.video-react-control.video-react-button.video-react-menu-button')
            const observerOptions = {
                childList: true,
                attributes: true,
                subtree: true,
            };
            if (playRateEle) {
                var observer = new MutationObserver(() => {
                    if (videoRef.current) {
                        setTimeout(() => {
                            const playRate = videoRef.current?.getState().player.playbackRate
                            localStorage.setItem('playRate', String(playRate))
                        }, 500);
                    }

                });
                observer.observe(playRateEle, observerOptions);
            }
        }
    }
    return (
        <>
            {courseDetail && loaded && <div>
                {loading && <Dimmer active page><Loader></Loader></Dimmer>}
                <Button as={Link} to={`${PUBLIC_URL}/video_course/video_course_directory_detail/${courseDirectoryId}`} primary>返回课程目录</Button>
                {courseTitle && <Header as='h1'>{courseTitle}</Header>}
                {courseSchema.get(nodeId).type === 'video' && <div onContextMenu={(e) => e.preventDefault()}>
                    {videoURL &&
                        <div
                            ref={waterMarkContainerRef}
                            style={{
                                position: "relative",
                                width: "100%",
                                height: "100%",
                                border: "1px solid #ccc",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                ref={waterMarkRef}
                                className="watermark"
                                style={{
                                    position: "absolute",
                                    top: position.y,
                                    left: position.x,
                                    width: "50px",
                                    height: "50px",
                                    pointerEvents: "none",
                                    color: '#f5f8ff',
                                    zIndex: '999999',
                                    opacity: "0.5"

                                }}
                            >
                                {userDetails.realName} {userDetails.username}
                            </div>
                            <Player ref={videoRef}
                                preload="auto"
                                autoPlay={true}
                                startTime={(playRecord && nodeId === playRecord.node_id) ? playRecord.watched_time : 0}
                                onEnded={() => setPlayEnded(true)}
                                onLoadStart={handleLoadStart}
                                onPlay={() => {
                                    handleUpdateRecord();
                                    handleNextIdSmallThanCurrentId()
                                    setPlayEnded(false)
                                    handleMutationPlayRate()
                                }}
                            >
                                <BigPlayButton position="center" />
                                <source src={videoURL}></source>
                                <LoadingSpinner />
                                <ControlBar autoHide={true} className="my-class" disableDefaultControls={true} >
                                    <PlayToggle />
                                    <VolumeMenuButton />
                                    <CurrentTimeDisplay />
                                    <TimeDivider />
                                    <DurationDisplay />
                                    <ProgressControl />
                                    <PlaybackRateMenuButton rates={[3, 2.5, 2, 1.75, 1.5, 1.25, 1, 0.75, 0.5]} />
                                </ControlBar>
                            </Player>
                        </div>}
                    <Segment>
                        <Button
                            onClick={() => {
                                const preNode = coursePreNode.get(nodeId)
                                history.push(`${PUBLIC_URL}/video_course/video_display/${courseDirectoryId}/${courseId}/${preNode}`)
                            }}
                            disabled={nodeId <= 1}
                        >上一段视频</Button>
                        <Button
                            onClick={() => {
                                (courseSchema.get(nodeId).next < nodeId) ?
                                    history.push(`${PUBLIC_URL}/video_course/video_display/${courseDirectoryId}/${courseId}/${(courseSchema.get(nodeId) as VideoCourseSchemaVideo).next}?isNeedJumpToLastFrame=1`)
                                    :
                                    history.push(`${PUBLIC_URL}/video_course/video_display/${courseDirectoryId}/${courseId}/${(courseSchema.get(nodeId) as VideoCourseSchemaVideo).next}?isNeedJumpToLastFrame=0`)
                            }}
                            disabled={handleNextVideo()}
                        >下一段视频</Button>
                        <Message warning>
                            <MessageHeader>注意</MessageHeader>
                            请勿全屏观看视频，谢谢</Message>
                    </Segment>
                    {adminDebugView}
                </div>
                }
                {courseSchema.get(nodeId).type === 'choice_question' && <div>
                    <Header as='h2'>{(courseSchema.get(nodeId) as VideoCourseSchemaQuestion).title}</Header>
                    <Grid columns={2}>
                        <GridColumn>
                            <div onContextMenu={(e) => e.preventDefault()}>
                                {videoURL &&
                                    <div
                                        ref={waterMarkContainerRef}
                                        style={{
                                            position: "relative",
                                            width: "100%",
                                            height: "100%",
                                            border: "1px solid #ccc",
                                            overflow: "hidden",
                                        }}
                                    >
                                        <div
                                            ref={waterMarkRef}
                                            className="watermark"
                                            style={{
                                                position: "absolute",
                                                top: position.y,
                                                left: position.x,
                                                width: "50px",
                                                height: "50px",
                                                pointerEvents: "none",
                                                color: '#f5f8ff',
                                                zIndex: '999999',
                                                opacity: "0.5"

                                            }}
                                        >

                                            {userDetails.realName} {userDetails.username}

                                        </div>
                                        <Player ref={videoRef}
                                            preload="auto"
                                            autoPlay={true}
                                            onPlay={() => {
                                                handleQuestionVideo();
                                                handleUpdateRecord();
                                                setPlayEnded(false);
                                                handleMutationPlayRate()
                                            }}
                                        >
                                            <LoadingSpinner />
                                            <BigPlayButton position="center" />
                                            <source src={videoURL}></source>
                                            <ControlBar autoHide={true} className="my-class" disableDefaultControls={true} >
                                                <PlayToggle />
                                                <VolumeMenuButton />
                                                <CurrentTimeDisplay />
                                                <TimeDivider />
                                                <DurationDisplay />
                                                <ProgressControl />
                                                <PlaybackRateMenuButton rates={[3, 2.5, 2, 1.75, 1.5, 1.25, 1, 0.75, 0.5]} />
                                            </ControlBar>
                                        </Player>
                                    </div>
                                }
                            </div>
                        </GridColumn>
                        <GridColumn>
                            <Segment >
                                <Grid columns={1} style={{ margin: '2rem' }}>
                                    <Header as='h2'>请选择正确答案</Header>
                                    {(courseSchema.get(nodeId) as VideoCourseSchemaQuestion).content.map((item, index) => <Grid.Column key={index} style={{ display: "flex", flexDirection: "row" }}>
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
                                        onClick={() => {
                                            (courseSchema.get(nodeId).next < nodeId) ?
                                                history.push(`${PUBLIC_URL}/video_course/video_display/${courseDirectoryId}/${courseId}/${selectedAnswer?.next}?isNeedJumpToLastFrame=1`)
                                                :
                                                history.push(`${PUBLIC_URL}/video_course/video_display/${courseDirectoryId}/${courseId}/${selectedAnswer?.next}?isNeedJumpToLastFrame=0`)
                                        }}>
                                        提交答案
                                    </Button>
                                </Grid>
                            </Segment>
                        </GridColumn>
                    </Grid>
                    {adminDebugView}
                </div>
                }
            </div >}

        </>
    )
}

export default VideoDisplay
