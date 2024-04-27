import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Container, Header, Segment } from "semantic-ui-react";
import { StateType } from "../../states/Manager";
import { PUBLIC_URL } from "../../App";
import { useDocumentTitle } from "../../common/Utils";

const WechatStatisticsDetails = () => {
    const alreadyLogin = useSelector((s: StateType) => s.userState.login);
    useEffect(() => {
        if (!alreadyLogin) window.location.href = `${PUBLIC_URL}/wechat_statistics_view/login`;
    }, [alreadyLogin]);
    useDocumentTitle("查看统计信息")
    return <Container>
        <Header as="h1">查看统计信息</Header>
        <Segment stacked>

        </Segment>
    </Container>;
};
export default WechatStatisticsDetails;
