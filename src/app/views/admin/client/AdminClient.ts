import GeneralClient from "../../../common/GeneralClient";
import { AdminBasicInfo, FeedListResponse, HomepageSwiperList, PermissionGroupList, RatedContestList, SubmissionStatisticsEntry } from "./types";

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
};

const adminClient = new AdminClient();

export { adminClient };
