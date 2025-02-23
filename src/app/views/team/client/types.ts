import { GeneralUserEntry, SubmissionStatus } from "../../../common/types";

interface TeamListEntry {
    name: string;
    id: number;
    owner_id: number;
    owner_username: string;
    member_count: number;
    private: boolean;
    accessible: boolean;
    group_name: string;

};
interface TeamDetail {
    // 是否有team.manage权限
    canManage: boolean;
    id: number;
    name: string;
    description: string;
    owner_id: number;
    owner_username: string;
    admins: number[];
    members: { username: string; uid: number; email: string; group_name: string; real_name: null | string; }[];
    create_time: string;
    // 是否有查看团队详细信息、自由加入退出的权限
    hasPermission: boolean;
    private: boolean;
    team_problems: { id: number; title: string }[];
    team_contests: { id: number; name: string; start_time: number }[];
    team_problemsets: { id: number; name: string; courseURL: string; }[];
    group_name: string;

};
interface TeamThingsAddedResponse {
    team_problems: { id: number; title: string }[];
    team_contests: { id: number; name: string }[];
    team_problemsets: { id: number; name: string; courseURL: string; }[];
};
interface TeamRawData {
    id: number;
    name: string;
    description: string;
    private: boolean;
    invite_code: string;
    tasks: { name: string; problems: number[] }[];
    team_problems: number[];
    team_contests: number[];
    team_problemsets: number[];
    group_name: string;

};
interface TeamUpdateInfo {
    name: string;
    description: string;
    tasks: { name: string; problems: number[] }[];
    private: boolean;
    invite_code: string;
    team_problems: number[];
    team_contests: number[];
    team_problemsets: number[];
    group_name: string;

};

interface TeamFileEntry {
    file_id: string;
    filename: string;
    filesize: number;
    upload_time: number;
    uploader: GeneralUserEntry;
};

interface TeamStatisticEntry {
    date: number;
    passedProblemCount: number;
    passedProblemTag: { [k: string]: number };
    submissionCount: number;
    acceptedSubmissionCount: number;
};

interface TeamMemberLookupEntry {
    uid: number;
    username: string;
    email: string;
    realName: null | string;
    phoneNumber: null | string;
};

interface TeamProblemsetRanklistResponse {
    problems: { id: number; title: string }[];
    ranklist: {
        user: { uid: number; username: string; realName: null | string };
        totalScore: number;
        problems: { score: number; submission: { id: null | number; status: SubmissionStatus } }[]
    }[]
}

interface TeamMemberProblemsetStatistics {
    problemsets: { id: number; name: string; problems: number[] }[];
    user_data: {
        user: { uid: number; username: string; real_name?: string; course_watch_time: number; course_total_time: number; };
        statistics: { total_problems: number; accepted_problems: number; submission_count: number; }[];
    }[];
};

interface TeamMemberDetailedProblemsetStatisticsEntry {
    id: number;
    name: string;
    problems: {
        id: number;
        title: string;
        submission_count: number;
        best_submission: null | { status: string; id: number; };
    }[];
};

export type {
    TeamListEntry,
    TeamDetail,
    TeamRawData,
    TeamUpdateInfo,
    TeamThingsAddedResponse,
    TeamFileEntry,
    TeamStatisticEntry,
    TeamMemberLookupEntry,
    TeamProblemsetRanklistResponse,
    TeamMemberProblemsetStatistics,
    TeamMemberDetailedProblemsetStatisticsEntry
};
