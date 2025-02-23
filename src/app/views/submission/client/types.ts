import { Schema } from "jsonschema";
import { SubmissionStatus } from "../../../common/types";
import { ProblemInfo, ProblemType, WrittenTestQuestion } from "../../problem/client/types";

interface TestcaseJudgeResult {
    input: string;
    output: string;
    score: number;
    status: SubmissionStatus;
    message: string;
    time_cost: number;
    memory_cost: number;
    full_score: number;
};

interface SubtaskJudgeResult {
    score: number;
    status: SubmissionStatus;
    testcases: TestcaseJudgeResult[];
};

interface SubmissionInfo {
    usePolling: boolean;
    managable: boolean;
    id: number;
    language: string;
    language_name: string;
    submit_time: number;
    public: boolean;
    contest: {
        id: number;
        name: string;
        isContest: true;
        closed: boolean;
        virtualContestRunning?: boolean;

    } | {
        isContest: false;
    };
    code: string;
    judge_result: { [x: string]: SubtaskJudgeResult };
    status: SubmissionStatus;
    message: string;
    judger: string;
    score: number;
    ace_mode: string;
    hljs_mode: string;
    time_cost: number;
    memory_cost: number;
    extra_compile_parameter: string;
    isRemoteSubmission: boolean;
    problem: {
        id: number;
        title: string;
        rawID: number;
        score: number;
        subtasks: ProblemInfo["subtasks"];
        problemType: ProblemType;
        writtenTestData: WrittenTestQuestion<false>[];
    };
    user: {
        uid: number;
        username: string;
    }
    virtualContestID: number;
    enableManualGrading: boolean;
    lastManualGradingTime: number | null;
    lastManualGradingUser: null | {
        uid: number; username: string;
    }
};

interface SubmissionFilter {
    uid?: number;
    status?: "accepted" | "unaccepted" | "judging" | "waiting" | "compile_error";
    min_score?: number;
    max_score?: number;
    problem?: number;
    contest?: number;
    username?: string;
};

const SubmissionFilterSchema: Schema = {
    type: "object",
    properties: {
        uid: {
            type: "string"
        },
        status: {
            type: "string",
            enum: ["accepted", "unaccepted", "judging", "waiting", "compile_error"]
        },
        min_score: {
            type: "number",
            minimum: 0
        },
        max_score: {
            type: "number",
            minimum: 0
        },
        problem: {
            type: "number"
        },
        contest: {
            type: "number"
        }
    }
};

interface SubmissionListEntry {
    id: number;
    status: SubmissionStatus;
    score: number;
    contest: number | -1;
    uid: number;
    username: string;
    submit_time: number;
    real_name: null | string;
    memory_cost: number;
    time_cost: number;
    problem_id: number;
    problem_title: number;
    total_score: number;
};

interface SubmissionManualGradingResult {
    submission_id: number;
    score: number | { [x: string]: SubtaskJudgeResult };
    message: string;
}

export type {
    SubmissionInfo,
    SubmissionFilter,
    TestcaseJudgeResult,
    SubtaskJudgeResult,
    SubmissionListEntry,
    SubmissionManualGradingResult
};

export {
    SubmissionFilterSchema
}
