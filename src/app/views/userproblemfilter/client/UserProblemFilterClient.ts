import GeneralClient from "../../../common/GeneralClient";
import { ProblemSearchFilter } from "../../problem/client/types";
import { UsableProblemEntry } from "./types";

class UserProblemFilterClient extends GeneralClient {
    async getUsableProblems(page: number, tags: string[], sortingMethod: ProblemSearchFilter["sortingMethod"], minDifficulty?: number, maxDifficulty?: number, nameFilter?: string): Promise<{ data: UsableProblemEntry[]; pageCount: number }> {
        return (await this.unwrapClient!.post("/api/userproblemfilter/get_usable_problems", { page, tags, problem_name: nameFilter, min_difficulty: minDifficulty, max_difficulty: maxDifficulty, sorting_method: sortingMethod })).data;
    }
};

const userProblemFilterClient = new UserProblemFilterClient();
export { userProblemFilterClient }
