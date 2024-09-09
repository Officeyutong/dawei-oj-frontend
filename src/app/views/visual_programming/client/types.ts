interface CreateHomeworkResponse {
    id: number;
    name: string;
}
type HomeworkEditListEntry = CreateHomeworkResponse;

interface HomeworkDetail {
    id: number;
    name: string;
    description: string;
    video_embed_html: string;
    image_url: string;
    course_url: string;
    exam_url: string;
    has_template_project: boolean;
    earn_score: number;
}
type HomeworkUpdateRequest = Omit<HomeworkDetail, "id">;
type HomeworkDisplayListEntry = Omit<HomeworkDetail, "video_embed_html">;

interface RanklistEntry {
    uid: number;
    username: string;
    email: string;
    real_name?: string;
    submission_count: number;
}
interface RecentSubmittedUserEntry {
    uid: number;
    max_submit_time: number;
    real_name?: string;
    username: string;
    email: string;
}
interface HomeworkSubmissionListEntry {
    submission_id: number;
    submit_time: number;
    file_size: number;
    file_name: string;
    homework_id: number;
    homework_name: string;
    user: {
        uid: number;
        username: string;
        email: string;
        real_name?: string;
    };
    comment?: {
        uid: number;
        username: string;
        real_name?: string;
        email: string;
        comment: string;
        comment_time: number;
        comment_grade: number;
    }
}

interface UserSubmittedHomeworkEntry {
    homework_id: number;
    name: string;
}

type CommentStatusFilterType = "no" | "commented-only" | "uncommented-only";

interface VisualProgrammingConfig {
    generalConfigURL: string;
}
interface SubmittedHomeworkCountStatisticsEntry {
    date_timestamp: number;
    commented_count: number;
    uncommented_count: number;
}

interface PerTeamStatisticsResponse {
    problems: { id: number; name: string; }[];
    statistics: {
        user: {
            uid: number;
            real_name?: string;
            username: string;
        };
        data: number[];
    }[]
}

interface NewlyGradedUser {
    username: string;
    real_name?: string;
    email: string;
    last_comment_time: number;
    uid: number;
}

export type {
    CreateHomeworkResponse,
    HomeworkDetail,
    HomeworkEditListEntry,
    HomeworkUpdateRequest,
    HomeworkDisplayListEntry,
    RanklistEntry,
    HomeworkSubmissionListEntry,
    UserSubmittedHomeworkEntry,
    CommentStatusFilterType,
    VisualProgrammingConfig,
    SubmittedHomeworkCountStatisticsEntry,
    PerTeamStatisticsResponse,
    RecentSubmittedUserEntry,
    NewlyGradedUser
}
