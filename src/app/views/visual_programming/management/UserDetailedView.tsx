import { useCallback, useEffect, useState } from "react";
import { HomeworkSubmissionListEntry, UserSubmittedHomeworkEntry } from "../client/types";
import { Button, Dimmer, Divider, Grid, Loader, Pagination, Table } from "semantic-ui-react";
import visualProgrammingClient from "../client/VisualProgrammingClient";
import { timeStampToString } from "../../../common/Utils";
import SubmissionDetailedModal from "./SubmissionDetailedModal";

interface UserDetailedProps {
    uid: number;
    username: string;
    real_name?: string
};
const UserDetailedView: React.FC<UserDetailedProps> = ({ uid }) => {
    const [submittedData, setSubmittedData] = useState<null | UserSubmittedHomeworkEntry[]>(null);
    const [loading, setLoading] = useState(false);
    const [selectedHomework, setSelectedHomework] = useState<null | number>(null);
    const [submissionList, setSubmissionList] = useState<HomeworkSubmissionListEntry[]>([]);
    const [submissionListPageCount, setSubmissionListPageCount] = useState(1);
    const [submissionListPage, setSubmissionListPage] = useState(1);
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<null | number>(null);
    const loadPageOfSubmission = useCallback(async (page: number, selectedHomework: number) => {
        try {
            setLoading(true);
            const resp = await visualProgrammingClient.getHomeworkSubmissionList(
                undefined, "no", [uid], selectedHomework,
            );
            setSubmissionList(resp.data);
            setSubmissionListPageCount(Math.max(1, resp.pageCount));
            setSubmissionListPage(page);
        } catch { } finally { setLoading(false); }
    }, [uid]);
    useEffect(() => {
        if (selectedHomework !== null) {

            loadPageOfSubmission(1, selectedHomework);
        }
    }, [loadPageOfSubmission, selectedHomework]);
    useEffect(() => {
        if (submittedData === null) (async () => {
            try {
                setLoading(true);
                setSubmittedData(await visualProgrammingClient.queryUserSubmittedHomeworks(uid));
                setLoading(false);
            } catch { } finally { }
        })();
    }, [submittedData, uid])
    return <>
        {selectedSubmissionId !== null && <SubmissionDetailedModal
            closeCallback={flag => {
                if (flag) loadPageOfSubmission(submissionListPage, selectedHomework!);
                setSelectedSubmissionId(null);
            }}
            submissionId={selectedSubmissionId}
            homeworkId={selectedHomework!}
            allowNewComment={true}
            uid={uid}
        ></SubmissionDetailedModal>}
        {loading && <Dimmer active><Loader active></Loader></Dimmer>}
        {submittedData !== null && <Grid columns={2}>
            <Grid.Column>
                <div style={{ overflowY: "scroll", maxHeight: "600px" }}>
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>作业</Table.HeaderCell>
                                <Table.HeaderCell>操作</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {submittedData.map(item => <Table.Row key={item.homework_id}>
                                <Table.Cell>#{item.homework_id}. {item.name}</Table.Cell>
                                <Table.Cell><Button size="small" color="green" onClick={() => setSelectedHomework(item.homework_id)}>查看具体提交</Button></Table.Cell>
                            </Table.Row>)}
                        </Table.Body>
                    </Table>
                </div>
            </Grid.Column>
            <Grid.Column>
                {selectedHomework === null && <div>
                    请选择一个作业来查看..
                </div>}
                {!loading && selectedHomework !== null && <>
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>
                                    提交时间
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    文件名
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    文件大小
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    点评状态
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    操作
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {submissionList.map(item => <Table.Row key={item.submission_id}>
                                <Table.Cell>{timeStampToString(item.submit_time)}</Table.Cell>
                                <Table.Cell>{item.file_name}</Table.Cell>
                                <Table.Cell>{Math.ceil(item.file_size / 1024)}KB</Table.Cell>
                                <Table.Cell>{item.comment ? "已点评" : "未点评"}</Table.Cell>
                                <Table.Cell><Button size="small" color="green" onClick={() => setSelectedSubmissionId(item.submission_id)}>查看详情</Button></Table.Cell>
                            </Table.Row>)}
                        </Table.Body>
                    </Table>
                    <div style={{ display: "flex", justifyContent: "space-around" }}>
                        <Pagination activePage={submissionListPage} totalPages={Math.max(submissionListPageCount, 1)} onPageChange={(_, d) => loadPageOfSubmission(d.activePage as number, selectedHomework)}></Pagination>
                    </div>
                </>}
            </Grid.Column>
            <Divider vertical></Divider>
        </Grid>}
    </>
};
export type { UserDetailedProps }
export default UserDetailedView;
