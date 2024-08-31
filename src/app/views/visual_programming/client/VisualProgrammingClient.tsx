import _ from "lodash";
import GeneralClient from "../../../common/GeneralClient"
import { CommentStatusFilterType, CreateHomeworkResponse, HomeworkDetail, HomeworkDisplayListEntry, HomeworkEditListEntry, HomeworkSubmissionListEntry, HomeworkUpdateRequest, NewlyGradedUser, PerTeamStatisticsResponse, RanklistEntry, RecentSubmittedUserEntry, SubmittedHomeworkCountStatisticsEntry, UserSubmittedHomeworkEntry, VisualProgrammingConfig } from "./types";

class VisualProgrammingClient extends GeneralClient {
    async createHomework(): Promise<CreateHomeworkResponse> {
        return (await this.client!.post("/api/visualprogramming/homework/create")).data;
    }
    async getEditSideHomeworkList(): Promise<HomeworkEditListEntry[]> {
        return (await this.client!.post("/api/visualprogramming/homework/get_edit_list")).data;
    }
    async getHomeworkDetail(id: number): Promise<HomeworkDetail> {
        return (await this.client!.post("/api/visualprogramming/homework/get", { id })).data;
    }
    async updateHomework(id: number, data: HomeworkUpdateRequest) {
        await this.client!.post("/api/visualprogramming/homework/update", { id, data });
    }
    async deleteHomework(id: number) {
        await this.client!.post("/api/visualprogramming/homework/delete", { id });
    }
    async getDisplayListPage(page: number): Promise<{ data: HomeworkDisplayListEntry[]; pageCount: number }> {
        return (await this.client!.post("/api/visualprogramming/homework/get_display_list", { page })).data;
    }
    async getSimpleHomeworkRanklist(): Promise<RanklistEntry[]> {
        return _.take((await this.getHomeworkRanklist(1)).data, 3);
    }
    async getHomeworkRanklist(page: number): Promise<{ pageCount: number; data: RanklistEntry[] }> {
        return (await this.client!.post("/api/visualprogramming/homework/get_homework_ranklist", { page })).data;
    }
    async getHomeworkSubmissionList(
        limit?: number,
        filterCommentStatus: CommentStatusFilterType = "no",
        uid?: number[],
        homework_id?: number,
        page?: number,
        filterBySubmissionId?: number[],
        filterByTeam?: number
    ): Promise<{ data: HomeworkSubmissionListEntry[]; pageCount: number }> {
        return (await this.client!.post("/api/visualprogramming/homework/get_submission_list", { limit, uid, homework_id, filterCommentStatus, page, filterBySubmissionId, filterByTeam })).data;
    }
    async submitHomework(homeworkId: number, file: FormData, prorgressHandler?: (evt: ProgressEvent) => void): Promise<{ submission_id: number }> {
        return (await this.client!.post(`/api/visualprogramming/homework/submit/${homeworkId}`, file, {
            onUploadProgress: prorgressHandler
        })).data;
    }
    async queryUserSubmittedHomeworks(uid: number): Promise<UserSubmittedHomeworkEntry[]> {
        return (await this.client!.post("/api/visualprogramming/homework/query_submitted_homeworks", { uid })).data;
    }
    async updateComment(submissionId: number, comment: string, grade: number) {
        await this.client!.post("/api/visualprogramming/homework/update_comment", { submission_id: submissionId, comment, grade });
    }
    async getConfig(): Promise<VisualProgrammingConfig> {
        return (await this.client!.post("/api/visualprogramming/config")).data;
    }
    async getSubmittedHomeworkStatistics(startTimestamp: number, endTimestamp: number): Promise<SubmittedHomeworkCountStatisticsEntry[]> {
        return (await this.client!.post("/api/visualprogramming/get_submitted_homework_statistics", { start_timestamp: startTimestamp, end_timestamp: endTimestamp })).data;
    }
    async getPerTeamStatistics(team_id: number, filterByUser?: number): Promise<PerTeamStatisticsResponse> {
        return (await this.client!.post("/api/visualprogramming/get_statistics_by_team", { team_id, filterByUser })).data;
    }
    async getRecentSubmittedUserForHomework(homeworkId: number): Promise<RecentSubmittedUserEntry[]> {
        return (await this.client!.post("/api/visualprogramming/homework/get_newest_submitted_user_for_problem", { problem_id: homeworkId })).data;
    }
    async getNewlyGoodGradedUserForHomework(homeworkId: number): Promise<NewlyGradedUser[]> {
        return (await this.client!.post("/api/visualprogramming/get_newly_good_grated_user_for_homework", { homework_id: homeworkId })).data;
    }
    async clearTemplateProject(homeworkId: number) {
        await this.client!.post("/api/visualprogramming/clear_template_project", { homework_id: homeworkId });
    }
    async uploadTemplateProject(homeworkId: number, file: FormData, prorgressHandler?: (evt: ProgressEvent) => void) {
        await this.client!.post(`/api/visualprogramming/upload_template_project/${homeworkId}`, file, {
            onUploadProgress: prorgressHandler
        })
    }
    getTemplateProjectUrl(homeworkId: number): string {
        return `/api/visualprogramming/download_template_project/${homeworkId}`;
    }
};

const visualProgrammingClient = new VisualProgrammingClient();

export default visualProgrammingClient;
