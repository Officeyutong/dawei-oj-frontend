import { useHistory, useParams } from "react-router-dom";
import { Button, Container, Header } from "semantic-ui-react";
import UserStatisticsChart from "../user/profile/UserStatisticsChart";
import { useDocumentTitle } from "../../common/Utils";

const WechatStatisticsDetails = () => {
    const uid = parseInt(useParams<{ uid: string }>().uid);
    const history = useHistory();
    useDocumentTitle("查看用户统计数据");
    return <Container>
        <Header as="h1">查看用户统计数据</Header>
        <UserStatisticsChart allThingsInOneColumn uid={uid}></UserStatisticsChart>
        <Button onClick={() => history.goBack()}>返回</Button>
    </Container>;
}

export default WechatStatisticsDetails;
