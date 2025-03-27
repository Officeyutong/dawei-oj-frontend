import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Checkbox, Dimmer, Divider, Form, Grid, Header, Input, Loader, Segment, Table } from "semantic-ui-react";
import { timeStampToString, useCurrentUid, useDocumentTitle, useInputValue, usePasswordSalt } from "../../../common/Utils";
import { UserProfileResponseEditing } from "../client/types";
import userClient from "../client/UserClient";
import AceEditor from "react-ace";
import { useAceTheme } from "../../../states/StateUtils";
import { v4 as uuidv4 } from "uuid";
import ShowAllPermissions from "./ShowAllPermissions";
import { showErrorModal, showSuccessModal } from "../../../dialogs/Dialog";
import md5 from "md5";
import { PUBLIC_URL } from "../../../App";
import UserLink from "../../utils/UserLink";
import { useSelector } from "react-redux";
import { StateType } from "../../../states/Manager";
import UserCreditHistory from "./UserCreditHistory";
const ProfileEdit: React.FC<React.PropsWithChildren<{}>> = () => {
    const uid = parseInt(useParams<{ uid: string }>().uid);
    const [data, setData] = useState<UserProfileResponseEditing | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const pwd1 = useInputValue();
    const pwd2 = useInputValue();
    const aceTheme = useAceTheme();
    const [showing, setShowing] = useState(false);
    const salt = usePasswordSalt();
    const { showPermissionPack } = useSelector((s: StateType) => s.userState.userData);
    const [newAdminComment, setNewAdminComment] = useState("");
    const [showCreditHistory, setShowCreditHistory] = useState(false);
    useEffect(() => {
        if (!loaded) {
            (async () => {
                try {
                    setLoading(true);
                    const resp = await userClient.getUserProfile(uid, true);
                    if (resp.adminComment !== undefined) setNewAdminComment(resp.adminComment);
                    setData(resp);
                    setLoaded(true);
                } catch { } finally { setLoading(false); }
            })();
        }
    }, [loaded, uid]);
    useDocumentTitle(`${data?.username || "加载中..."} - 修改个人信息`);
    const baseUid = useCurrentUid();
    const submit = async () => {
        const changed = pwd1.value !== "";
        if (changed && pwd1.value !== pwd2.value) {
            showErrorModal("两次密码不相同！");
            return;
        }
        try {
            setLoading(true);
            const { code, message } = await userClient.updateProfile(uid, {
                banned: data!.banned,
                changePassword: changed,
                description: data!.description,
                email: data!.email,
                newPassword: md5(pwd1.value + salt),
                permission_group: data!.permission_group,
                permissions: data!.permissions,
                username: data!.username,
                real_name: data!.real_name,
                newAdminComment: data!.adminComment === undefined ? undefined : newAdminComment,
                belongingClassTeacher: data!.belongingClassTeacher
            });
            if (code === 0) showSuccessModal(message);
            else showErrorModal(message);
        } catch { } finally {
            setLoading(false);
        }
    };
    const toggleAdminMode = async () => {
        try {
            setLoading(true);
            await userClient.toggleAdminMode();
            window.location.reload();
        } catch { } finally { }
    };
    const syncXioeTechUid = async () => {
        try {
            setLoading(true);
            const { newID } = await userClient.requestSyncXiaoeTechUid(uid);
            setData({ ...data!, xiaoe_tech_uid: newID });
            showSuccessModal("同步完成")
        } catch { } finally { setLoading(false); }
    }
    const syncXiaoeTechTeams = async () => {
        try {
            setLoading(true);
            const resp = await userClient.requestSyncXiaoeTechPermissions(uid);
            showSuccessModal("您新获得了以下团队的权限:\n" + resp.join("\n"));
        } catch { } finally { setLoading(false); }
    };

    return <div>
        <Header as="h1">
            用户资料编辑
        </Header>
        <Segment stacked>
            {showCreditHistory && <UserCreditHistory uid={uid} onClose={() => setShowCreditHistory(false)}></UserCreditHistory>}
            {loading && data === null && <div style={{ height: "400px" }}><Dimmer active><Loader></Loader></Dimmer></div>}
            {data !== null && <div>
                {loading && data !== null && <Dimmer active> <Loader></Loader></Dimmer>}
                <Form autoComplete="off">
                    <input name="hidden" type="text" value="sssssss" readOnly style={{ display: "none" }} />
                    <Form.Field disabled>
                        <label>用户名</label>
                        <Input value={data.username} onChange={(_, d) => setData({ ...data, username: d.value })}></Input>
                    </Form.Field>
                    <Form.Field>
                        <label>电子邮箱</label>
                        <Input value={data.email} onChange={(_, d) => setData({ ...data, email: d.value })}></Input>
                    </Form.Field>
                    <Form.Field>
                        <label>个人简介</label>
                        <AceEditor
                            value={data.description}
                            onChange={v => setData({ ...data, description: v })}
                            mode="markdown"
                            theme={aceTheme}
                            name={uuidv4()}
                            width="100%"
                            height="400px"
                        ></AceEditor>
                    </Form.Field>
                    <Form.Field>
                        <label>头像</label>
                        请前往<Link to={`${PUBLIC_URL}/profile_image_edit/${uid}`}>头像编辑页面</Link>进行修改。
                    </Form.Field>
                    <Form.Field>
                        <label>姓名</label>
                        {data.selfHasUserManagerPerm ? <Input value={data.real_name || ""} onChange={(d, e) => setData({ ...data, real_name: d.target.value })}></Input> : (data.real_name || "<未填写姓名，请联系管理员>")}
                    </Form.Field>
                    <Form.Field>
                        <label>手机号验证</label>
                        {data.phone_verified ? <div>您的手机号码 {data.phone_number} 已经经过验证</div> : <div style={{ fontSize: "large" }}>请前往<a href="/phoneauth">此处</a>验证手机号</div>}
                    </Form.Field>
                    {showPermissionPack && <Form.Field>
                        <label>权限包领取</label>
                        {data.phone_verified ? <div> <a href="/permissionpack/user_packs" target="_blank">请前往此处进行操作</a></div> : <div style={{ fontSize: "large" }}>请先验证手机号后再尝试领取权限包！</div>}
                    </Form.Field>
                    }
                    {data.adminComment !== undefined && <Form.Field>
                        <label>管理侧备注</label>
                        <Input autoComplete="username" value={newAdminComment} onChange={(_, d) => setNewAdminComment(d.value)}></Input>
                    </Form.Field>}
                    <Form.Field>
                        <label>所属班主任</label>
                        {data.selfHasUserManagerPerm ? <Input value={data.belongingClassTeacher } onChange={(d, e) => setData({ ...data, belongingClassTeacher: d.target.value })}></Input> : data.belongingClassTeacher}
                    </Form.Field>
                    <Form.Field>
                        <label>积分</label>
                        {data.credit}，
                        <button className="link-button" onClick={() => setShowCreditHistory(true)}>显示历史积分变更记录</button>
                    </Form.Field>
                    <Form.Field>
                        <label>已授权团队</label>
                        <div style={{ overflowY: "scroll" }}>
                            <Table>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>团队</Table.HeaderCell>
                                        <Table.HeaderCell>授权者</Table.HeaderCell>
                                        <Table.HeaderCell>授权时间</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {data.grantedTeams.map(t => <Table.Row key={t.id}>
                                        <Table.Cell>
                                            <Link to={`${PUBLIC_URL}/team/${t.id}`}>{t.name}</Link>
                                        </Table.Cell>
                                        <Table.Cell><UserLink data={t.granter}></UserLink></Table.Cell>
                                        <Table.Cell>{timeStampToString(t.granted_time)}</Table.Cell>
                                    </Table.Row>)}
                                </Table.Body>
                            </Table>
                        </div>
                    </Form.Field>
                    {(data.selfHasPermissionManagePerm || data.selfHasUserManagerPerm) && <Form.Field>
                        <label>小鹅通UID</label>
                        {data.xiaoe_tech_uid === null ? (
                            data.selfHasUserManagerPerm ? <Button color="green" size="tiny" onClick={syncXioeTechUid}>点此同步</Button> : <p>没有同步权限</p>
                        ) : <div>{data.xiaoe_tech_uid}
                            {data.selfHasPermissionManagePerm ? <Button color="green" onClick={syncXiaoeTechTeams} size="tiny">获取用户在小鹅通加入的课程并授权用户加入对应团队</Button> : <p>没有同步权限</p>}
                        </div>}
                    </Form.Field>}
                    <Divider></Divider>
                    <Form.Field>
                        <label>更改密码(不需要请留空)</label>
                        <Form.Group widths="equal">
                            <Form.Field>
                                <label>密码</label>
                                <Input autoComplete="new-password" type="password" {...pwd1}></Input>
                            </Form.Field>
                            <Form.Field>
                                <label>重复密码</label>
                                <Input autoComplete="new-password" type="password" {...pwd2}></Input>
                            </Form.Field>
                        </Form.Group>
                    </Form.Field>
                    {data.selfHasPermissionManagePerm && <><Divider></Divider>
                        <Form.Field>
                            <label>权限组</label>
                            <Input value={data.permission_group} onChange={(_, d) => setData({ ...data, permission_group: d.value })}></Input>
                        </Form.Field>
                        <Form.Field>
                            <label>组权限列表</label>
                            <div>
                                <Grid columns="8">
                                    {data.group_permissions.map((x, i) => <Grid.Column key={i}>
                                        <div style={{ wordBreak: "break-word" }}>{x}</div>
                                    </Grid.Column>)}
                                </Grid>
                            </div>
                        </Form.Field>
                        <Form.Field>
                            <label>用户权限列表</label>
                            <AceEditor
                                value={data.permissions.join("\n")}
                                onChange={v => setData({ ...data, permissions: v.trim().split("\n") })}
                                mode="plain_text"
                                theme={aceTheme}
                                name={uuidv4()}
                                width="100%"
                                height="400px"
                            ></AceEditor>
                        </Form.Field>
                        <Button size="tiny" onClick={() => setShowing(true)} color="green">查看所有权限</Button></>}
                    {data.managable && <>
                        <Divider></Divider>
                        <Checkbox toggle label="账户封禁" checked={data.banned !== 0} onChange={(_, d) => setData({ ...data, banned: (d.checked ? 1 : 0) })}></Checkbox>
                    </>}
                    <Divider></Divider>
                    <Button color="green" onClick={submit}>提交</Button>
                    {data.canSetAdmin && baseUid === data.id && <Button color="green" onClick={toggleAdminMode}>
                        {data.permission_group === "admin" ? "关闭管理员模式" : "打开管理员模式"}
                    </Button>}
                </Form>
            </div>}
        </Segment>
        {showing && <ShowAllPermissions uid={uid} onClose={() => setShowing(false)}></ShowAllPermissions>}
    </div>;
};

export default ProfileEdit;
