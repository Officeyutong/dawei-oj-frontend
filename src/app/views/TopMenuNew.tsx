import { Col, Menu, Row } from "antd";
import { Link } from "react-router-dom";
import { PUBLIC_URL } from "../App";
import { BarChartOutlined, BarsOutlined, BookOutlined, CalculatorOutlined, CloudOutlined, CodeOutlined, CompassOutlined, ContainerOutlined, DashboardOutlined, DatabaseOutlined, DesktopOutlined, FileImageOutlined, GroupOutlined, HomeOutlined, LoginOutlined, LogoutOutlined, MergeOutlined, PlusOutlined, ProjectOutlined, TeamOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { StateType } from "../states/Manager";
import Logo from "../assets/logo.png";
import userClient from "./user/client/UserClient";
const TopMenuNew = () => {
    const alreadyLogin = useSelector((s: StateType) => s.userState.login);
    const { enableEmailAuth, enablePhoneAuth, requireAuthWhenRegistering, canUseImageStore, backend_managable, username, uid, showPermissionPack, hasVisualProgrammingHomeworkUpdatePerm, hasOnlineVMManagePermission } = useSelector((s: StateType) => s.userState.userData);
    return <Row>
        <Col span={3} offset={2} style={{ backgroundColor: "white", alignContent: "center", textAlign: "center" }}>
            {/* <img src={logo} alt="logo"></img> */}
            {/* <Typography.Title level={4}>{siteName}</Typography.Title> */}
            <img src={Logo} alt="david-logo" />
        </Col>
        <Col span={12}>
            <Menu
                mode="horizontal"
                items={[
                    {
                        label:
                            <Link to={`${PUBLIC_URL}/`}>主页</Link>
                        , key: "home", icon: <HomeOutlined></HomeOutlined>
                    },
                    { label: <Link to={`${PUBLIC_URL}/problems/1`}>题库</Link>, key: "problems", icon: <BarsOutlined></BarsOutlined> },
                    { label: <Link to={`${PUBLIC_URL}/submissions/1`}>提交</Link>, key: "submissions", icon: <DatabaseOutlined></DatabaseOutlined> },
                    { label: <Link to={`${PUBLIC_URL}/team`}>团队</Link>, key: "teams", icon: <TeamOutlined></TeamOutlined> },
                    { label: <Link to={`${PUBLIC_URL}/problemset/list/1`}>习题集</Link>, key: "problemset", icon: <BookOutlined></BookOutlined> },
                    { label: <Link to={`${PUBLIC_URL}/contests/1`}>比赛</Link>, key: "contest", icon: <CalculatorOutlined></CalculatorOutlined> },
                    { label: <Link to={`${PUBLIC_URL}/virtualcontest/list`}>虚拟比赛</Link>, key: "virtual-contest", icon: <BarChartOutlined></BarChartOutlined> },
                    {
                        label: "讨论与百科", key: "discussion", icon: <GroupOutlined></GroupOutlined>, children: [
                            {
                                type: "group", label: "讨论", children: [
                                    { label: <Link to={`${PUBLIC_URL}/discussions/discussion.global/1`}>闲聊区</Link>, key: "global-discussion" },
                                    { label: <Link to={`${PUBLIC_URL}/discussions/discussion.problem.global/1`}>题目板块</Link>, key: "problem-discussion" }
                                ]
                            },
                            {
                                type: "group", label: "百科", children: [
                                    { label: <a href="/wiki/page" target="_blank">百科</a>, key: "wiki" }
                                ]
                            }
                        ]
                    },
                    { label: <Link to={`${PUBLIC_URL}/ranklist/1`}>排名</Link>, key: "ranklist", icon: <ProjectOutlined></ProjectOutlined> },
                    ...(alreadyLogin ? [
                        {
                            label: "工具箱", key: "toolbox", icon: <DashboardOutlined></DashboardOutlined>,
                            children: [
                                {
                                    type: "group" as "group", label: "通用功能", children: [
                                        { label: <Link to={`${PUBLIC_URL}/ide`}>在线IDE</Link>, key: "ide", icon: <CodeOutlined></CodeOutlined> },
                                        { label: <Link to={`${PUBLIC_URL}/challenge/list`}>天梯</Link>, key: "challenge", icon: <ProjectOutlined></ProjectOutlined> },
                                        showPermissionPack ? { label: <Link to={`${PUBLIC_URL}/permissionpack/user_packs`}>权限包</Link>, key: "permission-pack", icon: <MergeOutlined></MergeOutlined> } : null,
                                        { label: <Link to={`${PUBLIC_URL}/blog/list/${uid}`}>博客</Link>, key: "blog", icon: <CloudOutlined></CloudOutlined> },
                                        { label: <Link to={`${PUBLIC_URL}/userproblemfilter/list`}>题目筛选</Link>, key: "problem-filter", icon: <ContainerOutlined></ContainerOutlined> },
                                        { label: <Link to={`${PUBLIC_URL}/monitoreduser/list`}>绑定用户</Link>, key: "monitored-user", icon: <DashboardOutlined></DashboardOutlined> },
                                        { label: <Link to={`${PUBLIC_URL}/visual_programming/main`}>图形化课程</Link>, key: "visual_programming", icon: <DesktopOutlined></DesktopOutlined> },
                                        (hasOnlineVMManagePermission ? { label: <Link to={`${PUBLIC_URL}/onlinevm/`}>在线NOI Linux环境</Link>, key: "onlinevm", icon: <CodeOutlined></CodeOutlined> } : null)
                                    ]
                                },
                                ((canUseImageStore || hasVisualProgrammingHomeworkUpdatePerm || hasOnlineVMManagePermission) ? {
                                    type: "group" as "group", label: "其他", children: [
                                        (canUseImageStore ? { label: <Link to={`${PUBLIC_URL}/imagestore/list`}>图片上传</Link>, key: "image-store", icon: <FileImageOutlined></FileImageOutlined> } : null),
                                        (hasVisualProgrammingHomeworkUpdatePerm ? { label: <Link to={`${PUBLIC_URL}/visual_programming_admin/management`}>可视化编程管理</Link>, key: "visualprogramming-admin", icon: <CompassOutlined></CompassOutlined> } : null),
                                        (hasOnlineVMManagePermission ? { label: <Link to={`${PUBLIC_URL}/onlinevm/admin`}>在线NOI Linux环境管理</Link>, key: "onlinevm-admin", icon: <CodeOutlined></CodeOutlined> } : null)
                                    ]
                                } : null)
                            ]
                        }

                    ] : []),
                ]}
            ></Menu>
        </Col>
        <Col span={5} style={{ backgroundColor: "white" }}>
            <Menu mode="horizontal" items={[
                ...(alreadyLogin ? [
                    { label: <Link to={`${PUBLIC_URL}/profile/${uid}`}>{username}</Link>, key: "profile" },
                    backend_managable ? { label: <Link to={`${PUBLIC_URL}/admin`}>后台管理</Link>, key: "backend", icon: <DashboardOutlined></DashboardOutlined> } : null,
                    { label: "登出", key: "logout", icon: <LogoutOutlined></LogoutOutlined> }
                ] : [
                    { label: <Link to={`${PUBLIC_URL}/login`}>登录</Link>, key: "login", icon: <LoginOutlined></LoginOutlined> },
                    ...(requireAuthWhenRegistering ? [
                        enablePhoneAuth ? { label: <Link to={`${PUBLIC_URL}/phone/register`}>手机号注册</Link>, icon: <PlusOutlined></PlusOutlined>, key: "phone-register" } : null,
                        enableEmailAuth ? { label: <Link to={`${PUBLIC_URL}/register`}>邮箱注册</Link>, icon: <PlusOutlined></PlusOutlined>, key: "email-register" } : null
                    ] : [
                        { label: <Link to={`${PUBLIC_URL}/register`}>注册</Link>, key: "register", icon: <PlusOutlined></PlusOutlined> }
                    ])
                ])
            ]}
                onClick={({ key }) => {
                    if (key === "logout") {
                        userClient.logout().then(() => window.location.reload());
                    }
                }}
            ></Menu>
        </Col>
    </Row>;
};
export default TopMenuNew;
