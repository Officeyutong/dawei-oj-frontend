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
}

type VideoCourseEntryWithoutSchema = Omit<VideoCourseEntry, "schema">;

export type {
    VideoClipEntry,
    VideoCourseEntry,
    VideoCourseSchemaEntry,
    VideoCourseSchemaVideo,
    VideoCourseSchemaQuestion,
    VideoCourseSchema,
    VideoCourseEntryWithoutSchema
}
