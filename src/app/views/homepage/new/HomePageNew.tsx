import { FormOutlined, } from "@ant-design/icons";
import { Affix, Carousel, Col, Row, Spin, Typography } from "antd";
import { useDocumentTitle } from "../../../common/Utils";
import { useSelector } from "react-redux";
import { StateType } from "../../../states/Manager";
// import logo from "../../../david-logo.svg"
import { CSSProperties, useEffect, useState } from "react";
import { HomepageSwiperList } from "../../admin/client/types";
import { HomePageData } from "../client/types";
import { FeedStreamEntry } from "../../feed/client/types";
import homepageClient from "../client/HomePageClient";
import { adminClient } from "../../admin/client/AdminClient";
import feedClient from "../../feed/client/FeedClient";
import FeedArea from "../../feed/FeedArea";
import { BroadcastBoxNew, FriendLinkNew, ProblemSearchBoxNew, ProblemTodoBoxNew, RecentCountdowns, ToolBoxNew } from "./HomePageBoxesNew";
import HomePageTopMenuNew from "./HomePageTopMenuNew";


const BLOCK_CSS: CSSProperties = {
    backgroundColor: "white",
    margin: "24px",
    padding: "24px"
};


const HomePageNew = () => {
    useDocumentTitle("主页");
    const alreadyLogin = useSelector((s: StateType) => s.userState.login);

    const [swipers, setSwipers] = useState<HomepageSwiperList>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [homePageData, setHomePageData] = useState<HomePageData | null>(null);
    const [feed, setFeed] = useState<FeedStreamEntry[]>([]);

    useEffect(() => {
        const oldColor = document.body.style.backgroundColor;
        document.body.style.backgroundColor = "#f8fafc";
        return () => { document.body.style.backgroundColor = oldColor };
    });
    useEffect(() => {
        if (!loaded) {
            (async () => {
                try {
                    setLoading(true);
                    const [d1, d2, d3] = await Promise.all([homepageClient.loadData(), adminClient.getHomepageSwiperList(), feedClient.getFeedStream()]);
                    setHomePageData(d1);
                    setSwipers(d2);
                    setFeed(d3);

                    setLoaded(true);
                } catch (e) { } finally { setLoading(false); }
            })();
        }
    }, [loaded, alreadyLogin])
    return <div>
        <Affix>
            <HomePageTopMenuNew></HomePageTopMenuNew>
        </Affix>
        <Row style={{ marginTop: "50px" }}>
            <Col span={12} offset={3}>
                <Spin spinning={loading}>
                    <div style={BLOCK_CSS}>
                        <Typography.Title level={4}><FormOutlined></FormOutlined> 最新动态</Typography.Title>
                        <Row>
                            <Col span={12}>
                                <Carousel autoplay>
                                    {swipers.map((item, idx) => <a key={idx} href={item.link_url} target="_blank" rel="noreferrer">
                                        <img alt={item.image_url} src={item.image_url} ></img>
                                    </a>)}
                                </Carousel>
                                <div style={{ overflowY: "scroll", maxHeight: "300px" }}>
                                    <FeedArea withProfileImage={true} data={feed.filter(t => t.top)}></FeedArea>
                                </div>
                            </Col>
                            <Col span={12} style={{ overflowY: "scroll", maxHeight: "400px" }}>
                                <div>
                                    <FeedArea withProfileImage={true} data={feed.filter(t => !t.top)}></FeedArea>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Spin>
                <ProblemTodoBoxNew></ProblemTodoBoxNew>
            </Col>
            <Col span={6}>
                <ProblemSearchBoxNew></ProblemSearchBoxNew>
                {homePageData && <>
                    <RecentCountdowns countdowns={homePageData.dayCountdowns}></RecentCountdowns>
                    <ToolBoxNew toolbox={homePageData.toolbox}></ToolBoxNew>
                </>}
                <BroadcastBoxNew></BroadcastBoxNew>
                {homePageData && <FriendLinkNew links={homePageData.friendLinks}></FriendLinkNew>}
            </Col>
        </Row>
    </div>
};

export default HomePageNew;

export { BLOCK_CSS };
