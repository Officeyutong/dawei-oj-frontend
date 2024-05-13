import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnsiUp from "ansi_up";
import submissionClient from "../client/SubmissionClient";
import { SubmissionInfo } from "../client/types";
import { Button, Dimmer, Divider, Header, Loader, Message, Segment, Table } from "semantic-ui-react";
import { timeStampToString, useDocumentTitle, usePreferredMemoryUnit } from "../../../common/Utils";
import "./Submission.css"
import { PUBLIC_URL } from "../../../App";
import UserLink from "../../utils/UserLink";
import JudgeStatusLabel from "../../utils/JudgeStatusLabel";
import ScoreLabel from "../../utils/ScoreLabel";
import MemoryCostLabel from "../../utils/MemoryCostLabel";
import { io as socketIO, Socket } from "socket.io-client";
import { showErrorModal } from "../../../dialogs/Dialog";
import { ButtonClickEvent } from "../../../common/types";
import SubtaskResultAndCodeView from "./SubtaskResultAndCodeView";
import WrittenProblemResultView from "./WrittenProblemResultView";
import { WrittenTestAnswer } from "../../problem/client/types";
const ansiUp = new AnsiUp();

enum Stage {
    PRELOAD = -1,
    LOADING = 0,
    LOADED = 1,
    ERROR = 2
};

type SocketUpdateResponse = Pick<SubmissionInfo, "message" | "judge_result" | "status" | "score">;

const ShowSubmission = () => {
    const params = useParams<{ submission: string }>();
    const submissionID = parseInt(params.submission);
    const [stage, setStage] = useState<Stage>(Stage.PRELOAD);
    const [data, setData] = useState<null | SubmissionInfo>(null);

    const [unit, setUnit] = usePreferredMemoryUnit("kilobyte");
    const [trackerStarted, setTrackerStarted] = useState(false);
    const trackerCountRef = useRef<number>(0);
    const ansiTranslated = useMemo(() => ansiUp.ansi_to_html(data?.message || ""), [data?.message]);

    const socketRef = useRef<Socket | null>(null);
    const trackerTokenRef = useRef<NodeJS.Timeout | null>(null);
    const [defaultExpandedTasks, setDefaultExpandedTasks] = useState<string[]>([]);
    useEffect(() => {
        if (unit !== "byte" && unit !== "kilobyte" && unit !== "gigabyte" && unit !== "millionbyte") {
            setUnit("kilobyte");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [unit]);
    useEffect(() => {
        if (stage === Stage.PRELOAD) {
            (async () => {
                setStage(Stage.LOADING);
                try {
                    const resp = await submissionClient.getSubmissionInfo(submissionID);
                    setDefaultExpandedTasks(Object.entries(resp.judge_result).filter(([s, v]) => v.testcases.length <= 25).map(([s, v]) => s));
                    setData(resp);
                    setStage(Stage.LOADED);
                } catch {
                    setStage(Stage.ERROR);
                }
            })();
        }
    }, [stage, submissionID]);
    const rejudge = async (evt: ButtonClickEvent) => {
        const target = evt.currentTarget;
        try {
            target.classList.add("loading");
            await submissionClient.rejudge(data!.id);
            window.location.reload();
        } catch { } finally {
            target.classList.remove("loading");
        }
    };
    useEffect(() => {
        if (data === null) return;
        if (stage === Stage.LOADED && !trackerStarted) {
            if (data.usePolling) {
                let token = setInterval(() => {
                    trackerCountRef.current++;
                    if (trackerCountRef.current >= 100) {
                        showErrorModal("评测跟踪器已超时，请刷新页面。");
                        clearInterval(token);
                        return;
                    }
                    submissionClient.getSubmissionInfo(data.id).then(resp => {
                        setData(resp);
                        if (resp.status !== "judging" && resp.status !== "waiting") {
                            clearInterval(token);
                            return;
                        }
                    }).catch(() => {
                        clearInterval(token);
                    });
                }, 1000);
                trackerTokenRef.current = token;
                setTrackerStarted(true);
            } else {
                socketRef.current = socketIO(`${window.location.origin}/ws/submission`);
                const socket = socketRef.current!;
                socket.emit("init", {
                    submission_id: data.id
                });
                socket.on("update", (resp: SocketUpdateResponse) => {
                    setData(d => ({ ...d!, ...resp }));
                    console.log("Update with", resp);
                });
                setTrackerStarted(true);
            }
        }
    }, [data, stage, trackerStarted])
    useDocumentTitle(data === null ? "加载中..." : `${data.id} - ${data.problem.title} - 查看提交`);
    useLayoutEffect(() => {
        return () => {
            if (trackerTokenRef.current !== null) clearInterval(trackerTokenRef.current);
            if (socketRef.current !== null) socketRef.current.close();
        };
    }, []);
    const isContestSubmit = data?.contest.isContest || false;
    const isManualGrading = data?.lastManualGradingTime !== null;
    const isWrittenTest = data?.problem.problemType === "written_test";
    const parsedUserWrittenSubmission = useMemo(() => {
        if (data?.problem.problemType === "written_test") {
            try {
                const ret = JSON.parse(data.code);
                return ret as WrittenTestAnswer[];
            } catch {
                return [];
            }
        }
        return [];
    }, [data]);
    return <>
        {stage === Stage.LOADING && <>
            <div style={{ height: "400px" }}>
                <Dimmer active><Loader></Loader></Dimmer>
            </div>
        </>}
        {stage === Stage.LOADED && data !== null && <>
            <Header as="h1">查看提交记录</Header>
            <Segment stacked>
                {data.virtualContestID !== -1 && <div style={{ color: "red", fontSize: "large" }}>
                    此提交为虚拟比赛中的提交
                </div>}
                {isManualGrading && <Message positive>
                    <p>此评测的结果为人工评测所产生</p>
                </Message>}
                <Header as="h3">详情</Header>
                <Table className="submission-info-table" basic="very" celled style={{ maxWidth: "700px" }}>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell>提交ID</Table.Cell>
                            <Table.Cell>{data.id}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>题目</Table.Cell>
                            <Table.Cell>
                                <Link to={isContestSubmit ? `${PUBLIC_URL}/contest/${data.contest.id}/problem/${data.problem.id}?virtual_contest=${data.virtualContestID}` : `${PUBLIC_URL}/show_problem/${data.problem.id}`}>
                                    #{data.problem.id}. {data.problem.title}
                                </Link>

                            </Table.Cell>
                        </Table.Row>
                        {isContestSubmit && <Table.Row>
                            <Table.Cell>比赛</Table.Cell>
                            <Table.Cell>
                                <Link to={`${PUBLIC_URL}/contest/${data.contest.id}?virtual_contest=${data.virtualContestID}`}>#{data.contest.id}. {data.contest.name}</Link>
                            </Table.Cell>
                        </Table.Row>}
                        <Table.Row>
                            <Table.Cell>
                                提交用户
                            </Table.Cell>
                            <Table.Cell>
                                <UserLink data={data.user}></UserLink>
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>提交时间</Table.Cell>
                            <Table.Cell>{data.submit_time}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>
                                状态
                            </Table.Cell>
                            <Table.Cell>
                                <JudgeStatusLabel status={data.status}></JudgeStatusLabel>
                            </Table.Cell>
                        </Table.Row>
                        {data.status !== "invisible" && <>
                            <Table.Row>
                                <Table.Cell>
                                    得分/总分
                                </Table.Cell>
                                <Table.Cell>
                                    <ScoreLabel fullScore={data.problem.score} score={data.score}></ScoreLabel>
                                </Table.Cell>
                            </Table.Row>
                            {data.time_cost !== -1 && <Table.Row>
                                <Table.Cell>
                                    时间占用
                                </Table.Cell>
                                <Table.Cell>
                                    {data.time_cost} ms
                                </Table.Cell>
                            </Table.Row>}
                            {data.memory_cost !== -1 && <Table.Row>
                                <Table.Cell>
                                    内存占用
                                </Table.Cell>
                                <Table.Cell>
                                    <MemoryCostLabel memoryCost={data.memory_cost}></MemoryCostLabel>
                                </Table.Cell>
                            </Table.Row>}
                        </>}
                        {!isManualGrading && !isWrittenTest && <><Table.Row>
                            <Table.Cell>
                                编译参数
                            </Table.Cell>
                            <Table.Cell>
                                {data.extra_compile_parameter}
                            </Table.Cell>
                        </Table.Row>
                            <Table.Row>
                                <Table.Cell>
                                    评测机
                                </Table.Cell>
                                <Table.Cell>
                                    {data.judger}
                                </Table.Cell>
                            </Table.Row></>}
                        {!isWrittenTest && <Table.Row>
                            <Table.Cell>
                                编程语言
                            </Table.Cell>
                            <Table.Cell>
                                {data.language_name}
                            </Table.Cell>
                        </Table.Row>}
                        {!isManualGrading && !isWrittenTest && <Table.Row>
                            <Table.Cell>
                                内存显示单位
                            </Table.Cell>
                            <Table.Cell>
                                <Button.Group size="tiny">
                                    <Button active={unit === "byte"} onClick={() => setUnit("byte")}>
                                        Byte
                                    </Button>
                                    <Button active={unit === "kilobyte"} onClick={() => setUnit("kilobyte")}>
                                        KByte
                                    </Button>
                                    <Button active={unit === "millionbyte"} onClick={() => setUnit("millionbyte")}>
                                        MByte
                                    </Button>
                                    <Button active={unit === "gigabyte"} onClick={() => setUnit("gigabyte")}>
                                        GByte
                                    </Button>
                                </Button.Group>
                            </Table.Cell>
                        </Table.Row>}
                        {isManualGrading && <>
                            <Table.Row>
                                <Table.Cell>人工评测时间</Table.Cell>
                                <Table.Cell>{timeStampToString(data.lastManualGradingTime!)}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>人工评测用户</Table.Cell>
                                <Table.Cell><UserLink data={data.lastManualGradingUser!} ></UserLink></Table.Cell>
                            </Table.Row>
                        </>}
                    </Table.Body>
                </Table>
                {data.managable && !data.isRemoteSubmission && !isWrittenTest && <Button color="red" onClick={rejudge}>
                    重测</Button>}
                {data.enableManualGrading && <Button color="green" as={Link} to={`${PUBLIC_URL}/submission/manual_grade/${data.id}`}>
                    人工评分
                </Button>}
                <Divider></Divider>

                {data.message !== "" && <>
                    <Header as="h3">
                        编译/附加信息
                    </Header>
                    <Segment>
                        <span className="raw-span" dangerouslySetInnerHTML={{ __html: ansiTranslated }}></span>
                    </Segment>
                </>}
                {isWrittenTest ? <WrittenProblemResultView
                    problemStmt={data.problem.writtenTestData}
                    subtaskResult={data.judge_result}
                    userCode={parsedUserWrittenSubmission}
                    problemSubtasks={data.problem.subtasks}
                ></WrittenProblemResultView> : <SubtaskResultAndCodeView
                    data={data}
                    defaultExpandedTasks={defaultExpandedTasks}
                    showFileName={data.problem.problemType !== "remote_judge"}
                ></SubtaskResultAndCodeView>}
            </Segment>
        </>}
    </>;
};

export default ShowSubmission;
