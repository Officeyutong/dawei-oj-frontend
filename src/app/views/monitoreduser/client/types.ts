interface MonitoredUserEntry {
    uid: number;
    username: string;
    realName: string | null;
    createTime: number;
    lastLogin: number | null;

}

type AuthType = "email" | "phone";

export type {
    MonitoredUserEntry,
    AuthType
}
