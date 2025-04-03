interface VideoClipEntry {
    id: number;
    oss_path: string;
    description: string;
}

interface VideoCourseSchemaVideo {
    id: number;
    type: "video";
    next: number | null;
    video_id: number;
}
interface VideoCourseSchemaQuestion {
    id: number;
    type: "choice_question";
    title: string;
    content: {
        content: string;
        next: number;
    }[];
}
type VideoCourseSchemaEntry = VideoCourseSchemaVideo | VideoCourseSchemaQuestion;
type VideoCourseSchema = VideoCourseSchemaEntry[];
interface VideoCourseEntry {
    id: number;
    title: string;
    schema: VideoCourseSchema;
    preview_image_url: string;
}

type VideoCourseEntryWithoutSchema = Omit<VideoCourseEntry, "schema">;

interface VideoCourseDirectorySchemaEntry {
    title: string;
    courses: number[];
}
type VideoCourseDirectorySchema = VideoCourseDirectorySchemaEntry[];

interface VideoCourseDirectoryEntry {
    id: number;
    title: string;
    order: number;
    schema: VideoCourseDirectorySchema;
}
type VideoCourseDirectoryEntryWithoutSchema = Omit<VideoCourseDirectoryEntry, "schema">;
type VideoCourseDirectoryEntryWithoutSchemaWithPermission = VideoCourseDirectoryEntryWithoutSchema & { has_permission: boolean };
interface CourseNameQueryResponse {
    id: number;
    title: string;
}

interface VideoPlayRecordEntry {
    video_course: {
        id: number;
        title: string;
    }
    video_course_directory: {
        id: number;
        title: string;
    }
    node_id: number;
    watched_time: number;
    update_time: number;
}

interface UserGrantEntry {
    id: number;
    title: string;
}

export type {
    VideoClipEntry,
    VideoCourseEntry,
    VideoCourseSchemaEntry,
    VideoCourseSchemaVideo,
    VideoCourseSchemaQuestion,
    VideoCourseSchema,
    VideoCourseEntryWithoutSchema,
    VideoCourseDirectorySchemaEntry,
    VideoCourseDirectorySchema,
    VideoCourseDirectoryEntry,
    VideoCourseDirectoryEntryWithoutSchema,
    CourseNameQueryResponse,
    VideoCourseDirectoryEntryWithoutSchemaWithPermission,
    VideoPlayRecordEntry,
    UserGrantEntry
}
