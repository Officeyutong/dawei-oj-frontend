import { useEffect, useState } from "react";
import { adminClient } from "../../admin/client/AdminClient";
import { Button, Dimmer, Loader, Modal, Table } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { PUBLIC_URL } from "../../../App";

interface SelectedTeam {
    id: number;
    name: string;
};

const SelectTeamModal: React.FC<{ closeCallback: (data?: SelectedTeam) => void }> = ({ closeCallback }) => {
    const [data, setData] = useState<null | SelectedTeam[]>(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (data === null) (async () => {
            try {
                setLoading(true);
                setData(await adminClient.getAllTeams());
                setLoading(false);
            } catch { } finally { }
        })();
    }, [data]);
    return <Modal size="small" open>
        <Modal.Header>选择团队</Modal.Header>
        <Modal.Content>
            {loading && <Dimmer active><Loader active></Loader></Dimmer>}
            {data && <div style={{ overflowY: "scroll", maxHeight: "500px" }}>
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>团队</Table.HeaderCell>
                            <Table.HeaderCell>操作</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {data.map(item => <Table.Row key={item.id}>
                            <Table.Cell><Link to={`${PUBLIC_URL}/team/${item.id}`}>#{item.id}. {item.name}</Link></Table.Cell>
                            <Table.Cell><Button size="small" color="green" onClick={() => closeCallback(item)}>选中</Button></Table.Cell>
                        </Table.Row>)}
                    </Table.Body>
                </Table>
            </div>}
        </Modal.Content>
        <Modal.Actions>
            <Button size="small" disabled={loading} color="red" onClick={() => closeCallback()}>取消</Button>
        </Modal.Actions>
    </Modal>
}


export type { SelectedTeam };
export default SelectTeamModal;
