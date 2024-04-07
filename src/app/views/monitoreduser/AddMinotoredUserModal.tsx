import { Button, Dimmer, Form, Input, List, Loader, Message, Modal } from "semantic-ui-react";
import { useInputValue } from "../../common/Utils";
import { useState } from "react";
import { AuthType } from "./client/types";
import monitoredUserClient from "./client/MonitoredUserClient";

enum AddType {
    ByUsername,
    ByPhone
}

interface AddMonitoredUserModalProps {
    onClose: (shouldRefresh: boolean) => void;
}
const AddMonitoredUserModal: React.FC<AddMonitoredUserModalProps> = ({ onClose }) => {
    const usernameOrPhone = useInputValue();
    const [codeSended, setCodeSended] = useState(false);
    const code = useInputValue();
    const [authType, setAuthType] = useState<AuthType>("phone");
    const [loading, setLoading] = useState(false);
    const [addType, setAddType] = useState<AddType>(AddType.ByUsername);
    const sendCode = async () => {
        try {
            setLoading(true);
            if (addType === AddType.ByPhone) {
                await monitoredUserClient.requestAddByPhone(usernameOrPhone.value);
            } else {
                await monitoredUserClient.requestAdd(usernameOrPhone.value, authType);
            }
            setCodeSended(true);
        } catch { } finally {
            setLoading(false);
        }
    };
    const confirm = async () => {
        try {
            setLoading(true);
            if (addType === AddType.ByPhone) {
                await monitoredUserClient.confirmAddByPhone(usernameOrPhone.value, code.value);
            } else {
                await monitoredUserClient.confirmAdd(usernameOrPhone.value, authType, code.value);
            }
            onClose(true);
        } catch {
            setLoading(false);
        } finally {
        }
    };
    return <Modal open size="small">
        <Modal.Header>添加用户</Modal.Header>
        <Modal.Content>
            {loading && <Dimmer active><Loader></Loader></Dimmer>}
            <Form>
                <Form.Group inline>
                    <Form.Radio disabled={codeSended} label="使用手机号添加" checked={addType === AddType.ByPhone} onChange={() => setAddType(AddType.ByPhone)}></Form.Radio>
                    <Form.Radio disabled={codeSended} label="使用用户名添加" checked={addType === AddType.ByUsername} onChange={() => setAddType(AddType.ByUsername)}></Form.Radio>
                </Form.Group>
                {addType === AddType.ByUsername && <>
                    <Form.Field disabled={codeSended}>
                        <label>对方用户名</label>
                        <Input {...usernameOrPhone}></Input>
                    </Form.Field>
                    <Form.Group inline disabled={codeSended}>
                        <label>验证方式</label>
                        <Form.Radio disabled={codeSended} label="短信验证码" checked={authType === "phone"} onChange={() => setAuthType("phone")}></Form.Radio>
                        <Form.Radio disabled={codeSended} label="邮箱验证码" checked={authType === "email"} onChange={() => setAuthType("email")}></Form.Radio>
                    </Form.Group>
                </>}
                {addType === AddType.ByPhone && <Form.Field>
                    <label>对方手机号</label>
                    <Input {...usernameOrPhone}></Input>
                </Form.Field>}
                {codeSended && <Form.Field>
                    <label>验证码</label>
                    <Input {...code}></Input>
                </Form.Field>}
            </Form>
            <Message info>
                <Message.Header>提示</Message.Header>
                <Message.Content>
                    <List>
                        <List.Item>绑定用户的过程中需要通过向被绑定用户所使用的邮箱或者手机号发送验证码来完成绑定过程，同时您需要提供被绑定用户的手机号或者用户名。</List.Item>
                        <List.Item>绑定完成后，您可以随时在网站上查看被绑定用户的学习统计情况。如果您绑定了微信账号，那么被绑定用户的学习情况也会推送给您。</List.Item>
                    </List>
                </Message.Content>
            </Message>
        </Modal.Content>
        <Modal.Actions>
            <Button color="red" disabled={loading} onClick={() => onClose(false)}>取消</Button>
            <Button color="blue" onClick={sendCode} disabled={loading}>发送验证码</Button>
            {codeSended && <Button color="green" onClick={confirm} disabled={loading}>提交</Button>}
        </Modal.Actions>
    </Modal>
};

export default AddMonitoredUserModal;
