import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Button, Icon, InputOnChangeData, Label } from "semantic-ui-react";
import md5 from "md5";
import { useSelector } from "react-redux";
import { StateType, store } from "../states/Manager";
import { sprintf } from "sprintf-js";
import createPersistedState from "use-persisted-state";
import { DateTime } from "luxon";
import { MemoryUnit } from "../views/utils/MemoryCostLabel";
import { ProgrammingLanguageEntry } from "./types";
import { SelectedUser } from "../views/visual_programming/management/SelectUserModal";

export const usePreferredMemoryUnit = createPersistedState<MemoryUnit>("hj2-preferred-memory-unit");


const useDocumentTitle: (title: string) => void = (title: string) => {
    const appName = useSelector((s: StateType) => s.userState.userData.appName);
    useEffect(() => {
        document.title = `${title} - ${appName}`;
        return () => { document.title = appName };
    }, [title, appName]);
};
type onChangeType = ((event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => void);

const useInputValue: (text?: string) => { value: string; onChange: onChangeType } = (text: string = "") => {
    const [value, setValue] = useState(text);
    let onChange: onChangeType = useCallback((_, d) => {
        setValue(d.value);
    }, []);
    return { value, onChange };
};


function useProfileImageMaker(): (email: string, size?: number | string) => string {
    const profileURL = useSelector((s: StateType) => s.userState.userData.gravatarURL);
    return (email, size) => {
        return `${profileURL}${md5(email)}` + (size ? `?size=${size}` : "");
    };
}

export function makeProfileImageURL(uid: number): string {
    return `/api/user/profile_image/${uid}`;
}

export function usePasswordSalt() {
    const salt = useSelector((s: StateType) => s.userState.userData.salt);
    return salt;
}
/**
 * -1表示未登录
 * 
*/
export function useCurrentUid() {
    const uid = useSelector((s: StateType) => s.userState.userData.uid);
    return uid;
}
export function useAlreadyLogin() {
    const login = useSelector((s: StateType) => s.userState.login);
    return login;
}

export function useBaseContainerWidth(newWidth: string | undefined) {
    useEffect(() => {
        const oldWidth = store.getState().baseContainerWidth;
        store.dispatch({ type: "UPDATE_WIDTH", modify: s => ({ ...s, baseContainerWidth: newWidth }) });
        return () => { store.dispatch({ type: "UPDATE_WIDTH", modify: s => ({ ...s, baseContainerWidth: oldWidth }) }); };
    }, [newWidth]);
}

export function useBackgroundColor(color: string) {
    useEffect(() => {
        const oldColor = document.body.style.backgroundColor;
        document.body.style.backgroundColor = color;
        return () => { document.body.style.backgroundColor = oldColor };
    }, [color]);
}
export function secondsToString(totSecond: number): string {
    const seconds = totSecond % 60;
    const minutes = (Math.floor(totSecond / 60)) % 60;
    const hours = Math.floor(totSecond / 3600);
    return sprintf("%2d小时 %2d分钟 %2d秒", hours, minutes, seconds);
};
export function toLocalTime(seconds: number): string {
    return DateTime.fromSeconds(seconds).toJSDate().toLocaleString();
}
export function timeStampToString(seconds: number): string {
    return DateTime.fromSeconds(seconds).toJSDate().toLocaleString();
}
export function timestampToYMD(ts: number) {
    return DateTime.fromSeconds(ts).toFormat("L-dd");
}

export function useLastLanguage(data: { last_lang: string; languages: ProgrammingLanguageEntry[] } | null): string {
    const defaultLanguageList = useSelector((s: StateType) => s.userState.userData.defaultLanguages);
    const defaultLanguage = useMemo(() => {
        if (data === null) return "";
        if (data.last_lang !== "") return data.last_lang;
        for (const item of defaultLanguageList) {
            const curr = data.languages.find(p => p.id === item);
            if (curr) {
                return curr.id;
            }
        }
        return data.languages[0].id;
    }, [data, defaultLanguageList]);
    return defaultLanguage;

}

export function useIsPolyFillNeeded(): boolean {
    const ua = navigator.userAgent
    const chromeReg = ua.match(/Chrome\/([\d.]+)/);
    if (chromeReg && chromeReg[1]) {
        const browserInf = chromeReg[1].split('.')[0]
        if (Number(browserInf) < 90) {
            return true
        }
    }
    return false
}

export function useViewportWidth(): number {
    const [width, setWidth] = React.useState(window.innerWidth);
    React.useEffect(() => {
        const handleWindowResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handleWindowResize);
        return () => window.removeEventListener("resize", handleWindowResize);
    }, []);
    return width;
}

export function useNowTime(): DateTime {
    const [now, setNow] = useState(DateTime.now());
    useEffect(() => {
        const token = setInterval(() => setNow(DateTime.now()), 1000);
        return () => clearInterval(token);
    });
    return now;
}

export const UserSelectLabel: React.FC<{ user: SelectedUser | null; onOpenSelect: () => void; onRemove: () => void; labelTitle?: string }> = ({ onRemove, user, onOpenSelect, labelTitle }) => {
    return user === null ? <Button size="small" onClick={onOpenSelect} color="green">{labelTitle || "选择用户"}</Button> : <Label onClick={onRemove} size="large" color="blue"><ComplexUserLabel user={user}></ComplexUserLabel><Icon name="delete"></Icon></Label>
}

export const ComplexUserLabel: React.FC<{ user: SelectedUser }> = ({ user }) => {

    return <>{user.username} {user.real_name && `（${user.real_name}）`}</>;
};

export {
    useDocumentTitle,
    useInputValue,
    useProfileImageMaker,
};
export type {
    onChangeType
};
