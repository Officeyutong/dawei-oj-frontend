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


export type {
    CreateHomeworkResponse,
    HomeworkDetail,
    HomeworkEditListEntry,
    HomeworkUpdateRequest,
    
}
