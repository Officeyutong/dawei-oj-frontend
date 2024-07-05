import { useParams } from "react-router-dom";
import { useDocumentTitle } from "../../common/Utils";
import { Button, Dimmer, Divider, Grid, GridColumn, GridRow, Header, Image, Loader, Modal, Progress, Segment } from "semantic-ui-react";
import { useEffect, useState, useCallback, useRef, ChangeEvent, CSSProperties, useMemo } from "react";
import { useSelector } from "react-redux";
import { StateType } from "../../states/Manager";
import visualProgrammingClient from "./client/VisualProgrammingClient";
import { HomeworkDetail, HomeworkSubmissionListEntry, RanklistEntry } from "./client/types";
import './EmbedVideo.css';
import { showErrorModal } from "../../dialogs/Dialog";
import { Markdown } from "../../common/Markdown";
import UserSubmissionListModal from "./UserSubmissionListModal";
import medal from './assets/medal.png'
import '../../LinkButton.css'

const EMBED_URL_REGEX = /<iframe.*?src="(.*?)".*?>/;

const VisualProgrammingSubmit: React.FC<{}> = () => {
    const { id } = useParams<{ id: string }>();
    const { uid } = useSelector((s: StateType) => s.userState.userData);
    const { initialRequestDone } = useSelector((s: StateType) => s.userState);
    const [loading, setLoading] = useState(true);
    const [loaded, setLoaded] = useState(false);
    const [uploading, setUpLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const [homeworkData, setHomeworkData] = useState<null | HomeworkDetail>(null);
    const [rankData, setRankData] = useState<null | RanklistEntry[]>(null);
    const [commentData, setCommentData] = useState<null | HomeworkSubmissionListEntry[]>(null);
    const [buttonText, setButtonText] = useState<'提交' | '已提交'>('提交');

    const [showSubmissionModal, setShowSubmissionModal] = useState(false);

    const uploadRef = useRef<HTMLInputElement>(null);

    const iframeSrc = useMemo(() => {
        if (!homeworkData) return "";
        const match = homeworkData.video_embed_html.match(EMBED_URL_REGEX);
        const src = match ? match[1] : '';
        return src;
    }, [homeworkData]);

    const classAddedIframe = `<iframe src="${iframeSrc}" class="videoClass" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`;

    useDocumentTitle(`${homeworkData?.name || "可视化作业提交"}`);

    const handleClick = () => {
        if (uploadRef.current) {
            uploadRef.current.click();
        }
    }

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        try {
            setUpLoading(true)
            setProgress(0);
            if (event.target && uploadRef.current) {
                const fileObj = event.target.files && event.target.files[0];

                if (!fileObj) {
                    showErrorModal("请选择文件!");
                    return;
                }
                if (fileObj.name.slice(-4) !== '.sb3') {
                    showErrorModal("文件类型错误")
                    return;
                }
                const formData = new FormData();
                formData.append(
                    fileObj.name, fileObj, fileObj.name
                );
                await visualProgrammingClient.submitHomework(Number(id), formData, (evt: ProgressEvent) => {
                    setProgress(Math.floor(evt.loaded / evt.total * 100));
                });
                uploadRef.current.files = null;
                await getData();
                setButtonText('已提交')
            }
        } catch { } finally {
            setUpLoading(false);
        }
    }

    const getData = useCallback(async () => {
        let flag = false;
        try {
            setLoading(true);
            const [workData, rankData, commentData] = await Promise.all([
                visualProgrammingClient.getHomeworkDetail(Number(id)),
                visualProgrammingClient.getSimpleHomeworkRanklist(),
                visualProgrammingClient.getHomeworkSubmissionList(1, 'no', uid, Number(id))
            ])
            setRankData(rankData);
            setCommentData(commentData.data)
            setHomeworkData(workData)
            setLoaded(true)

            if (commentData.data.length !== 0) {
                setButtonText('已提交')
            }
            flag = true;
        } catch { } finally {
            if (flag) {
                setTimeout(() => {
                    setLoading(false);
                }, 1000);
            } else {
                setLoading(false)
            }

        }
    }, [id, uid])

    useEffect(() => {
        if (initialRequestDone && homeworkData === null && rankData === null && commentData === null) getData();
    }, [homeworkData, getData, commentData, rankData, initialRequestDone])

    useEffect(() => {
        const oldColor = document.body.style.backgroundColor;
        document.body.style.backgroundColor = "#d6eefa";
        return () => { document.body.style.backgroundColor = oldColor };
    }, []);

    return (
        <>
            {showSubmissionModal && <UserSubmissionListModal uid={uid} homeworkId={parseInt(id)} closeCallback={() => setShowSubmissionModal(false)}
            ></UserSubmissionListModal>}
            {uploading &&
                <Modal size="tiny" closeOnDimmerClick={false} open>
                    <Modal.Header>
                        上传文件中
                    </Modal.Header>
                    <Modal.Content>
                        <Progress percent={progress} progress="percent" active color="green"></Progress>
                    </Modal.Content>
                </Modal>}
            {loading &&
                <Dimmer active={loading}>
                    <Loader>加载中</Loader>
                </Dimmer>}
            {loaded && commentData && rankData && homeworkData &&
                <div style={{ position: 'absolute', display: "flex", justifyContent: "center", width: "100%", height: "100%" }}>
                    {iframeSrc && <div style={{ flex: 'auto', display: "flex", width: '50%', height: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <h1 style={{ color: "#3e6143", fontSize: '3em', marginTop: '60px' }}>作业介绍</h1>
                        <div dangerouslySetInnerHTML={{ __html: classAddedIframe }} style={{ height: '75%', width: '90%', marginBottom: '200px', backgroundColor: '#FFFFFF', borderRadius: '20px' }}>
                        </div>
                    </div>}
                    <div style={{ display: "flex", width: '50%', height: '95%', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Segment style={{ marginTop: '70px', width: '90%', backgroundColor: 'white', borderRadius: "20px", marginBottom: "3%" }}>
                            <Grid>
                                <GridRow >
                                    <GridColumn>
                                        <Header as="h2">{homeworkData.name}</Header>
                                    </GridColumn>
                                </GridRow>
                                <GridRow>
                                    <GridColumn style={{ height: '200px' }} >
                                        <div style={{ overflowY: "scroll", maxHeight: "80%", margin: "2%", maxWidth: '95%', wordWrap: 'break-word' }}>
                                            <Markdown style={{ fontWeight: 'bold' }} markdown={homeworkData.description}></Markdown>
                                        </div>
                                        <Divider></Divider>
                                    </GridColumn>
                                </GridRow>
                                <GridRow style={{ paddingTop: 0 }}>
                                    <Grid.Column style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", }}>
                                        <div style={{ width: "200px", textAlign: "center" }}>
                                            <p style={{ textAlign: "center" }}>已提交后可多次重复提交</p>
                                            <button style={{ textAlign: "center" }} className="link-button" onClick={() => { setShowSubmissionModal(true) }}>点此跳转提交记录</button>
                                        </div>
                                        <div style={{ marginRight: "10px", height: "100%" }}>
                                            <input
                                                style={{ display: 'none' }}
                                                disabled={uploading}
                                                ref={uploadRef}
                                                type="file"
                                                onChange={handleFileChange}
                                            />
                                            <Button style={{ height: "100%", borderRadius: '30px', border: 'none', background: '#de5f50', fontSize: '1.5em', lineHeight: '5px', textAlign: 'center', color: 'white' }} onClick={handleClick}>
                                                {buttonText}
                                            </Button>
                                        </div>
                                    </Grid.Column>
                                </GridRow>
                            </Grid>
                        </Segment>
                        <div style={{ backgroundColor: 'white', height: '20%', width: '90%', border: '1.5rem solid', borderRadius: '50px', borderColor: '#a2c173' }}>
                            <div style={{ width: '100%', height: '80%' }}>
                                {buttonText === '提交' && <p style={{ margin: "3%", fontWeight: 'bold' }}>
                                    请提交作业，提交后等待批改即可查看评语
                                </p>}
                                {commentData !== undefined && commentData && commentData.length !== 0 && rankData && buttonText === '已提交' &&
                                    <div style={{ overflowY: "scroll", maxHeight: "105%", margin: "2%", maxWidth: '95%', wordWrap: 'break-word' }}>
                                        <Markdown style={{ fontWeight: 'bold' }} markdown={commentData[0].comment ? commentData[0].comment.comment : '等待老师批改完成后可查看评语'}></Markdown>
                                    </div>}
                            </div>
                        </div>
                        <div style={{ height: '30%', width: '90%', paddingTop: '5%', display: 'flex' }}>
                            {
                                rankData.map((item) => {
                                    return (
                                        <div key={item.uid} style={{ width: '50%', height: '90%', marginLeft: '1%', placeItems: 'center' }}>
                                            <Grid style={{ height: '90%', paddingRight: '18%' }}>
                                                <GridColumn width={9}>
                                                    <Image style={{ position: 'absolute', zIndex: '999', top: '-8%', marginLeft: '-10%', paddingTop: '-2%', transform: 'scale(0.9)' } as CSSProperties} src={medal}></Image>
                                                    <Image style={{ border: "solid", borderColor: '#a2c173' }} src={`/api/user/profile_image/${item.uid}`} size='medium' circular />
                                                </GridColumn>
                                                <GridColumn width={7} >
                                                    <div style={{ height: '30%', paddingLeft: '6%' }}>
                                                        <a target="_blank" rel="noreferrer" style={{ fontSize: '2em', color: 'black', textAlign: "center", fontWeight: 'bold' }} href={`/profile/${item.uid}`}>{item.real_name ? `${item.real_name}` : `${item.username}`}</a>
                                                    </div>
                                                    <p style={{ marginTop: '1px', fontSize: "1.3em", color: 'red', fontWeight: '500' }} >已交作业</p>
                                                    <div style={{ width: '110%', height: '29%', background: '#fff5bc', borderRadius: '40px', textAlign: 'center' }}>
                                                        <p style={{ color: 'red', fontSize: '2.8em', fontWeight: 'bold' }}>{item.submission_count}</p>
                                                    </div>
                                                </GridColumn>
                                            </Grid>
                                        </div>
                                    )
                                })
                            }
                        </div>

                    </div>
                </div >}
        </>
    )
};

export default VisualProgrammingSubmit;
