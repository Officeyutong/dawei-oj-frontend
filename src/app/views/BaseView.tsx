import useResizeObserver from "@react-hook/resize-observer";
import React, { RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Icon, Menu, Image, Container as SMContainer, Popup } from "semantic-ui-react";
import { axiosObj, PUBLIC_URL } from "../App";
import { StateType } from "../states/Manager";
import TimedProblemSetCard from "./TimedProblemsetCard";
import { makeProfileImageURL } from "../common/Utils";

const useSize = (target: RefObject<HTMLElement>) => {
    const [size, setSize] = useState<DOMRect>()

    useLayoutEffect(() => {
        setSize(target.current!.getBoundingClientRect())
    }, [target])

    useResizeObserver(target, (entry) => setSize(entry.contentRect))
    return size
}

const Container = React.memo((({ child }) => {
    return <>{child}</>
}) as React.FC<React.PropsWithChildren<{ child: React.ReactNode }>>);
const BaseView: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const userState = useSelector((s: StateType) => s.userState);
    const logout = () => {
        axiosObj.post("/api/logout").then(() => window.location.reload());
    };
    const { enableEmailAuth, enablePhoneAuth, requireAuthWhenRegistering, showPermissionPack, companyName, customExtraFooter } = useSelector((s: StateType) => s.userState.userData);
    const [width, setWidth] = useState(document.documentElement.clientWidth);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const sidebarRect = useSize(sidebarRef);
    useEffect(() => {
        const listener = (e: UIEvent) => {
            setWidth(document.documentElement.clientWidth);
        };
        window.addEventListener("resize", listener);
        return () => window.removeEventListener("resize", listener);
    });

    const hasActiveTimedProblemset = useSelector((s: StateType) => s.userState.userData.currentActiveTimedProblemset !== null);
    const sideMenu = <Menu vertical icon="labeled">
        <Menu.Item as={Link} to={`${PUBLIC_URL}/`}>
            <Icon name="home"></Icon>
            主页
        </Menu.Item>
        <Menu.Item as={Link} to={`${PUBLIC_URL}/problems/1`}>
            <Icon name="tasks"></Icon>
            题库
        </Menu.Item>
        <Menu.Item as={Link} to={`${PUBLIC_URL}/submissions/1`}>
            <Icon name="hdd"></Icon>
            提交
        </Menu.Item>
        <Menu.Item as={Link} to={`${PUBLIC_URL}/team`}>
            <Icon name="address book"></Icon>
            团队
        </Menu.Item>
        <Menu.Item as={Link} to={`${PUBLIC_URL}/challenge/list`}>
            <Icon name="chart bar"></Icon>
            天梯
        </Menu.Item>
        <Menu.Item as={Link} to={`${PUBLIC_URL}/problemset/list/1`}>
            <Icon name="book"></Icon>
            习题集
        </Menu.Item>
        <Menu.Item as={Link} to={`${PUBLIC_URL}/contests/1`}>
            <Icon name="chart line"></Icon>
            比赛
        </Menu.Item>
        <Popup
            position="right center"
            pinned
            on="click"
            trigger={<Menu.Item style={{ cursor: "pointer" }}>
                <Icon name="keyboard outline"></Icon>
                讨论 百科
            </Menu.Item>}
        >
            <Menu icon="labeled">
                <Menu.Item as={Link} to={`${PUBLIC_URL}/discussions/discussion.global/1`}>闲聊区</Menu.Item>
                <Menu.Item as={Link} to={`${PUBLIC_URL}/discussions/discussion.problem.global/1`}>题目板块</Menu.Item>
                <Menu.Item as="a" target="_blank" href="/wiki/page">百科</Menu.Item>
            </Menu>
        </Popup>
        <Menu.Item as={Link} to={`${PUBLIC_URL}/ranklist/1`}>
            <Icon name="signal"></Icon>
            排名
        </Menu.Item>
        {userState.login && <>
            <Popup
                position="right center"
                pinned
                on="click"
                trigger={<Menu.Item >
                    <Icon name="cog"></Icon>
                    工具箱
                </Menu.Item>}
            >
                <Menu icon="labeled">
                    <Menu.Item as={Link} to={`${PUBLIC_URL}/ide`}>
                        <Icon name="code"></Icon>
                        在线IDE
                    </Menu.Item>
                    {userState.userData.canUseImageStore && <Menu.Item as={Link} to={`${PUBLIC_URL}/imagestore/list`}>
                        <Icon name="image"></Icon>
                        图片上传
                    </Menu.Item>}
                    <Menu.Item as={Link} to={`${PUBLIC_URL}/virtualcontest/list`}>
                        <Icon name="chart line"></Icon>
                        虚拟比赛
                    </Menu.Item>
                    {showPermissionPack && <Menu.Item as={Link} to={`${PUBLIC_URL}/permissionpack/user_packs`}>
                        <Icon name="exchange"></Icon>
                        权限包
                    </Menu.Item>}
                    <Menu.Item as={Link} to={`${PUBLIC_URL}/blog/list/${userState.userData.uid}`}>
                        <Icon name="address card"></Icon>
                        博客
                    </Menu.Item>
                    <Menu.Item as={Link} to={`${PUBLIC_URL}/preliminary/list`}>
                        <Icon name="clipboard outline"></Icon>
                        笔试题库
                    </Menu.Item>
                    <Menu.Item as={Link} to={`${PUBLIC_URL}/userproblemfilter/list`}>
                        <Icon name="tasks"></Icon>
                        题目筛选
                    </Menu.Item>
                    <Menu.Item as={Link} to={`${PUBLIC_URL}/monitoreduser/list`}>
                        <Icon name="bell"></Icon>
                        绑定用户
                    </Menu.Item>
                </Menu>

            </Popup>
        </>}
        <Menu.Item as={Link} to={`${PUBLIC_URL}/help`}>
            <Icon name="help circle"></Icon>
            帮助
        </Menu.Item>
        {userState.login ? <>
        </> : <>
            <Menu.Item as={Link} to={`${PUBLIC_URL}/login`}>
                请登录...
            </Menu.Item>
            {requireAuthWhenRegistering ? <>
                {enableEmailAuth && <Menu.Item as={Link} to={`${PUBLIC_URL}/register`}>
                    邮箱注册...
                </Menu.Item>}
                {enablePhoneAuth && <Menu.Item as={Link} to={`${PUBLIC_URL}/phone/register`}>
                    手机号注册...
                </Menu.Item>}
            </> : <Menu.Item onClick={() => window.location.href = "/register"}>
                注册...
            </Menu.Item>}

        </>}
        {userState.userData.backend_managable && <Menu.Item as={Link} to={`${PUBLIC_URL}/admin`}>
            <Icon name="sitemap"></Icon>
            后台管理
        </Menu.Item>}
        {userState.login && <>
            <Menu.Item as={Link} to={`${PUBLIC_URL}/profile/${userState.userData.uid}`}>
                <Image avatar src={makeProfileImageURL(userState.userData.uid)}></Image>
                <span>{userState.userData.username}</span>
            </Menu.Item>
            <Menu.Item onClick={logout} >
                <Icon name="x"></Icon>
                登出
            </Menu.Item>
        </>}
    </Menu>

    const mainBody = <>
        <SMContainer style={{ width: "100%" }}>
            <div style={{ width: "100%", marginBottom: "70px" }}>
                <Container child={children}></Container>
            </div>
        </SMContainer>
        <SMContainer textAlign="center">
            <div style={{ color: "darkgrey" }} >
                {userState.userData.displayRepoInFooter ? <>
                    {userState.userData.appName} powered by <a href="https://github.com/Officeyutong/HelloJudge2">HelloJudge2</a>
                </> : <>
                    {userState.userData.appName} by {companyName}
                </>
                }
            </div>
            {customExtraFooter && <div style={{ color: "darkgrey" }} >{customExtraFooter}</div>}
        </SMContainer>
    </>;
    const sidebarWidth = (sidebarRect?.width || 0) + 10;

    return <>
        <div ref={sidebarRef} style={{ position: "fixed", overflowY: "scroll", height: "100%", left: 0, top: 0 }}>
            {sideMenu}
        </div>
        {hasActiveTimedProblemset &&
            <TimedProblemSetCard extraStyle={{ position: "fixed", bottom: 0, left: sidebarWidth + 20, zIndex: 999 }}></TimedProblemSetCard>
        }
        <div style={{ position: "absolute", left: `${sidebarWidth}px`, width: `${width - (sidebarWidth)}px` }}>
            {mainBody}
        </div>
    </>
}

export default BaseView;
