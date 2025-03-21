import React, { useEffect, useState } from "react";
import { Button, Container, Dimmer, Divider, Header, Loader, Segment } from "semantic-ui-react";
import { ButtonClickEvent } from "../../common/types";
import ChallengeEntry from "./ChallengeEntry";
import challengeClient from "./client/ChallengeClient";
import { ChallengeListEntry } from "./client/types";

const ChallengeList: React.FC<React.PropsWithChildren<{}>> = () => {
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ChallengeListEntry[]>([]);
    const [managable, setManagable] = useState(false);

    useEffect(() => {
        if (!loaded) {
            (async () => {
                try {
                    setLoading(true);
                    const { data, managable } = await challengeClient.getChallengeList();
                    setManagable(managable);
                    setData(data);
                    setLoading(false);
                    setLoaded(true);
                } catch { } finally { }
            })();
        }
    }, [loaded]);
    const createChallenge = async (evt: ButtonClickEvent) => {
        try {
            setLoading(true);
            await challengeClient.createChallenge();
            setLoaded(false);
        } catch { } finally { setLoading(false); }
    };
    return <>
        <Header as="h1">
            挑战列表
        </Header>
        {loaded && <>
            <Segment stacked>
                {loading && <Dimmer active>
                    <Loader>加载中...</Loader>
                </Dimmer>}
                {managable && <>
                    <Header as="h3">
                        管理
                    </Header>
                    <Button color="green" onClick={createChallenge}>创建挑战</Button>
                    <Divider></Divider>
                </>}
                {data.length === 0 && <Container textAlign="center">还没有挑战...</Container>}
                {data.map((item, i) => <ChallengeEntry
                    key={i}
                    {...item}
                    managable={managable}
                ></ChallengeEntry>)}
            </Segment>

        </>}
    </>;
};

export default ChallengeList;
