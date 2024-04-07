import GeneralClient from "../../../common/GeneralClient";
import { AuthType, MonitoredUserEntry } from "./types";

class MonitoredUserClient extends GeneralClient {
    async listMonitoredUsers(): Promise<MonitoredUserEntry[]> {
        return (await this.client!.post("/api/monitoreduser/list")).data;
    }
    async requestAdd(username: string, auth_type: AuthType) {
        await this.client!.post("/api/monitoreduser/request_add", { username, auth_type });
    }
    async confirmAdd(username: string, auth_type: AuthType, code: string) {
        await this.client!.post("/api/monitoreduser/confirm_add", { username, auth_type, code });
    }
    async removeMonitoredUser(childUid: number) {
        await this.client!.post("/api/monitoreduser/delete", { child_uid: childUid });
    }
    async requestAddByPhone(phonenumber: string) {
        await this.client!.post("/api/monitoreduser/request_add_by_phone", { phonenumber });
    }
    async confirmAddByPhone(phonenumber: string, code: string) {
        await this.client!.post("/api/monitoreduser/confirm_add_by_phone", { phonenumber, code });
    }

}
const monitoredUserClient = new MonitoredUserClient();
export default monitoredUserClient;
