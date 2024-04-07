import { useState } from "react";
import { Button, Dimmer, Form, Header, Input, Loader, Modal, Segment } from "semantic-ui-react";
import { useInputValue } from "../../common/Utils";
import SendSMSCodeDialog from "../utils/SendSMSCode";
import userClient from "./client/UserClient";
import { Link } from "react-router-dom";
import { PUBLIC_URL } from "../../App";

const PhoneLogin = () => {
    const [loading, setLoading] = useState(false);
    const [showSendModal, setShowSendModal] = useState(false);
    const [sended, setSended] = useState(false);
    const code = useInputValue("");
    const phone = useInputValue("");
    const login = async () => {
        try {
            setLoading(true);
            await userClient.loginBySmsCode(phone.value, code.value);
            window.location.href = "/";
        } catch { } finally {
            setLoading(false);
        }
    };
    return <div>
        <Header as="h1">
            短信验证码登录
        </Header>
        <Segment stacked style={{ maxWidth: "35%" }}>
            {loading && <Dimmer active>
                <Loader></Loader>
            </Dimmer>}
            <Form>
                <Form.Field>
                    <Link to={`${PUBLIC_URL}/login`}>使用密码登录</Link>
                </Form.Field>
                <Form.Field>
                    <label>手机号码</label>
                    <Input disabled={sended} {...phone}></Input>
                </Form.Field>
                {sended && <Form.Field>
                    <label>验证码</label>
                    <Input {...code}></Input>
                </Form.Field>}
                <Button color="green" onClick={() => setShowSendModal(true)}>
                    发送验证码
                </Button>
                {sended && <Button color="green" onClick={login}>
                    登录
                </Button>}
            </Form>
        </Segment>
        {showSendModal && <Modal open closeOnDimmerClick={false}>
            <SendSMSCodeDialog
                // mustNotUse={false}
                phoneUsingState="must_use"
                phone={phone.value}
                onClose={() => {
                    setShowSendModal(false);
                    setSended(true);
                }}
            ></SendSMSCodeDialog>
        </Modal>}
    </div>
};

export default PhoneLogin;
