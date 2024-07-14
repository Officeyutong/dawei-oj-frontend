import { Button, Container, Form, Header, Modal, Segment } from "semantic-ui-react";
import { useDocumentTitle, useInputValue } from "../../common/Utils";
import { useEffect, useState } from "react";
import SendSMSCodeDialog from "../utils/SendSMSCode";
import { useSelector } from "react-redux";
import { StateType } from "../../states/Manager";
import { Link, useHistory } from "react-router-dom";
import { PUBLIC_URL } from "../../App";
import userClient from "../user/client/UserClient";
import { showErrorModal } from "../../dialogs/Dialog";
const WechatStatisticaLogin = () => {
    const phone = useInputValue("");
    const code = useInputValue("");
    const [codeSended, setCodeSended] = useState(false);
    const [showSendModal, setShowSendModal] = useState(false);
    useDocumentTitle("登录");
    const alreadyLogin = useSelector((s: StateType) => s.userState.login);
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (alreadyLogin) {
            history.push(`${PUBLIC_URL}/wechat_statistics_view/list`);
        }
    }, [alreadyLogin, history]);
    const doPhoneLogin = async () => {
        if (phone.value.trim() === "") {
            showErrorModal("请输入手机号");
            return;
        }
        try {
            setLoading(true);
            await userClient.loginBySmsCode(phone.value, code.value);
            window.location.href = `${PUBLIC_URL}/wechat_statistics_view/list`;
        } catch { } finally {
            setLoading(false);
        }
    };

    return <Container>
        <Header as="h1">登录</Header>
        <Segment stacked>

            <Form style={{ marginBottom: "10px" }}>
                <Form.Input disabled={codeSended} label="手机号" {...phone} />
                {codeSended && <Form.Input label="短信验证码" {...code}></Form.Input>}
                <Form.Button disabled={loading} color="green" onClick={() => setShowSendModal(true)}>发送验证码</Form.Button>
                {codeSended && <Button loading={loading} onClick={doPhoneLogin} color="blue">登录</Button>}
            </Form>
            <Link to={`${PUBLIC_URL}/wechat_statistics_view/username_login`}>使用用户名登录</Link>
        </Segment>
        {showSendModal && <Modal size="tiny" open closeOnDimmerClick={false}>
            <Modal.Header>发送短信验证码</Modal.Header>
            <Modal.Content>
                <SendSMSCodeDialog
                    autoCloseOnSuccees={false}
                    phoneUsingState="must_use"
                    phone={phone.value}
                    onClose={() => {
                        setShowSendModal(false);
                        setCodeSended(true);
                    }}
                ></SendSMSCodeDialog>
            </Modal.Content>
        </Modal>}
    </Container>;
};

export default WechatStatisticaLogin;
