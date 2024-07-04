import { useCallback, useEffect, useState } from "react";
import { CommentStatusFilterType, HomeworkSubmissionListEntry } from "../client/types";
import visualProgrammingClient from "../client/VisualProgrammingClient";
import { Button, Dimmer, Divider, Form, Icon, Label, Loader, Pagination, Radio, Table } from "semantic-ui-react";
import UserLink from "../../utils/UserLink";
import { timeStampToString } from "../../../common/Utils";
import SubmissionDetailedModal, { BasicSubmissionDetailProps } from "./SubmissionDetailedModal";
import SelectUserModal, { SelectedUser } from "./SelectUserModal";
import SelectHomeworkModal, { SelectedHomework } from "./SelectHomeworkModal";
import SelectTeamModal, { SelectedTeam } from "./SelectTeamModal";
import QueryString from "qs";

const TabSubmissionList: React.FC<{}> = () => {
    const [userFilter, setUserFilter] = useState<SelectedUser | null>(null);
    const [homeworkFilter, setHomeworkFilter] = useState<SelectedHomework | null>(null);
    const [commentFilter, setCommentFilter] = useState<CommentStatusFilterType>("no");
    const [teamFilter, setTeamFilter] = useState<SelectedTeam | null>(null);

    const [showSelectUsetModal, setShowSelectUserModal] = useState(false);
    const [showSelectHomeworkModal, setShowSelectHomeworkModal] = useState(false);
    const [showSelectTeamModal, setShowSelectTeamModal] = useState(false);

    const [page, setPage] = useState(1);
    const [data, setData] = useState<HomeworkSubmissionListEntry[]>([]);
    const [pageCount, setPageCount] = useState(1);

    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const [selectedSubmission, setSelectedSubmission] = useState<Omit<BasicSubmissionDetailProps, "allowNewComment"> | null>(null);

    const loadPage = useCallback(async (page: number) => {
        try {
            setLoading(true);
            const resp = await visualProgrammingClient.getHomeworkSubmissionList(
                undefined, commentFilter, userFilter?.uid, homeworkFilter?.id, page, undefined, teamFilter?.id
            );
            setPageCount(Math.max(resp.pageCount, 1));
            setData(resp.data);
            setPage(page);
            setLoaded(true);
            setLoading(false);
        } catch { } finally {

        }
    }, [commentFilter, userFilter?.uid, homeworkFilter?.id, teamFilter?.id]);
    useEffect(() => {
        if (!loading && !loaded) loadPage(1);
    }, [loadPage, loaded, loading]);
    const doBatchDownload = () => {
        const qs = QueryString.stringify({
            submission_ids: data.map(t => t.submission_id).join(",")
        });
        window.open(`/api/visualprogramming/homework/batch_download?${qs}`);
    };
    return <>
        {showSelectTeamModal && <SelectTeamModal
            closeCallback={data => {
                if (data) setTeamFilter(data);
                setShowSelectTeamModal(false);
            }}
        ></SelectTeamModal>}
        {showSelectHomeworkModal && <SelectHomeworkModal
            closeCallback={data => {
                if (data) setHomeworkFilter(data);
                setShowSelectHomeworkModal(false);
            }}
        ></SelectHomeworkModal>}
        {showSelectUsetModal && <SelectUserModal closeCallback={data => {
            if (data) setUserFilter(data);
            setShowSelectUserModal(false);
        }}></SelectUserModal>}
        {selectedSubmission !== null && <SubmissionDetailedModal
            {...selectedSubmission}
            allowNewComment={true}
            closeCallback={flag => {
                if (flag) loadPage(page);
                setSelectedSubmission(null);
            }}
        ></SubmissionDetailedModal>}

        {loading && <Dimmer active><Loader active></Loader></Dimmer>}
        <Form>
            <Form.Group widths={4}>
                <Form.Field>
                    <label>过滤用户</label>
                    {userFilter === null ? <Button size="small" onClick={() => setShowSelectUserModal(true)} color="green">选择用户</Button> : <Label onClick={() => setUserFilter(null)} size="large" color="blue">{userFilter.username} {userFilter.real_name && `（${userFilter.real_name}）`}<Icon name="delete"></Icon></Label>}
                </Form.Field>
                <Form.Field>
                    <label>过滤作业题</label>
                    {homeworkFilter === null ? <Button size="small" onClick={() => setShowSelectHomeworkModal(true)} color="green">选择作业</Button> : <Label onClick={() => setHomeworkFilter(null)} size="large" color="blue">#{homeworkFilter.id}. {homeworkFilter.name}<Icon name="delete"></Icon></Label>}
                </Form.Field>
                <Form.Field>
                    <label>过滤团队</label>
                    {teamFilter === null ? <Button size="small" onClick={() => setShowSelectTeamModal(true)} color="green">选择团队</Button> : <Label onClick={() => setTeamFilter(null)} size="large" color="blue">#{teamFilter.id}. {teamFilter.name}<Icon name="delete"></Icon></Label>}
                </Form.Field>
                <Form.Field>
                    <label>过滤点评状态</label>
                    <Form.Group inline>
                        <Form.Field control={Radio} checked={commentFilter === "no"} label="不过滤" onChange={() => setCommentFilter("no")}></Form.Field>
                        <Form.Field control={Radio} checked={commentFilter === "commented-only"} label="只显示已点评" onChange={() => setCommentFilter("commented-only")}></Form.Field>
                        <Form.Field control={Radio} checked={commentFilter === "uncommented-only"} label="只显示未点评" onChange={() => setCommentFilter("uncommented-only")}></Form.Field>
                    </Form.Group>
                </Form.Field>
            </Form.Group>
            <Form.Button size="small" color="green" onClick={() => loadPage(1)}>进行过滤</Form.Button>
            <Form.Button size="small" color="green" onClick={doBatchDownload}>下载当前页面所有文件</Form.Button>
        </Form>
        <Divider></Divider>
        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>
                        作业
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                        用户
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                        提交时间
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                        文件大小
                    </Table.HeaderCell>
                    <Table.HeaderCell>是否已点评</Table.HeaderCell>
                    <Table.HeaderCell>操作</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {data.map(item => <Table.Row key={item.submission_id}>
                    <Table.Cell>
                        #{item.homework_id}. {item.homework_name}
                    </Table.Cell>
                    <Table.Cell>
                        <UserLink data={item.user}></UserLink> {item.user.real_name && `（${item.user.real_name}）`}
                    </Table.Cell>
                    <Table.Cell>
                        {timeStampToString(item.submit_time)}
                    </Table.Cell>
                    <Table.Cell>
                        {(item.file_size / 1024).toFixed(2)} KB
                    </Table.Cell>
                    <Table.Cell>
                        {item.comment ? "已点评" : "未点评"}
                    </Table.Cell>
                    <Table.Cell>
                        <Button size="small" color="green" onClick={() => setSelectedSubmission({ homeworkId: item.homework_id, submissionId: item.submission_id, uid: item.user.uid })}>查看详情</Button>
                    </Table.Cell>
                </Table.Row>)}
            </Table.Body>
        </Table>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
            <Pagination activePage={page} totalPages={pageCount} onPageChange={(_, d) => loadPage(d.activePage as number)}></Pagination>
        </div>
    </>
};

export default TabSubmissionList;
