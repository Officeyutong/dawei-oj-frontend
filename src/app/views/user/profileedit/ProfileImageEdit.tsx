import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Dimmer, Divider, Form, Grid, Header, Image, Loader, Message, Segment } from "semantic-ui-react";
import userClient from "../client/UserClient";
import { makeProfileImageURL, useDocumentTitle } from "../../../common/Utils";
import { showErrorModal } from "../../../dialogs/Dialog";

const ProfileImageEdit: React.FC<{}> = () => {
    const uid = parseInt(useParams<{ uid: string }>().uid);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [hasCustomProfileImage, setHasCustomProfileImage] = useState(false);
    useEffect(() => {
        if (!loaded) (async () => {
            try {
                setLoading(true);
                setHasCustomProfileImage((await userClient.getCustomProfileImageStatus(uid)).hasCustomProfileImage);

                setLoaded(true);
                setLoading(false);
            } catch { } finally { }
        })();
    }, [loaded, uid]);
    useDocumentTitle("修改头像");
    const fileRef = useRef<HTMLInputElement>(null);
    const upload = async () => {
        const files = fileRef.current!.files;
        if (!files || files.length === 0) {
            showErrorModal("请选择恰好一个文件!");
            return;
        }
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            const item = files[i];
            formData.append(item.name, item, item.name);
        }
        try {
            setLoading(true);
            console.log(files[0])
            await userClient.uploadProfileImage(uid, files[0].size, formData);
            window.location.reload();
        } catch { } finally {
            setLoading(false);
        }
    };
    const removeImage = async () => {
        try {
            setLoading(true);
            await userClient.removeCustomProfileImage(uid);
            window.location.reload();
        } catch { } finally {
            setLoading(true);
        }
    };
    return <>
        <Header as="h1">修改头像</Header>
        <Segment stacked style={{ maxWidth: "60%" }}>
            {loading && <Dimmer active><Loader active></Loader></Dimmer>}
            {!loaded && <div style={{ minHeight: "400px", height: "400px" }}></div>}
            {loaded && <> <Grid columns={2} >
                <Grid.Column>
                    <Header as="h3">现有头像</Header>
                    <Image src={makeProfileImageURL(uid)} size="medium"></Image>
                </Grid.Column>
                <Grid.Column>
                    <Header as="h3">详情</Header>
                    <Message info>
                        <Message.Header>提示</Message.Header>
                        <Message.List>
                            {hasCustomProfileImage && <Message.Item>
                                您在本站上传了头像。您可以选择将上传的头像删除，或者重新上传头像。如果您将上传的头像删除，那么您的头像会自动使用<a href="https://gravatar.com/">Gravatar头像</a>
                            </Message.Item>}
                            {!hasCustomProfileImage && <Message.Item>
                                您没有在本站上传头像。此时您的头像会自动使用<a href="https://gravatar.com/">Gravatar头像</a>。如果您在本站上传了头像，那么您的头像会使用在本站上传的头像。
                            </Message.Item>}
                            <Message.Item>
                                头像的推荐长宽比为1:1（即正方形），否则会被拉伸，影响观看效果。
                            </Message.Item>
                        </Message.List>
                    </Message>
                    <Form>
                        <Form.Field>
                            <label>选择图片</label>
                            <input ref={fileRef} type="file"></input>
                        </Form.Field>
                        <Form.Button color="green" onClick={upload}>
                            上传头像
                        </Form.Button>
                        {hasCustomProfileImage && <Form.Button onClick={removeImage} color="red">删除头像</Form.Button>}
                    </Form>
                </Grid.Column>

            </Grid>
                <Divider vertical></Divider>
            </>}

        </Segment>
    </>
};

export default ProfileImageEdit;
