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
    VisualProgrammingConfig
}
