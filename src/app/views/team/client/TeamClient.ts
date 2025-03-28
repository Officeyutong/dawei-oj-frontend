import QueryString from "qs";
import GeneralClient from "../../../common/GeneralClient";
import { TeamDetail, TeamFileEntry, TeamListEntry, TeamMemberDetailedProblemsetStatisticsEntry, TeamMemberLookupEntry, TeamMemberProblemsetStatistics, TeamProblemsetRanklistResponse, TeamRawData, TeamStatisticEntry, TeamUpdateInfo } from "./types";
import { DateTime } from "luxon";

class TeamClient extends GeneralClient {

    async addTeamThings(teamID: number, problems: number[], contests: number[], problemsets: number[]) {
        await this.client!.post("/api/team/add_problem_or_contest_or_problemset", { teamID, problems, contests, problemsets });
    }
    async getTeamList(showJoinableOnly: boolean, filterGroupName?: string): Promise<{ list: TeamListEntry[]; hasTeamCreatePermission: boolean; allGroups: string[]; }> {
        return (await this.client!.post("/api/team/list", { showJoinableOnly, filter_group_name: filterGroupName })).data;
    }
    async createTeam(): Promise<{ team_id: number }> {
        return (await this.unwrapExtraClient!.post("/api/team/create")).data;
    }
    async joinTeam(uid: number, team_id: number, invite_code: string) {
        await this.client!.post("/api/team/join", QueryString.stringify({ uid, team_id, invite_code }));
    }
    async quitTeam(uid: number, team_id: number) {
        await this.client!.post("/api/team/quit", QueryString.stringify({ uid, team_id }));
    }
    async teamSetAdmin(team_id: number, uid: number, value: boolean) {
        await this.client!.post("/api/team/set_admin", QueryString.stringify({ uid, team_id, value }));
    }
    async getTeamDetail(team_id: number): Promise<TeamDetail> {
        return (await this.client!.post("/api/team/show", QueryString.stringify({ team_id }))).data;
    }
    async getTeamRawData(team_id: number): Promise<TeamRawData> {
        return (await this.client!.post("/api/team/raw_data", QueryString.stringify({ team_id }))).data;
    }
    async updateTeamInfo(team_id: number, data: TeamUpdateInfo) {
        await this.client!.post("/api/team/update", QueryString.stringify({ team_id: team_id, data: JSON.stringify(data) }));
    }
    async batchAddMembers(team: number, uid: number[], setAdmin: boolean): Promise<void> {
        await this.client!.post("/api/team/invite", { team, uid, setAdmin });
    }
    async getTeamFiles(teamID: number): Promise<TeamFileEntry[]> {
        return (await this.client!.post("/api/team/get_files", { teamID })).data;
    }
    async removeTeamFile(teamID: number, fileID: string) {
        await this.client!.post("/api/team/remove_file", { teamID, fileID });
    }
    async uploadTeamFile(teamID: number, files: FormData, prorgressHandler: (evt: ProgressEvent) => void) {
        await this.unwrapClient!.post(`/api/team/upload_file`, files, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: prorgressHandler,
            params: { teamID }
        });
    }
    async getTeamStatistics(teamID: number, startTime: DateTime, endTime: DateTime, filteredUID: number | undefined): Promise<TeamStatisticEntry[]> {
        return (await this.client!.post("/api/team/get_team_statistics", { team_id: teamID, start_time: startTime.toSeconds(), end_time: endTime.toSeconds(), filtered_uid: filteredUID })).data;
    }
    async lookupTeamMembers(teamID: number, keyword: string): Promise<TeamMemberLookupEntry[]> {
        return (await this.client!.post("/api/team/lookup_user_by_keyword", { team_id: teamID, keyword: keyword })).data;
    }
    async getInTeamProblemsetRanklist(teamID: number, problemsetID: number): Promise<TeamProblemsetRanklistResponse> {
        return (await this.client!.post("/api/team/get_in_team_problemset_ranklist", { team_id: teamID, problemset_id: problemsetID })).data;
    }
    async getTeamMemberProblemsetStatistics(teamID: number, timeFilter?: [number, number]): Promise<TeamMemberProblemsetStatistics> {
        return (await this.client!.post("/api/team/get_team_member_statistics", { team_id: teamID, time_range: timeFilter })).data;
    }
    async getTeamMemberDetailedProblemsetStatistics(teamID: number, uid: number): Promise<TeamMemberDetailedProblemsetStatisticsEntry[]> {
        return (await this.client!.post("/api/team/get_team_member_detailed_problemset_statistics", { team_id: teamID, uid })).data;
    }
    async searchUsersByPermissionGroup(groupId: string): Promise<{ username: string; uid: number; real_name?: string; }[]> {
        return (await this.client!.post("/api/team/search_user_by_permission_group", { group_id: groupId })).data;
    }
    async migrateTeamSubmissions(uid: number, fromTeam: number, toTeam: number) {
        await this.client!.post("/api/team/migrate_team_submissions", { uid, from_team: fromTeam, to_team: toTeam });
    }
};

const teamClient = new TeamClient();

export default teamClient;
