import { Row, Col, Typography, Table, TableProps, Spin, Input, List, Flex, Button } from "antd";
import { BLOCK_CSS } from "./HomePageNew";
import { PUBLIC_URL } from "../../../App";
import { Link, useHistory } from "react-router-dom";
import { CarryOutOutlined, ClockCircleOutlined, GlobalOutlined, NotificationOutlined, PaperClipOutlined, SearchOutlined } from "@ant-design/icons";
import JudgeStatusLabel from "../../utils/JudgeStatusLabel";
import { useEffect, useState } from "react";
import { ProblemtodoEntry } from "../../problemtodo/client/types";
import problemtodoClient from "../../problemtodo/client/ProblemtodoClient";
import QueryString from "qs";
import { DateTime } from "luxon";
import { HomePageData } from "../client/types";
import { DiscussionEntry } from "../../discussion/client/types";
import discussionClient from "../../discussion/client/DiscussionClient";
import { timeStampToString } from "../../../common/Utils";

const ProblemTodoBoxNew = () => {
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [problemTodo, setProblemTodo] = useState<ProblemtodoEntry[]>([]);

    useEffect(() => {
        if (!loaded) (async () => {
            try {
                setLoading(true);
                const data = await problemtodoClient.getAll();
                if (data.length > 5) data.length = 5;
                setProblemTodo(data);
                setLoaded(true);
            } catch { } finally { setLoading(false); }
        })();
    }, [loaded]);
    return <div style={BLOCK_CSS}>
        <Row>
            <Col span={12}>
                <Typography.Title level={4}><CarryOutOutlined />收藏题目</Typography.Title>
            </Col>
            <Col span={12} style={{ textAlign: "right" }}>
                <Link to={`${PUBLIC_URL}/problemtodo/list`}>全部</Link>
            </Col>
        </Row>
        <Spin spinning={loading}>
            <Table pagination={false} columns={[
                { title: "题目", key: "problem", dataIndex: ["id", "title"], render: (_, line) => <Link to={`${PUBLIC_URL}/show_problem/${line.id}`}>#{line.id}. {line.title}</Link> },
                { title: "创建时间", key: "time", render: (_, { joinTime }) => <Typography.Text>{joinTime}</Typography.Text> },
                {
                    title: "提交状态", key: "status", render: (_, { submission }) => {
                        const inner = <JudgeStatusLabel status={submission.status}></JudgeStatusLabel>;
                        if (submission.id === -1) return inner;
                        return <Link to={`${PUBLIC_URL}/show_submission/${submission.id}`}>{inner}</Link>
                    }
                }
            ] as TableProps<ProblemtodoEntry>['columns']} dataSource={problemTodo.map(t => ({ ...t, key: t.id }))}></Table>
        </Spin>
    </div>;
}

const ProblemSearchBoxNew = () => {
    const [searchText, setSearchText] = useState("");
    const history = useHistory();
    return <div style={BLOCK_CSS}>
        <Typography.Title level={4}><SearchOutlined /> 题目搜索</Typography.Title>
        <Input.Search placeholder="请输入题目标题" value={searchText} onChange={d => setSearchText(d.target.value)} enterButton onSearch={() => {
            const qs = QueryString.stringify({ filter: JSON.stringify({ searchKeyword: searchText }) });
            history.push(`${PUBLIC_URL}/problems/1?${qs}`);
        }}></Input.Search>
    </div>;
}
function ymdToCountdownStr(ymd: string): number {
    const [y, m, d] = ymd.split("-");
    const now = DateTime.now();
    const date = now.set({ year: parseInt(y), month: parseInt(m), day: parseInt(d) });
    const diff = date.diff(now, "days");
    return diff.days;
}

const RecentCountdowns: React.FC<{ countdowns: HomePageData["dayCountdowns"] }> = ({ countdowns }) => <div style={BLOCK_CSS}>
    <Typography.Title level={4}><ClockCircleOutlined /> 近期比赛</Typography.Title>
    <List
        dataSource={countdowns}
        renderItem={item => <List.Item style={{ textAlign: "center" }}>距离 <Typography.Text style={{ fontWeight: "bold" }}>{item.name}</Typography.Text> 还有 <Typography.Text style={{ fontWeight: "bold" }}>{ymdToCountdownStr(item.date)}</Typography.Text> 天</List.Item>}
    ></List>
</div>;

const ToolBoxNew: React.FC<{ toolbox: HomePageData["toolbox"] }> = ({ toolbox }) => <div style={BLOCK_CSS}>
    <Typography.Title level={4}><PaperClipOutlined /> 工具链接</Typography.Title>
    <Flex wrap="wrap" justify="space-evenly" align="center">
        {toolbox.map((item) => <Button key={item.name} type="link" href={item.url} target="_blank">{item.name}</Button>)}
    </Flex>
</div>;

const BroadcastBoxNew = () => {
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [data, setData] = useState<DiscussionEntry[]>([]);
    useEffect(() => {
        if (!loaded) {
            (async () => {
                try {
                    setLoading(true);
                    setData((await discussionClient.getDiscussions("broadcast", 1, 5)).data);
                    setLoaded(true);
                } catch (e) { } finally {
                    setLoading(false);
                }
            })();
        }
    }, [loaded]);
    return <div style={BLOCK_CSS}>
        <Row>
            <Col span={12}>
                <Typography.Title level={4}><NotificationOutlined /> 公告</Typography.Title>
            </Col>
            <Col span={12} style={{ textAlign: "right" }}>
                <Link to={`${PUBLIC_URL}/discussions/broadcast/1`}>全部</Link>
            </Col>
        </Row>
        <Spin spinning={loading}>
            <List
                dataSource={data}
                renderItem={item => <List.Item>
                    <Link to={`${PUBLIC_URL}/show_discussion/${item.id}`}>
                        {item.title}
                        <p style={{ color: "grey" }}>{timeStampToString(item.time)}</p>

                    </Link>
                </List.Item>}
            ></List>
        </Spin>
    </div>;
}

const FriendLinkNew: React.FC<{ links: HomePageData["friendLinks"] }> = ({ links }) =>
    <div style={BLOCK_CSS}>
        <Typography.Title level={4}><GlobalOutlined /> 友情链接</Typography.Title>
        <List
            dataSource={links}
            renderItem={item => <List.Item>
                <a href={item.url} target="_blank" rel="noreferrer">{item.name}</a>
            </List.Item>}
        ></List>
    </div>;
export { ProblemTodoBoxNew, ProblemSearchBoxNew, RecentCountdowns, ToolBoxNew, BroadcastBoxNew, FriendLinkNew };
