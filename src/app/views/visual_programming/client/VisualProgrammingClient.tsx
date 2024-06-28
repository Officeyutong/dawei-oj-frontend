import GeneralClient from "../../../common/GeneralClient"
import { CreateHomeworkResponse, HomeworkDetail, HomeworkDisplayListEntry, HomeworkEditListEntry, HomeworkUpdateRequest } from "./types";

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
};

const visualProgrammingClient = new VisualProgrammingClient();

export default visualProgrammingClient;
