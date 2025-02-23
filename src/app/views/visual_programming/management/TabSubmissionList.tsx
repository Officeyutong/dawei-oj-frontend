import { useCallback, useEffect, useState } from "react";
import { CommentStatusFilterType, HomeworkSubmissionListEntry } from "../client/types";
import visualProgrammingClient from "../client/VisualProgrammingClient";
import { Button, Checkbox, Dimmer, Divider, Form, Icon, Label, Loader, Pagination, Radio, Table } from "semantic-ui-react";
import UserLink from "../../utils/UserLink";
import { timeStampToString } from "../../../common/Utils";
import SubmissionDetailedModal, { BasicSubmissionDetailProps } from "./SubmissionDetailedModal";
import SelectUserModal, { SelectedUser } from "./SelectUserModal";
import SelectHomeworkModal, { SelectedHomework } from "./SelectHomeworkModal";
import SelectTeamModal, { SelectedTeam } from "./SelectTeamModal";
import QueryString from "qs";
import _ from "lodash";
import { showErrorModal } from "../../../dialogs/Dialog";
import XLSX from "xlsx-js-style";
const TabSubmissionList: React.FC<{}> = () => {
    const [userFilter, setUserFilter] = useState<SelectedUser[]>([]);
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

    const [checkedSubmission, setCheckedSubmission] = useState<number[]>([]);

    const loadPage = useCallback(async (page: number) => {
        try {
            setLoading(true);
            const resp = await visualProgrammingClient.getHomeworkSubmissionList(
                undefined, commentFilter, userFilter.length > 0 ? userFilter.map(item => item.uid) : undefined, homeworkFilter?.id, page, undefined, teamFilter?.id
            );
            setPageCount(Math.max(resp.pageCount, 1));
            setData(resp.data);
            setPage(page);
            setLoaded(true);
            setLoading(false);
            setCheckedSubmission([]);
        } catch { } finally {

        }
    }, [commentFilter, userFilter, homeworkFilter?.id, teamFilter?.id]);
    useEffect(() => {
        if (!loading && !loaded) loadPage(1);
    }, [loadPage, loaded, loading]);
    const doBatchDownload = () => {
        if (checkedSubmission.length === 0) {
            showErrorModal("请选择至少一份提交！");
            return;
        }
        const qs = QueryString.stringify({
            submission_ids: checkedSubmission.join(",")
        });
        window.open(`/api/visualprogramming/homework/batch_download?${qs}`);
    };
    const exportListContent = () => {
        const workbook = XLSX.utils.book_new();
        const sheetData: string[][] = [];
        sheetData.push([
            "作业名", "用户", "提交时间", "文件大小（KB）", "是否已点评"
        ])
        for (const line of data) {
            if (checkedSubmission.includes(line.submission_id)) {
                sheetData.push([
                    line.homework_name,
                    line.user.username + (line.user.real_name ? `（${line.user.real_name}）` : ""),
                    timeStampToString(line.submit_time),
                    (line.file_size / 1024).toFixed(2),
                    line.comment ? "已点评" : "未点评"
                ])
            }
        }
        const sheet = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(workbook, sheet, "data");
        XLSX.writeFile(workbook, `export.xlsx`)
    }
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
            if (data) setUserFilter(c => [...c.filter(t => t.uid !== data.uid), data]);
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
                    {userFilter.map(item => <Label key={item.uid} size="large" color="blue">{item.username} {item.real_name && `（${item.real_name}）`}<Icon name="delete"></Icon></Label>)}
                    <Button size="small" onClick={() => setShowSelectUserModal(true)} color="green">添加用户</Button>
                </Form.Field>
                <Form.Field>
                    <label>过滤作业题</label>
                    {homeworkFilter === null ? <Button size="small" onClick={() => setShowSelectHomeworkModal(true)} color="green">选择作业</Button> : <Label size="large" color="blue">#{homeworkFilter.id}. {homeworkFilter.name}<Icon name="delete" onClick={() => setHomeworkFilter(null)}></Icon></Label>}
                </Form.Field>
                <Form.Field>
                    <label>过滤团队</label>
                    {teamFilter === null ? <Button size="small" onClick={() => setShowSelectTeamModal(true)} color="green">选择团队</Button> : <Label size="large" color="blue">#{teamFilter.id}. {teamFilter.name}<Icon name="delete" onClick={() => setTeamFilter(null)}></Icon></Label>}
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
            <Form.Button size="small" color="green" onClick={() => loadPage(1)}>筛选查找</Form.Button>
        </Form>
        <Divider></Divider>
        <Button size="tiny" color="blue" onClick={() => setCheckedSubmission(data.map(t => t.submission_id))}>全选</Button>
        <Button size="tiny" color="blue" onClick={() => setCheckedSubmission([])}>全不选</Button>
        <Button size="tiny" color="blue" onClick={() => setCheckedSubmission(c => _.difference(data.map(t => t.submission_id), c))}>反选</Button>
        <Button size="tiny" color="blue" onClick={doBatchDownload}>下载选中的作业文件</Button>
        <Button size="tiny" color="blue" onClick={exportListContent}>导出选中的信息</Button>
        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell></Table.HeaderCell>
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
                        <Checkbox checked={checkedSubmission.includes(item.submission_id)} onClick={() => {
                            if (checkedSubmission.includes(item.submission_id)) setCheckedSubmission(c => c.filter(t => t !== item.submission_id));
                            else setCheckedSubmission(c => [...c, item.submission_id]);
                        }}></Checkbox>
                    </Table.Cell>
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
            <Pagination activePage={page} totalPages={Math.max(pageCount, 1)} onPageChange={(_, d) => loadPage(d.activePage as number)}></Pagination>
        </div>
    </>
};

export default TabSubmissionList;
