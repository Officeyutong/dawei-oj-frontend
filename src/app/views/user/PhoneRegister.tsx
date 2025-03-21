/**
 * 手机号注册
 * */

import md5 from "md5";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Dimmer, Form, Header, Input, Loader, Message, Modal, Popup, Segment } from "semantic-ui-react";
import { useDocumentTitle, useInputValue } from "../../common/Utils";
import { showSuccessPopup } from "../../dialogs/Utils";
import { StateType } from "../../states/Manager";
import SendSMSCodeDialog from "../utils/SendSMSCode";
import userClient from "./client/UserClient";
import { useLocation } from "react-router-dom";
import QueryString from "qs";
import { LoginAndRegisterCustomCallback } from "./client/types";

const PhoneRegister: React.FC<React.PropsWithChildren<{}>> = () => {
    const location = useLocation();
    const parsedArgs = useMemo(() => {
        return QueryString.parse(location.search.substring(1)) as LoginAndRegisterCustomCallback;
    }, [location.search]);

    const username = useInputValue();
    const email = useInputValue();
    const phone = useInputValue();
    const authcode = useInputValue();
    const password1 = useInputValue();
    const password2 = useInputValue();
    const realName = useInputValue();
    const [errorMessage, setErrorMessage] = useState("");
    const cancelError = () => setErrorMessage("");
    const [sended, setSended] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showingModal, setShowingModal] = useState(false);
    const { salt, requireEmailWhenRegisteringUsePhone, usernameRegex, badUsernamePrompt } = useSelector((s: StateType) => s.userState.userData);
    const doRegister = async () => {
        if (password1.value !== password2.value) {
            setErrorMessage("两次密码输入不一致");
            return;
        }
        if (authcode.value === "") {
            setErrorMessage("请输入验证码");
            return;
        }
        if (username.value === "" || password1.value === "" || realName.value === "") {
            setErrorMessage("请输入用户名或密码或者姓名");
            return;
        }
        try {
            setLoading(true);
            await userClient.doPhoneRegister(username.value, md5(password1.value + salt), requireEmailWhenRegisteringUsePhone ? email.value : "default@bad-email", phone.value, authcode.value, realName.value);
            showSuccessPopup("注册完成，将要跳转");
            setTimeout(() => {
                if (parsedArgs.callback) window.location.href = parsedArgs.callback;
                else
                    window.location.href = ("/");
            }, 500);
        } catch {
            setLoading(false);
        }
    };
    const doSendCode = async () => {
        if (password1.value !== password2.value) {
            setErrorMessage("两次密码输入不一致");
            return;
        }
        if (username.value === "" || password1.value === "" || realName.value === "") {
            setErrorMessage("请输入用户名或密码或者姓名");
            return;
        }
        if (!/[0-9]{11}/.test(phone.value)) {
            setErrorMessage("请输入合法的11位国内手机号");
            return;
        }
        if (!new RegExp(usernameRegex).test(username.value)) {
            setErrorMessage(badUsernamePrompt);
            return;
        }
        try {
            await userClient.phonePreRegisterCheck(phone.value, username.value);
            setShowingModal(true);
        } catch { } finally {
            setLoading(false);
        }
    }
    useDocumentTitle("手机号注册");
    return <div>
        <Header as="h1">
            手机号注册
        </Header>
        <Segment stacked style={{ maxWidth: "500px" }}>
            {loading && <Dimmer active>
                <Loader></Loader>
            </Dimmer>}
            <Form error={errorMessage !== ""}>
                <Form.Field required>
                    <label>用户名</label>
                    <Popup
                        trigger={<Input disabled={sended} {...username} onClick={cancelError}></Input>}
                        on="focus"
                        content={`用户名用于在OJ系统中登录，必须与其他用户不同。${badUsernamePrompt}。注册后无法更改，如有特殊情况请联系管理员。`}
                        wide
                    ></Popup>
                </Form.Field>
                {requireEmailWhenRegisteringUsePhone && <Form.Field>
                    <label>邮箱</label>
                    <Input {...email} disabled={sended} onClick={cancelError}></Input>
                </Form.Field>}
                <Form.Field required>
                    <label>姓名</label>
                    <Popup
                        trigger={<Input {...realName} disabled={sended} onClick={cancelError}></Input>}
                        on="focus"
                        content={"请填写自己的姓名，而非家长的姓名。注册后非特殊情况无法更改。"}
                    ></Popup>
                </Form.Field>
                <Form.Group>
                    <Form.Field required>
                        <label>手机号</label>
                        <Popup
                            trigger={<Input {...phone} disabled={sended} onClick={cancelError}></Input>}
                            on="focus"
                            content="请填写11位国内手机号。注册后非特殊情况无法更改。"
                        ></Popup>
                    </Form.Field>
                    {sended && <Form.Field required>
                        <label>验证码</label>
                        <Input {...authcode} onClick={cancelError}></Input>
                    </Form.Field>}
                </Form.Group>
                <Form.Group>
                    <Form.Field required>
                        <label>密码</label>
                        <Popup
                            trigger={<Input type="password" {...password1} disabled={sended} onClick={cancelError}></Input>}
                            on="focus"
                            content="请填写一个自己能记住的密码。"
                        ></Popup>
                    </Form.Field>
                    <Form.Field required>
                        <label>重复密码</label>
                        <Popup
                            trigger={<Input type="password" {...password2} disabled={sended} onClick={cancelError}></Input>}
                            on="focus"
                            content="请重复输入一遍你的密码。"
                        ></Popup>
                    </Form.Field>
                </Form.Group>
                <Message error>
                    <Message.Header>错误</Message.Header>
                    <Message.Content>{errorMessage}</Message.Content>
                </Message>
                <Form.Button color="green" onClick={doSendCode}>发送验证码</Form.Button>
                {sended && <Form.Button color="green" onClick={doRegister}>提交</Form.Button>}
            </Form>
        </Segment>
        <Modal open={showingModal}>
            <Modal.Content><SendSMSCodeDialog
                autoCloseOnSuccees={false}
                phoneUsingState="must_not_use"
                onClose={() => { setShowingModal(false); setSended(true) }}
                phone={phone.value}
            ></SendSMSCodeDialog></Modal.Content>
        </Modal>
    </div>;
};

export default PhoneRegister;
