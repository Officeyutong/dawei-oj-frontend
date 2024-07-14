import { Button, Container, Form, Header, Segment } from "semantic-ui-react"
import { useInputValue } from "../../common/Utils";
import { showErrorModal } from "../../dialogs/Dialog";
import { useState } from "react";
import { Link } from "react-router-dom";
import userClient from "../user/client/UserClient";
import { PUBLIC_URL } from "../../App";
import { StateType } from "../../states/Manager";
import { useSelector } from "react-redux";
import md5 from "md5";

const WechatStatisticsUsernameLogin = () => {
    const username = useInputValue("");
    const password = useInputValue("");
    const [loading, setLoading] = useState(false);
    const salt = useSelector((s: StateType) => s.userState.userData.salt);
    const doUsernameLogin = async () => {
        if (username.value.trim() === "" || password.value.trim() === "") {
            showErrorModal("请输入用户名和密码");
            return;
        }
        try {
            setLoading(true);
            await userClient.doLogin(username.value, md5(password.value + salt), false);
            window.location.href = `${PUBLIC_URL}/wechat_statistics_view/list`;

        } catch { } finally { setLoading(false); }
    }
    return <Container>
        <Header as="h1">登录</Header>
        <Segment stacked>
            <Form style={{ marginBottom: "10px" }}>
                <Form.Input disabled={loading} {...username} label="用户名"></Form.Input>
                <Form.Input disabled={loading} {...password} label="密码" type="password"></Form.Input>
                <Button loading={loading} onClick={doUsernameLogin} color="blue">登录</Button>
            </Form>
            <Link to={`${PUBLIC_URL}/wechat_statistics_view/login`}>使用手机号登录</Link>
        </Segment>
    </Container>
};

export default WechatStatisticsUsernameLogin;
