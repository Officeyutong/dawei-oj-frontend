import { Button, Dimmer, Form, FormField, Grid, GridColumn, Header, Image, Input, Loader, Modal, Popup } from "semantic-ui-react";
import { useBackgroundColor, useDocumentTitle, useInputValue, usePasswordSalt } from "../../common/Utils";
import Cat from "./assets/cat.png"
import { useState } from "react";
import { Link } from "react-router-dom";
import SendSMSCodeDialog from "../utils/SendSMSCode";
import { showSuccessPopup } from "../../dialogs/Utils";
import { showErrorModal } from "../../dialogs/Dialog";
import { useSelector } from "react-redux";
import { StateType } from "../../states/Manager";
import userClient from "../user/client/UserClient";
import md5 from "md5";

const VisualProgrammingRegister: React.FC<{}> = () => {
  useBackgroundColor('#d6eefa')
  useDocumentTitle("注册账号");
  const [loading, setLoading] = useState<boolean>(false)
  const [showSendModal, setShowSendModal] = useState<boolean>(false)
  const phone = useInputValue();
  const smsCode = useInputValue();
  const userName = useInputValue();
  const pwd = useInputValue();
  const repeatPwd = useInputValue();
  const realName = useInputValue();
  const salt = usePasswordSalt();
  const { usernameRegex, badUsernamePrompt } = useSelector((s: StateType) => s.userState.userData);

  const handleSendSMS = () => {
    if (pwd.value !== repeatPwd.value) {
      showErrorModal("两次密码输入不一致");
      return;
    } else if (userName.value === "" || pwd.value === "" || realName.value === "") {
      showErrorModal("请输入用户名或密码或者姓名");
      return;
    } else if (phone.value === '') {
      showErrorModal('请输入手机号')
      return;
    } else if (phone.value.length !== 11) {
      showErrorModal('请输入11位手机号！')
      return;
    } else if (!new RegExp(usernameRegex).test(userName.value)) {
      showErrorModal(badUsernamePrompt);
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
  const handleRegister = async () => {
    if (pwd.value !== repeatPwd.value) {
      showErrorModal("两次密码输入不一致");
      return;
    }
    if (smsCode.value === "") {
      showErrorModal("请输入验证码");
      return;
    }
    if (userName.value === "" || pwd.value === "" || realName.value === "") {
      showErrorModal("请输入用户名或密码或者姓名");
      return;
    }
    try {
      setLoading(true);
      await userClient.doPhoneRegister(userName.value, md5(pwd.value + salt), "default@bad-email", phone.value, smsCode.value, realName.value);
      showSuccessPopup("注册完成，将要跳转");
      setTimeout(() => {
        window.location.href = '/visual_programming/main'
      }, 500);
    } catch {
      setLoading(false);
    }
  }
  return (<>
    {loading && <Dimmer active>
      <Loader></Loader>
    </Dimmer>}
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10rem' }}>
      <div style={{ backgroundColor: '#67aeda', width: '70rem', borderRadius: '2rem', border: '0.3rem solid', borderColor: 'white', boxShadow: '-5px 5px 5px 	#8e9ea6' }}>
        <div style={{ height: '45rem' }}>
          <Grid>
            <GridColumn width={12} style={{ height: '45rem', paddingBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none' }} >
              <div style={{ height: '45rem', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'white', borderRadius: '1.5rem' }}>
                <Form style={{ width: '90%', maxHeight: '90%' }}>
                  <Header style={{ fontSize: '2.5rem' }}>注册</Header>
                  <div style={{ flex: '1', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignContent: 'center', paddingTop: "2rem", paddingBottom: "2rem", paddingInline: '2rem' }}>
                    <FormField>
                      <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <label style={{ fontSize: '1.5rem', fontWeight: 'normal', width: '10rem', lineHeight: '4rem' }}>用户名</label>
                        <Popup
                          trigger={<Input {...userName} style={{ marginTop: '0.5rem', height: '3rem', borderRadius: '1rem', borderColor: 'gray' }} />}
                          on="focus"
                          content={`用户名用于在OJ系统中登录，必须与其他用户不同。${badUsernamePrompt}。注册后无法更改，如有特殊情况请联系管理员。`}
                          wide
                        ></Popup>
                      </div>
                    </FormField>
                    <FormField>
                      <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <label style={{ fontSize: '1.5rem', fontWeight: 'normal', width: '10rem', lineHeight: '4rem' }}>姓名</label>
                        <Popup
                          trigger={<Input {...realName} style={{ marginTop: '0.5rem', height: '3rem', borderRadius: '1rem', borderColor: 'gray' }} />}
                          on="focus"
                          content={"请填写自己的姓名，而非家长的姓名。注册后非特殊情况无法更改。"}
                        ></Popup>
                      </div>
                    </FormField>
                    <FormField>
                      <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <label style={{ fontSize: '1.5rem', fontWeight: 'normal', width: '10rem', lineHeight: '4rem' }}>密码</label>
                        <Popup
                          trigger={<Input {...pwd} style={{ marginTop: '0.5rem', height: '3rem', borderRadius: '1rem', borderColor: 'gray' }} type='password' />}
                          on="focus"
                          content="请填写一个自己能记住的密码。"
                        ></Popup>
                      </div>
                    </FormField>
                    <FormField>
                      <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <label style={{ fontSize: '1.5rem', fontWeight: 'normal', width: '10rem', lineHeight: '4rem' }}>重复密码</label>
                        <Popup
                          trigger={<Input {...repeatPwd} style={{ marginTop: '0.5rem', height: '3rem', borderRadius: '1rem', borderColor: 'gray' }} type='password' />}
                          on="focus"
                          content="请重复输入一遍你的密码。"
                        ></Popup>
                      </div>
                    </FormField>
                    <FormField>
                      <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <label style={{ fontSize: '1.5rem', fontWeight: 'normal', width: '10rem', lineHeight: '4rem' }}>手机号</label>
                        <Popup
                          trigger={<Input {...phone} style={{ marginTop: '0.5rem', height: '3rem', borderRadius: '1rem', borderColor: 'gray' }} />}
                          on="focus"
                          content="请填写11位国内手机号。注册后非特殊情况无法更改。"
                        ></Popup>
                      </div>
                    </FormField>
                    <FormField>
                      <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <label style={{ fontSize: '1.5rem', fontWeight: 'normal', width: '10rem', lineHeight: '4rem' }}>验证码</label>
                        <Input {...smsCode} style={{ marginTop: '0.5rem', height: '3rem', borderRadius: '1rem', borderColor: 'gray' }} />
                      </div>
                    </FormField>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                      <Button style={{ width: '8rem', height: "3.5rem", borderRadius: '1rem', marginRight: '4rem', backgroundColor: "#de5f50", color: 'white', fontSize: '1.5rem', padding: '0' }} onClick={handleSendSMS}>发送验证码</Button>
                      <Button style={{ width: '8rem', height: "3.5rem", borderRadius: '1rem', backgroundColor: "#a2c173", color: 'white', fontSize: '1.5rem', padding: '0' }} onClick={handleRegister}>注册</Button>
                      <Link to='/rs/visual_programming/main' style={{ display: 'block', textAlign: 'center', lineHeight: '3.5rem' }} >返回主页</Link>
                    </div>
                  </div>
                </Form>
              </div>
            </GridColumn>
            <GridColumn width={4} style={{ height: '45rem', paddingBottom: "0", userSelect: 'none' }}>
              <Image src={Cat} style={{ height: "35%", width: "75%", position: 'absolute', bottom: '0', right: '20px', userSelect: 'none' }}></Image>
            </GridColumn>
          </Grid>
          {showSendModal && phone && <Modal open closeOnDimmerClick={false}>
            <Modal.Content>
              <SendSMSCodeDialog
                autoCloseOnSuccees={true}
                phoneUsingState="must_not_use"
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

export default VisualProgrammingRegister
