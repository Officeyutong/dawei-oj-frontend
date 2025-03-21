/**
 * 邮箱注册
 * */
import md5 from "md5";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Dimmer, Form, Header, Input, Loader, Message, Segment } from "semantic-ui-react";
import { useDocumentTitle, useInputValue } from "../../common/Utils";
import { showErrorModal, showSuccessModal } from "../../dialogs/Dialog";
import { showSuccessPopup } from "../../dialogs/Utils";
import { StateType } from "../../states/Manager";
import userClient from "./client/UserClient";
import { PUBLIC_URL } from "../../App";
import { Link, useLocation } from "react-router-dom";
import { LoginAndRegisterCustomCallback } from "./client/types";
import QueryString from "qs";

const EmailRegister = () => {
    const location = useLocation();
    const parsedArgs = useMemo(() => {
        return QueryString.parse(location.search.substring(1)) as LoginAndRegisterCustomCallback;
    }, [location.search]);
    const username = useInputValue();
    const email = useInputValue();
    const password1 = useInputValue();
    const password2 = useInputValue();
    const realName = useInputValue();
    const [loading, setLoading] = useState(false);
    const salt = useSelector((s: StateType) => s.userState.userData.salt);
    const enablePhoneAuth = useSelector((s: StateType) => s.userState.userData.enablePhoneAuth);
    const doRegister = async () => {
        if (username.value === "" || email.value === "" || password1.value === "" || password2.value === "" || realName.value === "") {
            showErrorModal("请输入完整的信息");
            return;
        }
        if (password1.value !== password2.value) {
            showErrorModal("两次密码不匹配");
            return;
        }
        try {
            setLoading(true);
            const { code, message } = await userClient.doEmailRegister(username.value, md5(password1.value + salt), email.value, realName.value);
            if (code === 2) {
                showSuccessModal(message)
            } else if (code === 0) {
                showSuccessPopup("注册成功，即将跳转");
                setTimeout(() => {
                    if (parsedArgs.callback) window.location.href = parsedArgs.callback;
                    else
                        window.location.href = ("/");
                }, 500);
            } else {
                showErrorModal(String(message));
            }

        } catch (e) {
        } finally { setLoading(false); }
    };
    useDocumentTitle("邮箱注册");
    return <div>
        <Header as="h1">
            注册
        </Header>
        <Segment stacked style={{ maxWidth: "70%" }}>
            {loading && <Dimmer active><Loader></Loader></Dimmer>}
            <Form>
                <Form.Field>
                    <label>用户名</label>
                    <Input {...username} ></Input>
                </Form.Field>
                <Form.Field>
                    <label>邮箱</label>
                    <Input {...email} ></Input>
                </Form.Field>
                <Form.Field>
                    <label>姓名</label>
                    <Input {...realName}></Input>
                </Form.Field>
                <Form.Group>
                    <Form.Field>
                        <label>密码</label>
                        <Input type="password" {...password1} ></Input>
                    </Form.Field>
                    <Form.Field>
                        <label>重复密码</label>
                        <Input type="password" {...password2} ></Input>
                    </Form.Field>
                </Form.Group>
                <Message>
                    <Message.Header>警告</Message.Header>
                    <Message.Content>
                        <p>用户名和姓名在注册后无法更改</p>
                        <p>姓名不会对普通用户公开</p>
                    </Message.Content>
                </Message>
                <Form.Button color="green" onClick={doRegister}>注册</Form.Button>
                {enablePhoneAuth && <Link to={`${PUBLIC_URL}/phone/register`}>手机号注册</Link>}
            </Form>
        </Segment>
    </div>;
};

export default EmailRegister;
