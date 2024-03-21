interface GeneralInfo {
    acceptedSubmissionCount: number;
    discussionCount: number;
    problemCount: number;
    publicProblemCount: number;
    submissionCount: number;
    todayCESubmissionCount: number;
    todaySubmissionCount: number;
    userCount: number;
    todayAcceptedSubmission: number;
    todayAccessedUsers: number;
};

type SettingPreview = { key: string; value: number | boolean | string; description: string }[];
type AdminBasicInfo = GeneralInfo & { settings: SettingPreview };

interface RatedContest {
    ratedTime: string;
    contestID: number;
    contestName: string;
    contestantCount: number;
};
type RatedContestList = RatedContest[];



interface PermissionGroupInstance {
    id: string;
    name: string;
    permissions: string;
    inherit: string;
};

type PermissionGroupList = PermissionGroupInstance[];


interface FeedEntry {
    id: number;
    time: string;
    content: string;
    top: boolean;
};
type FeedList = FeedEntry[];
interface FeedListResponse {
    pageCount: number;
    data: FeedList;
};

interface HomepageSwiperEntry {
    image_url: string;
    link_url: string;
};
type HomepageSwiperList = HomepageSwiperEntry[];

interface SubmissionStatisticsEntry {
    acceptedSubmission: number;
    submission: number;
    submittedUser: number;
    date: number;
};

interface ProblemBatchUploadResponseEntry {
    id: number;
    title: number;
    files: number;
    testcases: number;
}

export type {
    AdminBasicInfo,
    GeneralInfo,
    SettingPreview,
    RatedContest,
    RatedContestList,
    PermissionGroupInstance,
    PermissionGroupList,
    FeedEntry,
    FeedList,
    FeedListResponse,
    HomepageSwiperEntry,
    HomepageSwiperList,
    SubmissionStatisticsEntry,
    ProblemBatchUploadResponseEntry
};
