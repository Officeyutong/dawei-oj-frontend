import GeneralClient from "../../../common/GeneralClient";
import { AdminBasicInfo, AllUserListEntry, BatchCreateUserEntry, BatchQueryGrantedTeamsResponse, FeedListResponse, HomepageSwiperList, PermissionGroupList, ProblemBatchUploadResponseEntry, RatedContestList, SubmissionStatisticsEntry, TeamGrantOperation } from "./types";

class AdminClient extends GeneralClient {
    async getAdminBasicInfo(): Promise<AdminBasicInfo> {
        return (await this.client!.post("/api/admin/show")).data as AdminBasicInfo;
    }
    async removeRatedContest(contestID: number) {
        await this.client!.post("/api/admin/rating/remove", { contestID: contestID });

    }
    async getRatedContestList(): Promise<RatedContestList> {
        return (await this.client!.post("/api/admin/rating/rated_contests")).data;
    }
    async addRatedContest(contestID: number) {
        await this.client!.post("/api/admin/rating/append", { contestID: contestID });
    }
    async getPermissionGroupList(): Promise<PermissionGroupList> {
        return (await this.unwrapClient!.post("/api/admin/rating/permission_groups/get")).data.result as PermissionGroupList;
    }
    async updatePermissionGroupList(data: PermissionGroupList) {
        await this.client!.post("/api/admin/rating/permission_groups/update", { groups: data });
    }
    async removeFeed(feed_id: number) {
        await this.client!.post("/api/admin/remove_feed", { feed_id: feed_id });
    }
    async sendGlobalFeed(top: boolean, content: string) {
        await this.client!.post("/api/admin/send_global_feed", { top: top, content: content });
    }
    async getGlobalFeed(page: number = 1): Promise<FeedListResponse> {
        return (await this.unwrapClient!.post("/api/admin/list_global_feed", { page: page })).data as FeedListResponse;
    }
    async switchUser(target_user: number) {
        await this.client!.post("/api/admin/switch_user", { target_user: target_user });
    }
    async getHomepageSwiperList(): Promise<HomepageSwiperList> {
        return (await this.client!.post("/api/misc/homepage_swiper/list")).data as HomepageSwiperList;
    }
    async updateHomepageSwiper(data: HomepageSwiperList) {
        await this.client!.post("/api/misc/homepage_swiper/update", { data: data });
    }
    async getSubmissionStatistics(startTime: number, endTime: number): Promise<SubmissionStatisticsEntry[]> {
        return (await this.client!.post("/api/admin/get_submission_statistics", { start_time: startTime, end_time: endTime })).data;
    }
    async doBatchProblemUpload(files: FormData, prorgressHandler: (evt: ProgressEvent) => void): Promise<ProblemBatchUploadResponseEntry[]> {
        const resp: { code: number; message?: string; data?: ProblemBatchUploadResponseEntry[] } = (await this.unwrapClient!.post(`/api/admin/batch_upload_problem`, files, { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress: prorgressHandler })).data;
        if (resp.code !== 0) {
            throw new Error(`错误: ${resp.message}`);
        }
        return resp.data!;
    }
    async getAllUsers(teamGrantFilter: undefined | number): Promise<AllUserListEntry[]> {
        return (await this.client!.post("/api/admin/get_all_users", { team_grant_filter: teamGrantFilter })).data;
    }
    async getAllTeams(): Promise<{ id: number; name: string }[]> {
        return (await this.client!.post("/api/admin/get_all_teams")).data;
    }
    async grantTeamPermissions(users: number[], operation: TeamGrantOperation, team_id: number | undefined): Promise<void> {
        await this.client!.post("/api/admin/grant_team_permissions", { users, operation, team_id });
    }
    async batchQueryGrantedTeams(users: number[]): Promise<BatchQueryGrantedTeamsResponse> {
        return (await this.client!.post("/api/admin/batch_query_granted_teams", { users })).data;
    }
    async batchCreateUser(users: BatchCreateUserEntry[]): Promise<void> {
        await this.client!.post("/api/admin/batch_create_user", { users });
    }
};

const adminClient = new AdminClient();

export { adminClient };
