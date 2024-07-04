import { useEffect, useState } from "react";
import SelectTeamModal, { SelectedTeam } from "./SelectTeamModal";
import { PerTeamStatisticsResponse } from "../client/types";
import { Button, Dimmer, Divider, Form, Icon, Label, Loader, Message } from "semantic-ui-react";
import visualProgrammingClient from "../client/VisualProgrammingClient";

const TabPerTeamStatistics: React.FC<{}> = () => {
    const [loading, setLoading] = useState(false);
    const [filterTeam, setFilterTeam] = useState<null | SelectedTeam>(null);
    const [data, setData] = useState<PerTeamStatisticsResponse | null>(null);
    const [showSelectTeamModal, setShowSelectTeamModal] = useState(false);

    useEffect(() => {
        if (filterTeam !== null) {
            (async () => {
                try {
                    setLoading(true);
                    setData(await visualProgrammingClient.getPerTeamStatistics(filterTeam.id));
                } catch { } finally { setLoading(false); }
            })();
        }
    }, [filterTeam]);

    return <>
        {showSelectTeamModal && <SelectTeamModal
            closeCallback={data => {
                if (data) setFilterTeam(data);
                setShowSelectTeamModal(false);
            }}
        ></SelectTeamModal>}
        {loading && <Dimmer active><Loader></Loader></Dimmer>}
        <Message info>
            <Message.Header>提示</Message.Header>
            <Message.Content>
                选择一个团队后，可以查看这个团队成员的可视化作业统计信息。
            </Message.Content>
        </Message>
        <Form>
            <Form.Field>
                <label>团队</label>
                {filterTeam === null ? <Button size="small" onClick={() => setShowSelectTeamModal(true)} color="green">选择团队</Button> : <Label onClick={() => setFilterTeam(null)} size="large" color="blue">#{filterTeam.id}. {filterTeam.name}<Icon name="delete"></Icon></Label>}
            </Form.Field>
        </Form>
        {data !== null && <>
            <Divider></Divider>

        </>}
    </>
};

export default TabPerTeamStatistics;
