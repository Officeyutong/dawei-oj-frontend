import { AxiosInstance } from 'axios';
import { createStore, Action } from 'redux';
import { SemanticCOLORS, SemanticICONS } from 'semantic-ui-react/dist/commonjs/generic';



export interface UserStateType {
    login: boolean;
    initialRequestDone: boolean;
    userData: {
        uid: number;
        group: string;
        group_name: string;
        backend_managable: boolean;
        username: string;
        email: string;
        salt: string;
        judgeStatus: { [key: string]: { icon: SemanticICONS; text: string; color: SemanticCOLORS } };
        appName: string;
        usePolling: boolean;
        // registerURL: string;
        gravatarURL: string;
        // usePhoneAuth: boolean;
        enablePhoneAuth: boolean;
        enableEmailAuth: boolean;
        requireAuthWhenRegistering: boolean;
        canUseImageStore: boolean;
        displayRepoInFooter: boolean;
        shouldDisplayFullProblemsetListByDefault: boolean;
        currentActiveTimedProblemset: null | {
            id: number;
            name: string;
            createTime: number;
            timeLimit: number;
        };
        minProblemDifficulty: number;
        maxProblemDifficulty: number;
        hasProblemManagePermission: boolean;
        hasProblemTagManagePermission: boolean;
        siteName: string;
        showPermissionPack: boolean;
        requireEmailWhenRegisteringUsePhone: boolean;
        usernameRegex: string;
        badUsernamePrompt: string;
        enableRemoteJudge: boolean;
        companyName: string;
        difficultyDisplayMap: { [K: string]: { display: string; color: SemanticCOLORS } };
        customExtraFooter: string;
        hasVisualProgrammingHomeworkUpdatePerm: boolean;
        visualProgrammingGradeLevel: string[];
        realName?: string;
        defaultLanguages: string[];
        maxSubmissionCountPerUserPerVisualHomework: number;
        hasOnlineVMManagePermission: boolean;
        hasVideoCourseManagePermission: boolean;
    }
}

type BaseViewDisplayType = "none" | "old" | "new";

export interface StateType {
    userState: UserStateType;
    generalClient: AxiosInstance | null;
    unwrapClient: AxiosInstance | null;
    unwrapExtraClient: AxiosInstance | null;
    userConfig: {
        aceTheme: string;
    };
    displayBaseView: BaseViewDisplayType;
    baseContainerMaxWidth: string;
    baseContainerWidth: string | undefined;

};

const defaultState: StateType = {
    userState: {
        login: false,
        initialRequestDone: false,
        userData: {
            uid: -1,
            group: "",//用户组ID
            group_name: "",//用户组名
            backend_managable: false,//是否可以进行后台管理
            username: "",//用户名
            email: "",//电子邮件
            salt: "",//密码盐
            judgeStatus: {},
            appName: "",//应用名
            usePolling: true,//使用轮询
            // registerURL: "",//注册页面URL
            gravatarURL: "",//gravatar前缀,
            // usePhoneAuth: false,
            enablePhoneAuth: false,
            enableEmailAuth: false,
            requireAuthWhenRegistering: false,
            canUseImageStore: false,
            displayRepoInFooter: false,
            shouldDisplayFullProblemsetListByDefault: false,
            currentActiveTimedProblemset: null,
            maxProblemDifficulty: 0,
            minProblemDifficulty: 0,
            hasProblemManagePermission: false,
            hasProblemTagManagePermission: false,
            siteName: "HJ2",
            showPermissionPack: false,
            requireEmailWhenRegisteringUsePhone: true,
            badUsernamePrompt: "",
            usernameRegex: "",
            enableRemoteJudge: false,
            companyName: "HelloJudge2",
            difficultyDisplayMap: {},
            customExtraFooter: "",
            hasVisualProgrammingHomeworkUpdatePerm: false,
            visualProgrammingGradeLevel: [],
            realName: undefined,
            defaultLanguages: [],
            maxSubmissionCountPerUserPerVisualHomework: 1,
            hasOnlineVMManagePermission: false,
            hasVideoCourseManagePermission: false
        }
    },
    generalClient: null,
    unwrapClient: null,
    unwrapExtraClient: null,
    userConfig: {
        aceTheme: "github"
    },
    displayBaseView: "new",
    baseContainerMaxWidth: "75%",
    baseContainerWidth: undefined,

};

export interface SimpleAction extends Action<string> {
    readonly type: string;
    modify(arg0: StateType): StateType;
}
export function makeUserStateUpdateAction(login: boolean, userData: UserStateType["userData"]) {
    return {
        type: 'USERSTATE_UPDATE',
        modify: (state: StateType) => {
            let result: StateType = {
                ...state,
                userState: {
                    login: login,
                    userData: userData,
                    initialRequestDone: true
                }
            };
            return result;
        },
    } as SimpleAction;
}
export function makeDataStateUpdateAction(loaded: boolean) {
    return {
        type: 'DATASTATE_UPDATE',
        modify: (state: StateType) => {
            let result = {
                ...state,
                dataState: {
                    loaded: loaded
                }
            };
            return result;
        },
    } as SimpleAction;
}

export function makeClientUpdateAction(generalClient: AxiosInstance | null, unwrapClient: AxiosInstance | null, unwrapExtraClient: AxiosInstance | null) {
    return {
        type: "CLIENT_UPDATE",
        modify: (state: StateType) => ({
            ...state,
            generalClient: generalClient,
            unwrapClient: unwrapClient,
            unwrapExtraClient: unwrapExtraClient
        })
    } as SimpleAction;
}
export function makeDisplayBaseViewUpdateAction(display: BaseViewDisplayType) {
    return {
        type: "BASEVIEW_DISPLAY_UPDATE",
        modify: (state: StateType) => ({
            ...state,
            displayBaseView: display
        })
    } as SimpleAction;
}
const myReducer = (state = defaultState, action: SimpleAction) => {
    if (!action.type.startsWith('@@redux')) {
        return action.modify(state);
    } else {
        return state;
    }
};

const store = createStore(myReducer);

export { store };
export type { BaseViewDisplayType };
