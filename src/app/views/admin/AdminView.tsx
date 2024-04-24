import React, { useEffect, useState } from "react";
import { Dimmer, Header, Loader, Tab } from "semantic-ui-react";
import { useDocumentTitle } from "../../common/Utils";
import PermissionPackList from "../permissionpack/PermissionPackList";
import { adminClient } from "./client/AdminClient";
import { AdminBasicInfo } from "./client/types";
// import ConfigPreviewTab from "./tabs/ConfigPreviewTab";
import FeedManagement from "./tabs/FeedManagement";
import GeneralView from "./tabs/GeneralTab";
import HomepageSwiperManagement from "./tabs/HomepageSwiperManagement";
import MiscManagement from "./tabs/MiscManagement";
import PermissionGroupTab from "./tabs/PermissionGroupTab";
import RatingManagement from "./tabs/RatingManagement";
import UserManagement from "./tabs/UserManagement";
import ProblemBatchUpload from "./tabs/ProblemBatchUplaod";
import UserBatchManagement from "./tabs/TeamGrant";
import BatchCreateUsers from "./tabs/BatchCreateUsers";
import XiaoeTechCourseBind from "./tabs/XiaoeTechCourseBind";
import { StateType } from "../../states/Manager";
import { useSelector } from "react-redux";

const AdminView: React.FC<React.PropsWithChildren<{}>> = () => {
    useDocumentTitle("后台管理");
    const [loaded, setLoaded] = useState(false);
    const [basicData, setBasicData] = useState<AdminBasicInfo | null>(null);
    useEffect(() => {
        if (!loaded) {
            (async () => {
                setBasicData(await adminClient.getAdminBasicInfo());
                setLoaded(true);
            })();
        }
    }, [loaded]);
    const { showPermissionPack } = useSelector((s: StateType) => s.userState.userData);
    return loaded ? <>
        <div>
            <Header as="h1">后台管理</Header>
            <Tab renderActiveOnly={false} panes={[
                { menuItem: "统计", pane: <Tab.Pane key={1}><GeneralView data={basicData!}></GeneralView></Tab.Pane> },
                { menuItem: "Rating管理", pane: <Tab.Pane key={2}><RatingManagement></RatingManagement></Tab.Pane> },
                // { menuItem: "设置预览", pane: <Tab.Pane key={3}><ConfigPreviewTab data={basicData!.settings}></ConfigPreviewTab></Tab.Pane> },
                { menuItem: "权限组设定", pane: <Tab.Pane key={4}><PermissionGroupTab></PermissionGroupTab></Tab.Pane> },
                { menuItem: "全局推送", pane: <Tab.Pane key={5}><FeedManagement></FeedManagement></Tab.Pane> },
                { menuItem: "主页轮播管理", pane: <Tab.Pane key={6}><HomepageSwiperManagement></HomepageSwiperManagement></Tab.Pane> },
                { menuItem: "权限包管理", pane: <Tab.Pane key={7}><PermissionPackList></PermissionPackList></Tab.Pane> },
                { menuItem: "用户管理", pane: <Tab.Pane key={8}><UserManagement></UserManagement></Tab.Pane> },
                { menuItem: "题目批量上传", pane: <Tab.Pane key={9}><ProblemBatchUpload></ProblemBatchUpload></Tab.Pane> },
                { menuItem: "团队批量授权", pane: <Tab.Pane key={10}><UserBatchManagement></UserBatchManagement></Tab.Pane> },
                { menuItem: "批量创建用户", pane: <Tab.Pane key={11}><BatchCreateUsers></BatchCreateUsers></Tab.Pane> },
                { menuItem: "小鹅通课程绑定管理", pane: <Tab.Pane key={12}><XiaoeTechCourseBind></XiaoeTechCourseBind></Tab.Pane> },
                { menuItem: "杂项", pane: <Tab.Pane key={13}><MiscManagement></MiscManagement></Tab.Pane> },
            ].filter(t => {
                if (!showPermissionPack && t.menuItem === "权限包管理") return false;
                return true;
            })}></Tab>
        </div>
    </> : <>
        <div style={{ height: "400px" }}>
            <Dimmer active>
                <Loader>加载数据中...</Loader>
            </Dimmer>
        </div>
    </>;
}

export default AdminView;
