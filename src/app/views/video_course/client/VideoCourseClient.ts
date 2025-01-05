import GeneralClient from "../../../common/GeneralClient";
import { VideoClipEntry, VideoCourseDirectoryEntry, VideoCourseDirectoryEntryWithoutSchema, VideoCourseDirectorySchema, VideoCourseEntry, VideoCourseEntryWithoutSchema, VideoCourseSchema } from "./types";

class VideoRecordPlayClient extends GeneralClient {
    async addVideoClip(ossPath: string, description: string): Promise<{ id: number }> {
        return (await this.client!.post("/api/video_record_play/add_video_clip", { oss_path: ossPath, description })).data;
    }
    async updateVideoClip(id: number, ossPath: string, description: string) {
        await this.client!.post("/api/video_record_play/update_video_clip", { oss_path: ossPath, description, id });
    }
    async deleteVideoClip(id: number) {
        await this.client!.post("/api/video_record_play/delete_video_clip", { id });
    }
    async verifyVideoClipPaths(): Promise<VideoClipEntry[]> {
        return (await this.client!.post("/api/video_record_play/verify_video_clip_paths")).data;
    }
    async getAllClips(page: number = 1): Promise<{ pageCount: number; data: VideoClipEntry[] }> {
        return (await this.client!.post("/api/video_record_play/get_all_video_clips", { page })).data;
    }


    async addVideoCourse(title: string, schema: VideoCourseSchema): Promise<{ id: number }> {
        return (await this.client!.post("/api/video_record_play/add_video_course", { title, schema })).data;
    }
    async updateVideoCourse(id: number, title: string, schema: VideoCourseSchema) {
        await this.client!.post("/api/video_record_play/update_video_course", { title, schema, id });
    }
    async deleteVideoCourse(id: number) {
        await this.client!.post("/api/video_record_play/delete_video_course", { id });
    }
    async getAllCourses(page: number = 1): Promise<{ pageCount: number; data: VideoCourseEntryWithoutSchema[] }> {
        return (await this.client!.post("/api/video_record_play/get_all_video_courses", { page })).data;
    }
    async getVideoCourse(id: number): Promise<VideoCourseEntry> {
        return (await this.client!.post("/api/video_record_play/get_video_course", { id })).data;
    }

    async addVideoCourseDirectory(title: string, schema: VideoCourseDirectorySchema, order: number): Promise<{ id: number }> {
        return (await this.client!.post("/api/video_record_play/add_video_course_directory", { title, schema, order })).data;
    }
    async updateVideoCourseDirectory(id: number, title: string, schema: VideoCourseDirectorySchema, order: number) {
        await this.client!.post("/api/video_record_play/update_video_course_directory", { order, title, schema, id });
    }
    async deleteVideoCourseDirectory(id: number) {
        await this.client!.post("/api/video_record_play/delete_video_course_directory", { id });
    }
    async getAllVideoCourseDirectories(): Promise<VideoCourseDirectoryEntryWithoutSchema[]> {
        return (await this.client!.post("/api/video_record_play/get_all_video_course_directories")).data;
    }
    async getVideoCourseDirectory(id: number): Promise<VideoCourseDirectoryEntry> {
        return (await this.client!.post("/api/video_record_play/get_video_course_directory", { id })).data;
    }

};


export const videoRecordPlayClient = new VideoRecordPlayClient();
