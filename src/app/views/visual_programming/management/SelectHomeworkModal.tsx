import { useEffect, useState } from "react";
import { Button, Dimmer, Loader, Modal, Table } from "semantic-ui-react";
import { HomeworkEditListEntry } from "../client/types";
import visualProgrammingClient from "../client/VisualProgrammingClient";

interface SelectedHomework {
    name: string;
    id: number;
};

const SelectHomeworkModal: React.FC<{ closeCallback: (data?: SelectedHomework) => void }> = ({ closeCallback }) => {
    const [data, setData] = useState<null | HomeworkEditListEntry[]>(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (data === null) (async () => {
            try {
                setLoading(true);
                setData(await visualProgrammingClient.getEditSideHomeworkList());
                setLoading(false);
            } catch { } finally { }
        })();
    }, [data]);
    return <Modal size="small" open>
        <Modal.Header>选择作业</Modal.Header>
        <Modal.Content>
            {loading && <Dimmer active><Loader active></Loader></Dimmer>}
            {data && <div style={{ overflowY: "scroll", maxHeight: "500px" }}>
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>作业</Table.HeaderCell>
                            <Table.HeaderCell>操作</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {data.map(item => <Table.Row key={item.id}>
                            <Table.Cell>#{item.id}. {item.name}</Table.Cell>
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

export type { SelectedHomework };

export default SelectHomeworkModal;
