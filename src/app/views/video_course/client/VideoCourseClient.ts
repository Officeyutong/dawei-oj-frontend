import axios from "axios";
import GeneralClient from "../../../common/GeneralClient";
import { AllUserListEntry } from "../../admin/client/types";
import { CourseNameQueryResponse, UserGrantEntry, VideoClipEntry, VideoCourseDirectoryEntry, VideoCourseDirectoryEntryWithoutSchema, VideoCourseDirectoryEntryWithoutSchemaWithPermission, VideoCourseDirectorySchema, VideoCourseEntry, VideoCourseEntryWithoutSchema, VideoCourseSchema, VideoPlayRecordEntry } from "./types";

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
    async getAllVideoCourseDirectories(withPermissionFlag: false): Promise<VideoCourseDirectoryEntryWithoutSchema[]>;
    async getAllVideoCourseDirectories(withPermissionFlag: true): Promise<VideoCourseDirectoryEntryWithoutSchemaWithPermission[]>;
    async getAllVideoCourseDirectories(withPermissionFlag: boolean): Promise<any> {
        return (await this.client!.post("/api/video_record_play/get_all_video_course_directories", { with_permission_flag: withPermissionFlag })).data;
    }
    async getVideoCourseDirectory(id: number): Promise<VideoCourseDirectoryEntry> {
        return (await this.client!.post("/api/video_record_play/get_video_course_directory", { id })).data;
    }
    async batchQueryCourseNames(ids: number[]): Promise<CourseNameQueryResponse[]> {
        return (await this.client!.post("/api/video_record_play/batch_get_course_names", { ids })).data;
    }
    async getPlayRecord(uid: number, limit?: number, filter_by_course_id?: number, filter_by_course_directory_id?: number): Promise<VideoPlayRecordEntry[]> {
        return (await this.client!.post("/api/video_record_play/get_play_record", { uid, limit, filter_by_course_id, filter_by_course_directory_id })).data;
    }
    async updatePlayRecord(video_course_id: number, video_course_directory_id: number, node_id: number, watched_time: number, handleErrors: boolean = true) {
        let client;
        if (handleErrors)
            client = this.client!;
        else
            client = axios;
        await client.post("/api/video_record_play/update_play_record", { video_course_id, video_course_directory_id, node_id, watched_time });
    }
    async getVideoURL(video_clip_id: number): Promise<string> {
        return (await this.client!.post("/api/video_record_play/get_video_url", { video_clip_id })).data;
    }
    async getUserGrants(uid: number): Promise<UserGrantEntry[]> {
        return (await this.client!.post("/api/video_record_play/get_user_grants", { uid })).data;
    }
    async setUserGrants(uid: number, videoDirectoryIds: number[]) {
        await this.client!.post("/api/video_record_play/set_user_grants", { uid, ids: videoDirectoryIds });
    }
    async getUsableUsersForVideoDirectory(videoCourseDirectoryId: number): Promise<AllUserListEntry[]> {
        return (await this.client!.post("/api/video_record_play/get_usable_users", { video_course_directory_id: videoCourseDirectoryId })).data;
    }
    async setUsableUsersForVideoDirectory(videoCourseDirectoryId: number, users: number[]) {
        await this.client!.post("/api/video_record_play/set_usable_users", { uid: users, video_course_directory_id: videoCourseDirectoryId })
    }
};


export const videoRecordPlayClient = new VideoRecordPlayClient();
