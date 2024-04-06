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

export type {
    UserProfileResponse,
    UserProfileUpdateRequest,
    FolloweeItem,
    FollowerItem,
    GlobalRanklistItem,
    UserStatisticEntry,
    UserProfileResponseEditing
};
