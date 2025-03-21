import { Carousel, Col, Row, Spin } from "antd";
import { useDocumentTitle } from "../../../common/Utils";
import { useSelector } from "react-redux";
import { StateType, store } from "../../../states/Manager";
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
import { Image } from "semantic-ui-react";


const BLOCK_CSS: CSSProperties = {
    backgroundColor: "white",
    marginLeft: "18px",
    marginBottom: "22px",
    marginTop: "22px",
    marginRight: "18px",
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
        const oldMaxWidth = store.getState().baseContainerMaxWidth;
        store.dispatch({ type: "UPDATE_MAXWIDTH", modify: s => ({ ...s, baseContainerMaxWidth: "100%" }) });
        return () => {
            console.log("Restored max width");
            store.dispatch({ type: "UPDATE_MAXWIDTH", modify: s => ({ ...s, baseContainerMaxWidth: oldMaxWidth }) });
        };
    }, []);
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
    return <Row>
        <Col span={18}>
            <Spin spinning={loading}>
                <div style={{ ...BLOCK_CSS }}>
                    {/* <Typography.Title level={4}><FormOutlined></FormOutlined>最新动态</Typography.Title> */}
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                        <Carousel autoplay dots style={{ height: "400px", width: "870px", overflow: "hidden" }}>
                            {swipers.map((item, idx) => <a key={idx} href={item.link_url === "" ? undefined : item.link_url} target="_blank" rel="noreferrer">
                                {/* <img alt={item.image_url} src={item.image_url} ></img> */}
                                <Image alt={item.image_url} src={item.image_url} ></Image>
                            </a>)}
                        </Carousel>
                    </div>
                    <div style={{ overflowY: "scroll", maxHeight: alreadyLogin ? "300px" : "500px" }}>
                        <FeedArea withProfileImage={true} data={feed} showTopLabel></FeedArea>
                    </div>
                </div>
            </Spin>
            {alreadyLogin && <ProblemTodoBoxNew></ProblemTodoBoxNew>}
        </Col>
        <Col span={6}>
            <ProblemSearchBoxNew></ProblemSearchBoxNew>
            {homePageData && <>
                {homePageData.dayCountdowns.length > 0 && <RecentCountdowns countdowns={homePageData.dayCountdowns}></RecentCountdowns>}
                <ToolBoxNew toolbox={homePageData.toolbox}></ToolBoxNew>
            </>}
            <BroadcastBoxNew></BroadcastBoxNew>
            {homePageData && <FriendLinkNew links={homePageData.friendLinks}></FriendLinkNew>}
        </Col>
    </Row>
};

export default HomePageNew;

export { BLOCK_CSS };
