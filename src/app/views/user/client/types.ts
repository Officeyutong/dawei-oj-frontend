import { GeneralUserEntry } from "../../../common/types";

interface UserProfileResponse {
    id: number;
    banned: number;
    username: string;
    description: string;
    email: string;
    register_time: string;
    rating: number;
    rating_history: { result: number; contest_id: number; contest_name: string }[];
    permission_group: string;
    permissions: string[];
    phone_verified: boolean;
    following: boolean;
    ac_problems: number[];
    joined_teams: { id: number; name: string }[];
    group_name: string;
    managable: boolean; //是否有user.manage权限
    canSetAdmin: boolean; //是否有permission.manage权限
    selfHasUserManagerPerm: boolean;
    selfHasPermissionManagePerm: boolean;
    selfHasPermissionViewExtraStatistics: boolean;
    adminComment?: string;
    belongingClassTeacher: string;

};
interface UserProfileResponseEditing extends UserProfileResponse {
    phone_number: string | undefined;
    real_name: string | undefined;
    group_permissions: string[];
    grantedTeams: {
        id: number;
        name: string;
        granted_time: number;
        granter: { uid: number; username: string; }
    }[]
    credit: number;
    xiaoe_tech_uid: string | null;
}
interface UserProfileUpdateRequest {
    banned: number;
    username: string;
    email: string;
    description: string;
    changePassword: boolean;
    newPassword: string;
    permission_group: string;
    permissions: string[];
    real_name: string | undefined;
    newAdminComment?: string;
    belongingClassTeacher: string;

};
interface FollowerItem extends GeneralUserEntry {
    time: string;
    followedByMe: boolean;

};
interface FolloweeItem extends GeneralUserEntry {
    time: string;
    followedByMe: boolean;
}

interface GlobalRanklistItem {
    username: string;
    uid: number;
    rating: number;
    description: string;
    real_name?: string;
};

interface UserStatisticEntry {
    date: number;
    newProblemsPassed: number;
    triedProblem: number;
    submissionCount: number;
    acceptedSubmission: number;
    problemDifficultyDist: { [k: string]: number };
    problemTagDist: { [k: string]: number };
    stayTime: number;
}

interface UserExtraStatistics {
    course_watch: { course_id: string; course_name: string; watched: number; total: number }[];
    problemset_statistics: { team_id: number; team_name: string; course_names: string[]; problemsets: { name: string; accepted_problems: number; total_problems: number; id: number; }[]; }[];
    real_name: string;
}

interface LoginAndRegisterCustomCallback {
    callback?: string;
}

interface CreditHistoryEntry {
    createTime: number;
    value: number;
    reason: string;
}

export type {
    UserProfileResponse,
    UserProfileUpdateRequest,
    FolloweeItem,
    FollowerItem,
    GlobalRanklistItem,
    UserStatisticEntry,
    UserProfileResponseEditing,
    UserExtraStatistics,
    LoginAndRegisterCustomCallback,
    CreditHistoryEntry
};
