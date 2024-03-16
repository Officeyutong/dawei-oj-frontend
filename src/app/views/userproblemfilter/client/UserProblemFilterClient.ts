import GeneralClient from "../../../common/GeneralClient";
import { UsableProblemEntry } from "./types";

class UserProblemFilterClient extends GeneralClient {
    async getUsableProblems(page: number, tags: string[], nameFilter?: string): Promise<{ data: UsableProblemEntry[]; pageCount: number }> {
        return (await this.unwrapClient!.post("/api/userproblemfilter/get_usable_problems", { page, tags, problem_name: nameFilter })).data;
    }
};

const userProblemFilterClient = new UserProblemFilterClient();
export { userProblemFilterClient }
