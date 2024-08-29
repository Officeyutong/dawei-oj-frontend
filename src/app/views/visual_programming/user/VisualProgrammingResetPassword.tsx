import { Button, Dimmer, Form, FormField, Grid, GridColumn, Header, Image, Input, Loader, Modal } from "semantic-ui-react";
import { useBackgroundColor, useDocumentTitle, useInputValue, usePasswordSalt } from "../../../common/Utils";
import Cat from "../assets/cat.png"
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { showErrorModal } from "../../../dialogs/Dialog";
import userClient from "../../user/client/UserClient";
import { useSelector } from "react-redux";
import { StateType } from "../../../states/Manager";
import md5 from "md5";
import { showSuccessPopup } from "../../../dialogs/Utils";
import { PUBLIC_URL } from "../../../App";
import SendSMSCodeDialog from "../../utils/SendSMSCode";


const VisualProgrammingResetPassword: React.FC<{}> = () => {
  const { initialRequestDone, login } = useSelector((s: StateType) => s.userState);
  useBackgroundColor('#d6eefa')
  useDocumentTitle("重置密码");
  const [loading, setLoading] = useState<boolean>(false)
  const phone = useInputValue();
  const pwd = useInputValue();
  const smsCode = useInputValue();
  const salt = usePasswordSalt()
  const [showSendModal, setShowSendModal] = useState<boolean>(false)

  const handleResetPassword = async () => {
    if (pwd.value === "" || smsCode.value === "") {
      showErrorModal("请输入密码或验证码");
      return;
    }
    try {
      setLoading(true);
      await userClient.doPhoneResetPassword(phone.value, md5(pwd.value + salt), smsCode.value);
      showSuccessPopup("操作完成，正在跳转");
      setTimeout(() => window.location.href = "/visual_programming/main", 500);
    } catch {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    if (initialRequestDone && login) {
      window.location.href = '/visual_programming/main'
    }
  }, [initialRequestDone, login])
  return (<>
    {loading && <Dimmer active>
      <Loader></Loader>
    </Dimmer>}
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10rem' }}>
      <div style={{ backgroundColor: '#67aeda', width: '60rem', borderRadius: '2rem', border: '0.3rem solid', borderColor: 'white', boxShadow: '-5px 5px 5px 	#8e9ea6' }}>
        <div style={{ height: '45rem' }}>
          <Grid>
            <GridColumn width={12} style={{ height: '45rem', paddingBottom: "0", display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none' }} >
              <div style={{ height: '45rem', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: "2rem" }}>
                <Form style={{ width: '90%', maxHeight: '90%' }}>
                  <Header style={{ color: 'white', fontSize: '2.5rem' }}>找回密码</Header>
                  <div style={{ backgroundColor: 'white', flex: '1', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignContent: 'center', paddingTop: "2rem", paddingBottom: "2rem", paddingInline: '5rem' }}>
                    <FormField>
                      <label style={{ fontSize: '1.5rem', fontWeight: 'normal' }}>手机号</label>
                      <Input {...phone} style={{ marginTop: '1rem', height: '4rem', borderRadius: '2rem', borderColor: 'gray' }} />
                    </FormField>
                    <FormField>
                      <label style={{ fontSize: '1.5rem', fontWeight: 'normal' }}>新密码</label>
                      <Input {...pwd} style={{ marginTop: '1rem', height: '4rem', borderRadius: '2rem', borderColor: 'gray' }} type="password" />
                    </FormField>
                    <FormField>
                      <label style={{ fontSize: '1.5rem', fontWeight: 'normal' }}>验证码</label>
                      <Input {...smsCode} style={{ marginTop: '1rem', height: '4rem', borderRadius: '2rem', borderColor: 'gray' }} type="password" />
                    </FormField>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                      <Button style={{ width: '8rem', height: "3.5rem", borderRadius: '1rem', marginRight: '4rem', backgroundColor: "#de5f50", color: 'white', fontSize: '1.5rem', padding: '0' }} onClick={handleSendSMS}>发送验证码</Button>
                      <Button style={{ width: '8rem', height: "3.5rem", borderRadius: '1rem', backgroundColor: "#a2c173", color: 'white', fontSize: '1.5rem', padding: '0' }} onClick={handleResetPassword}>提交</Button>

                      <Link to={`${PUBLIC_URL}/visual_programming/main`} style={{ display: 'block', textAlign: 'center', lineHeight: '3.5rem' }} >返回主页</Link>
                    </div>
                  </div>
                </Form>
              </div>
            </GridColumn>
            <GridColumn width={4} style={{ height: '45rem', paddingBottom: "0", userSelect: 'none' }}>
              <Image src={Cat} style={{ height: "28%", width: "75%", position: 'absolute', bottom: '0', right: '20px', userSelect: 'none' }}></Image>

            </GridColumn>
          </Grid>
          {showSendModal && <Modal open closeOnDimmerClick={false}>
            <Modal.Content>
              <SendSMSCodeDialog
                autoCloseOnSuccees={true}
                phoneUsingState="must_use"
                phone={phone.value}
                onClose={(flag) => {
                  setShowSendModal(false);
                  if (flag) showSuccessPopup('发送验证码成功');
                }}
              ></SendSMSCodeDialog>
            </Modal.Content>
          </Modal>}
        </div >
      </div >
    </div >
  </>)
};

export default VisualProgrammingResetPassword;
