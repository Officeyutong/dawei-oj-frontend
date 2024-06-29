import _ from "lodash";
import GeneralClient from "../../../common/GeneralClient"
import { CreateHomeworkResponse, HomeworkDetail, HomeworkDisplayListEntry, HomeworkEditListEntry, HomeworkSubmissionListEntry, HomeworkUpdateRequest, RanklistEntry } from "./types";

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
        return _.take((await this.getHomeworkRanklist(1)).data, 4);
    }
    async getHomeworkRanklist(page: number): Promise<{ pageCount: number; data: RanklistEntry[] }> {
        return (await this.client!.post("/api/visualprogramming/homework/get_homework_ranklist", { page })).data;
    }
    async getHomeworkSubmissionList(limit: number, filterCommentStatus: "no" | "commented-only" | "uncommented-only" = "no", uid?: number, homework_id?: number): Promise<HomeworkSubmissionListEntry[]> {
        return (await this.client!.post("/api/visualprogramming/homework/get_submission_for_homework", { limit, uid, homework_id, filterCommentStatus })).data;
    }
    async submitHomework(homeworkId: number, file: FormData, prorgressHandler?: (evt: ProgressEvent) => void): Promise<{ submission_id: number }> {
        return (await this.client!.post(`/api/visualprogramming/homework/submit/${homeworkId}`, file, {
            onUploadProgress: prorgressHandler
        })).data;
    }
};

const visualProgrammingClient = new VisualProgrammingClient();

export default visualProgrammingClient;
