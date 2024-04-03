/**
 * 邮箱注册验证邮箱
 * 
 * 
 * */
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Dimmer, Form, Header, Input, Loader, Segment } from "semantic-ui-react";
import { useDocumentTitle, useInputValue } from "../../common/Utils";
import { showSuccessPopup } from "../../dialogs/Utils";
import userClient from "./client/UserClient";
import QueryString from "qs";
import { showErrorModal, showSuccessModal } from "../../dialogs/Dialog";
import { useSelector } from "react-redux";
import { StateType } from "../../states/Manager";
import md5 from "md5";

interface QSType {
    type?: "register" | "reset_password" | "change_email";
    // email?: string;
    code?: string
}

enum DummyType {
    ResetPassword,
    None
}

const EmailAuth: React.FC<React.PropsWithChildren<{}>> = () => {
    const location = useLocation();
    const parsed: QSType = QueryString.parse(location.search.substring(1));
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [dummyType, setDummyType] = useState<DummyType>(DummyType.None);
    const salt = useSelector((s: StateType) => s.userState.userData.salt);
    const password = useInputValue();
    useDocumentTitle("验证邮箱");
    useEffect(() => {
        if (!loaded) {
            (async () => {
                try {
                    if (parsed.type === "change_email") {
                        await userClient.doChangeEmailConfirm(parsed.code!);
                        showSuccessPopup("认证成功，即将跳转");
                        setTimeout(() => window.location.href = "/", 500);
                    } else if (parsed.type === "register") {
                        await userClient.doEmailAuth(parsed.code!);
                        showSuccessPopup("认证成功，即将跳转");
                        setTimeout(() => window.location.href = "/", 500);
                    } else if (parsed.type === "reset_password") {
                        setDummyType(DummyType.ResetPassword);
                    } else {
                        showErrorModal(`不支持的类型: ${parsed.type}`);
                        throw new Error();
                    }
                    setLoaded(false);
                } catch { } finally {

                }
            })();
        }
    }, [loaded, parsed]);
    const doReset = async () => {
        try {
            setLoading(true);
            await userClient.doEmailResetPassword(md5(password.value + salt), parsed.code!);
            showSuccessModal("操作完成，请使用新密码登录")
        } catch { } finally {
            setLoading(false);
        }
    }
    return <div style={{ maxWidth: "500px" }}>
        <Header as="h1">
            验证邮箱
        </Header>
        <Segment stacked>
            {loading && <Dimmer active>
                <Loader></Loader>
            </Dimmer>}
            {/* <Form>
                <Form.Field>
                    <label>用户名(非邮箱)</label>
                    <Input {...username}></Input>
                </Form.Field>
                <Form.Button color="green" onClick={doReset}> 提交</Form.Button>
            </Form> */}
            {dummyType === DummyType.ResetPassword && <Form>
                <Form.Field>
                    <label>新密码</label>
                    <Input {...password} type="password"></Input>
                </Form.Field>
                <Form.Button color="green" onClick={doReset}> 提交</Form.Button>
            </Form>}
        </Segment>
    </div>;
};

export default EmailAuth;
