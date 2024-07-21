import { useSelector } from "react-redux";
import { StateType } from "../../../states/Manager";
import { CSSProperties, useEffect, useState } from "react";
import { UserProfileResponseEditing } from "../../user/client/types";
import userClient from "../../user/client/UserClient";
import { makeProfileImageURL, useBackgroundColor, useDocumentTitle, useInputValue, usePasswordSalt } from "../../../common/Utils";
import { Image, Dimmer, Grid, Header, Loader, Segment, Divider, Input, Popup, Button } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { PUBLIC_URL } from "../../../App";
import { showErrorModal, showSuccessModal } from "../../../dialogs/Dialog";
import md5 from "md5";

const GeneralDivStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
};

const LinkStyle: CSSProperties = {
    fontSize: "24px",
    paddingTop: "15px",
    paddingBottom: "15px",
    cursor: "pointer"
}

const VisualProgrammingProfileEdit: React.FC<{}> = () => {
    const { uid } = useSelector((s: StateType) => s.userState.userData);
    const { initialRequestDone } = useSelector((s: StateType) => s.userState);
    const [data, setData] = useState<UserProfileResponseEditing | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialRequestDone && data === null && uid !== -1) {
            (async () => {
                try {
                    setLoading(true);
                    setData(await userClient.getUserProfile(uid, true));
                    setLoading(false);
                } catch { } finally { setLoading(false); }
            })();
        }
    }, [data, initialRequestDone, uid]);
    useBackgroundColor('#d6eefa');
    useDocumentTitle(`个人设置 - ${data?.username || "加载中"}`);

    const newPassword = useInputValue();
    const repeatPassword = useInputValue();
    const salt = usePasswordSalt();

    const save = async () => {
        try {

            const changed = newPassword.value !== "";
            if (changed && newPassword.value !== repeatPassword.value) {
                showErrorModal("你想要修改密码，但是两次密码不相同");
                return;
            }
            setLoading(true);
            const { code, message } = await userClient.updateProfile(uid, {
                banned: data!.banned,
                changePassword: changed,
                description: data!.description,
                email: data!.email,
                newPassword: md5(newPassword.value + salt),
                permission_group: data!.permission_group,
                permissions: data!.permissions,
                username: data!.username,
                real_name: data!.real_name,
            });
            if (code === 0) showSuccessModal(message);
            else showErrorModal(message);
        } catch { } finally {
            setLoading(false);
        }
    };

    return <>
        {loading && <Dimmer active><Loader></Loader></Dimmer>}
        <div style={{ marginTop: "10%", marginLeft: "20%", marginRight: "20%" }}>
            {data !== null && <Grid columns={2} >
                <Grid.Row>
                    <Grid.Column width={4}>
                        <Segment style={{ flexDirection: "column", alignItems: "center", display: "flex" }}>
                            <div style={{ ...LinkStyle, paddingBottom: "10px", }}>基本信息</div>
                            <div style={{ ...LinkStyle, paddingTop: "10px" }}>账号设置</div>

                        </Segment>
                    </Grid.Column>
                    <Grid.Column width={12}>
                        <Segment>
                            <Header style={{ color: "#e6877c" }} as="h2">
                                基本信息
                            </Header>
                            <Grid columns={2}>
                                <Grid.Row>
                                    <Grid.Column width={1}></Grid.Column>
                                    <Grid.Column width={3} style={GeneralDivStyle}>
                                        <Header as="h3">头像</Header>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <Image style={GeneralDivStyle} size="tiny" circular src={makeProfileImageURL(uid)}></Image>
                                    </Grid.Column>
                                </Grid.Row>
                                <Grid.Row>
                                    <Grid.Column width={1}></Grid.Column>
                                    <Grid.Column width={3} style={GeneralDivStyle}>
                                        <Header as="h3">手机号</Header>
                                    </Grid.Column>
                                    <Grid.Column>
                                        {data.phone_verified ? data.phone_number : "手机号未验证"}
                                    </Grid.Column>
                                </Grid.Row>
                                <Grid.Row>
                                    <Grid.Column width={1}></Grid.Column>
                                    <Grid.Column width={3} style={GeneralDivStyle}>
                                        <Header as="h3">用户名</Header>
                                    </Grid.Column>
                                    <Grid.Column>
                                        {data.username}
                                    </Grid.Column>
                                </Grid.Row>
                                {data.real_name && <Grid.Row>
                                    <Grid.Column width={1}></Grid.Column>
                                    <Grid.Column width={3} style={GeneralDivStyle}>
                                        <Header as="h3">姓名</Header>
                                    </Grid.Column>
                                    <Grid.Column>
                                        {data.real_name}
                                    </Grid.Column>
                                </Grid.Row>}
                                <Grid.Row>
                                    <Grid.Column width={1}></Grid.Column>
                                    <Grid.Column width={3} style={GeneralDivStyle}>
                                        <Header as="h3">积分</Header>
                                    </Grid.Column>
                                    <Grid.Column>
                                        {data.credit}
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                            <Divider style={{ borderColor: "#67aeda", borderTop: "0" }}></Divider>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Header style={{ color: "#e6877c" }} as="h2">
                                    账号设置
                                </Header>
                                <Button style={{ backgroundColor: "#a2c173", color: "white" }} onClick={save} size="medium">保存</Button>
                            </div>
                            <Grid columns={2}>
                                <Grid.Row>
                                    <Grid.Column width={1}></Grid.Column>
                                    <Grid.Column width={3} style={GeneralDivStyle}>
                                        <Header as="h3">修改头像</Header>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <Link to={`${PUBLIC_URL}/profile_image_edit/${uid}`}>
                                            <Image style={GeneralDivStyle} size="tiny" circular src={makeProfileImageURL(uid)}></Image>
                                        </Link>
                                    </Grid.Column>
                                </Grid.Row>
                                <Grid.Row>
                                    <Grid.Column width={1}></Grid.Column>
                                    <Grid.Column width={3} style={GeneralDivStyle}>
                                        <Header as="h3">修改密码</Header>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <Popup
                                            trigger={<Input type="password" {...newPassword}></Input>}
                                            content="如果想要修改密码，请在此输入新的密码。如果不想要修改，请留空。"
                                        >
                                        </Popup>
                                    </Grid.Column>
                                </Grid.Row>
                                <Grid.Row>
                                    <Grid.Column width={1}></Grid.Column>
                                    <Grid.Column width={3} style={GeneralDivStyle}>
                                        <Header as="h3">重复密码</Header>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <Popup
                                            trigger={<Input type="password" {...repeatPassword}></Input>}
                                            content="请重复输入想要修改的密码"
                                        >
                                        </Popup>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Segment>
                    </Grid.Column>
                </Grid.Row>
            </Grid>}
        </div>
    </>
};

export default VisualProgrammingProfileEdit;
