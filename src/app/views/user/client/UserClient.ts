import qs from "qs";
import GeneralClient from "../../../common/GeneralClient";
import { CreditHistoryEntry, FolloweeItem, FollowerItem, GlobalRanklistItem, UserExtraStatistics, UserProfileResponse, UserProfileResponseEditing, UserProfileUpdateRequest, UserStatisticEntry } from "./types";

class UserClient extends GeneralClient {
    async doLogin(identifier: string, password: string, identifierIsPhone: boolean) {
        await this.client!.post("/api/login", qs.stringify({ identifier: identifier, password: (password), identifierIsPhone: JSON.stringify(identifierIsPhone) }));
    }
    async doRequireResetPassword(identifier: string) {
        await this.client!.post("/api/require_reset_password", { identifier });
    }
    async doEmailRegister(username: string, password: string, email: string, realName: string): Promise<{ code: number; message: string }> {
        return (await this.unwrapClient!.post("/api/register", qs.stringify({ username: username, password: password, email: email, real_name: realName }))).data;
    }
    async doPhoneRegister(username: string, password: string, email: string, phone: string, authcode: string, realName: string) {
        await this.client!.post("/api/phoneuser/register", { username: username, password: password, email: email, phone: phone, authcode: authcode, real_name: realName });
    }
    async doEmailResetPassword(passwordHash: string, code: string) {
        await this.client!.post("/api/reset_password", { password: passwordHash, code });
    }
    async doEmailAuth(code: string) {
        await this.client!.post("/api/auth_email", { code });
    }
    async doChangeEmailConfirm(code: string) {
        await this.client!.post("/api/change_email", { code });
    }
    async doPhoneResetPassword(phone: string, passwordHash: string, authcode: string) {
        await this.client!.post("/api/phoneuser/reset_password", { phone: phone, password: passwordHash, authcode: authcode });
    }
    async checkPhoneUsing(phone: string): Promise<{ using: boolean }> {
        return (await this.client!.post("/api/phoneuser/check_phone", { phone: phone })).data;
    }
    async getUserProfile(uid: number, editing: true): Promise<UserProfileResponseEditing>;
    async getUserProfile(uid: number, editing: false): Promise<UserProfileResponse>;
    async getUserProfile(uid: number, editing: boolean): Promise<UserProfileResponse> {
        return (await this.client!.post("/api/get_user_profile", { uid, editing })).data;
    }

    async toggleAdminMode() {
        await this.client!.post("/api/user/toggle_admin_mode");
    }
    async toggleFollowState(target: number): Promise<{ followed: boolean }> {
        return (await this.client!.post("/api/user/toggle_follow_state", { target: target })).data;
    }
    async getFolloweeList(source: number, page: number): Promise<{ data: FolloweeItem[]; pageCount: number }> {
        return (await this.unwrapClient!.post("/api/user/get_followee_list", { source: source, page: page })).data;
    }
    async getFollowerList(target: number, page: number): Promise<{ data: FollowerItem[]; pageCount: number }> {
        return (await this.unwrapClient!.post("/api/user/get_follower_list", { target: target, page: page })).data;
    }
    async updateProfile(uid: number, data: UserProfileUpdateRequest): Promise<{ code: number; message: string }> {
        return (await this.unwrapClient!.post("/api/update_profile", qs.stringify({
            uid: uid,
            data: JSON.stringify(data)
        }))).data;
    }
    async getAllPermissions(uid: number): Promise<string[]> {
        return (await this.client!.post("/api/permission/get_all_permissions", { uid: uid })).data;
    }
    async forgetUsername(phone: string, code: string): Promise<{ username: string }> {
        return (await this.client!.post("/api/phoneuser/forget_username", {
            phone: phone,
            code: code
        })).data;
    }
    async getGlobalRanklist(page: number, search: string = ""): Promise<{ pageCount: number; ranklist: GlobalRanklistItem[] }> {
        return (await this.client!.post("/api/ranklist", {
            page, search
        })).data;
    }
    async doPhoneAuth(code: string, phone: string) {
        await this.client!.post("/api/phoneauth/auth", { code, phone });
    }
    async getUserStatisticsEntry(uid: number, startTime: number, endTime: number): Promise<UserStatisticEntry[]> {
        return (await this.client!.post("/api/user/get_user_statistics", { uid, start_time: startTime, end_time: endTime })).data;
    }
    async loginBySmsCode(phone: string, code: string) {
        await this.client!.post("/api/phoneuser/login", { phone, code });
    }
    async logout() {
        await this.client!.post("/api/logout");
    }
    async requestSyncXiaoeTechUid(uid: number): Promise<{ newID: string }> {
        return (await this.client!.post("/api/user/sync_xiaoe_tech_user_id", { uid })).data;
    }
    async requestSyncXiaoeTechPermissions(uid: number): Promise<string[]> {
        return (await this.client!.post("/api/user/claim_permissions_from_xiaoe_tech", { uid })).data;
    }
    async phonePreRegisterCheck(phone: string, username: string) {
        await this.client!.post("/api/phoneuser/pre_register_check", { phone, username });
    }
    async getUserExtraStatistics(uid: number): Promise<UserExtraStatistics> {
        return (await this.client!.post("/api/user/get_extra_statistics", { uid })).data;
    }
    async removeCustomProfileImage(uid: number) {
        await this.client!.post("/api/user/profile_image/remove", { uid });
    }
    async getCustomProfileImageStatus(uid: number): Promise<{ hasCustomProfileImage: boolean; }> {
        return (await this.client!.post("/api/user/profile_image/status", { uid })).data;
    }
    async uploadProfileImage(uid: number, imageSize: number, files: FormData, prorgressHandler?: (evt: ProgressEvent) => void) {
        return (await this.client!.post(`/api/user/profile_image/upload/${uid}`, files, {
            onUploadProgress: prorgressHandler,
            headers: {
                "Content-Length": imageSize
            }
        })).data;
    }
    async getUserCreditHistory(uid: number, page: number): Promise<{ data: CreditHistoryEntry[]; pageCount: number }> {
        return (await this.client!.post("/api/user/get_credit_history", { uid, page })).data;
    }
};

const userClient = new UserClient();

export default userClient;
