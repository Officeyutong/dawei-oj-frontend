import { Button, Dimmer, Form, FormField, Grid, GridColumn, Header, Image, Input, Loader, Modal } from "semantic-ui-react";
import { useBackgroundColor, useDocumentTitle, useInputValue } from "../../common/Utils";
import Logo from "./assets/logo.png"
import Cat from "./assets/cat.png"
import { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import SendSMSCodeDialog from "../utils/SendSMSCode";
import { showErrorModal } from "../../dialogs/Dialog";
import { showSuccessPopup } from "../../dialogs/Utils";
import userClient from "../user/client/UserClient";
import { useSelector } from "react-redux";
import { StateType } from "../../states/Manager";

const VisualProgrammingSMSLogin: React.FC<{}> = () => {
  useBackgroundColor('#d6eefa')
  useDocumentTitle("手机验证码登录");
  const { initialRequestDone } = useSelector((s: StateType) => s.userState);
  const { login } = useSelector((s: StateType) => s.userState);
  const history = useHistory();
  const phone = useInputValue();
  const smsCode = useInputValue();
  const [showSendModal, setShowSendModal] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const handleSendSMS = () => {
    if (phone.value === '') {
      showErrorModal('请输入手机号')
      return;
    } else if (phone.value.length !== 11) {
      showErrorModal('请输入11位手机号！')
      return;
    } else {
      try {
        setLoading(true);
        setShowSendModal(true)
      } catch { } finally {
        setLoading(false);
      }
    }
  }

  const handleLogin = async () => {

    if (phone.value === '') {
      showErrorModal('请输入手机号')
      return;
    } else if (phone.value.length !== 11) {
      showErrorModal('请输入11位手机号！')
      return;
    } else if (smsCode.value === '') {
      showErrorModal('请输入验证码')
      return;
    } else {
      try {
        setLoading(true);
        await userClient.loginBySmsCode(phone.value, smsCode.value);
        showSuccessPopup("登录完成，将要跳转");
        setTimeout(() => {
          history.push('/rs/visual_programming/main')
        }, 500);
      } catch { } finally {
        setLoading(false);
      }
    }
  }
  useEffect(() => {
    if (initialRequestDone && login) {
      showSuccessPopup("您已经登录，将会跳转回主页");
      setTimeout(() => {
        history.push('/rs/visual_programming/main')
      }, 500);
    }
  }, [history, initialRequestDone, login])
  return (<>
    {loading && <Dimmer active>
      <Loader></Loader>
    </Dimmer>}
    <Image src={Logo} style={{ position: "absolute", margin: '2rem', userSelect: 'none' }}></Image>
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10rem' }}>
      <div style={{ backgroundColor: '#67aeda', width: '60rem', borderRadius: '2rem', border: '0.3rem solid', borderColor: 'white', boxShadow: '-5px 5px 5px 	#8e9ea6' }}>
        <div style={{ height: '35rem' }}>
          <Grid>
            <GridColumn width={12} style={{ height: '35rem', paddingBottom: "0", display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none' }} >
              <div style={{ height: '35rem', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: "2rem" }}>
                <Form style={{ width: '90%', maxHeight: '90%' }}>
                  <Header style={{ color: 'white', fontSize: '2.5rem' }}>短信验证码登录</Header>
                  <div style={{ backgroundColor: 'white', flex: '1', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignContent: 'center', paddingTop: "2rem", paddingBottom: "2rem", paddingInline: '5rem' }}>
                    <FormField>
                      <label style={{ fontSize: '1.5rem', fontWeight: 'normal' }}>手机号</label>
                      <Input {...phone} style={{ marginTop: '1rem', height: '4rem', borderRadius: '1rem', borderColor: 'gray' }} />
                    </FormField>
                    <FormField>
                      <label style={{ fontSize: '1.5rem', fontWeight: 'normal' }}>验证码</label>
                      <Input {...smsCode} style={{ marginTop: '1rem', height: '4rem', borderRadius: '1rem', borderColor: 'gray' }} />
                    </FormField>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                      <Button style={{ width: '8rem', height: "3.5rem", borderRadius: '1rem', marginRight: '4rem', backgroundColor: "#de5f50", color: 'white', fontSize: '1.5rem', padding: '0' }} onClick={handleSendSMS}>发送验证码</Button>
                      <Button style={{ width: '8rem', height: "3.5rem", borderRadius: '1rem', backgroundColor: "#a2c173", color: 'white', fontSize: '1.5rem', padding: '0' }} onClick={handleLogin}>登录</Button>
                      <Link to='/rs/visual_programming/login' style={{ display: 'block', textAlign: 'center', lineHeight: '3.5rem' }} >使用账号密码登录</Link>
                    </div>
                  </div>
                </Form>
              </div>
            </GridColumn>
            <GridColumn width={4} style={{ height: '35rem', paddingBottom: "0", userSelect: 'none' }}>
              <Image src={Cat} style={{ height: "35%", width: "75%", position: 'absolute', bottom: '0', right: '20px', userSelect: 'none' }}></Image>
            </GridColumn>
          </Grid>
          {showSendModal && phone && <Modal open closeOnDimmerClick={false}>
            <Modal.Content>
              <SendSMSCodeDialog
                autoCloseOnSuccees={true}
                phoneUsingState="must_use"
                phone={phone.value}
                onClose={() => {
                  setShowSendModal(false);
                }}
              ></SendSMSCodeDialog>
            </Modal.Content>
          </Modal>}
        </div >
      </div >
    </div >
  </>)
};

export default VisualProgrammingSMSLogin;
