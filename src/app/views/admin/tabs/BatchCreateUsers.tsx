import { useState } from "react";
import { Button, Divider, Input, Table } from "semantic-ui-react";
import ImportUserFromExcel from "./modals/ImportUserFromExcel";
import UsersSaveModal from "./modals/UsersSaveModal";

interface EditingUser {
    username: string;
    email: string;
    realName?: string;
    phone?: string;
}
const BatchCreateUsers = () => {
    const [editingUser, setEditingUser] = useState<EditingUser[]>([]);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const updateValueAt = (idx: number, data: EditingUser) => {
        let newVal = [...editingUser];
        newVal[idx] = data;
        setEditingUser(newVal);
    }

    return <div>
        {showImportModal && <ImportUserFromExcel onClose={() => setShowImportModal(false)} onUpdate={d => setEditingUser(d)}></ImportUserFromExcel>}
        {showSaveModal && <UsersSaveModal onClose={() => setShowSaveModal(false)} data={editingUser}></UsersSaveModal>}
        <Button color="green" onClick={() => setShowImportModal(true)}>从Excel文档导入</Button>
        <Divider></Divider>
        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>用户名</Table.HeaderCell>
                    <Table.HeaderCell>电子邮箱</Table.HeaderCell>
                    <Table.HeaderCell>手机号码</Table.HeaderCell>
                    <Table.HeaderCell>实名</Table.HeaderCell>
                    <Table.HeaderCell>操作</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {editingUser.map((t, idx) => <Table.Row key={idx}>
                    <Table.Cell><Input value={t.username} onChange={(_, d) => {
                        updateValueAt(idx, { ...t, username: d.value! });
                    }}></Input></Table.Cell>
                    <Table.Cell><Input value={t.email} onChange={(_, d) => {
                        updateValueAt(idx, { ...t, email: d.value! });
                    }}></Input></Table.Cell>
                    <Table.Cell>
                        <Input value={t.phone || ""} onChange={(_, d) => updateValueAt(idx, { ...t, phone: d.value || "" })} action={{
                            size: "tiny",
                            content: "清除",
                            onClick: () => updateValueAt(idx, { ...t, phone: undefined })
                        }} actionPosition="left"></Input>
                    </Table.Cell>
                    <Table.Cell>
                        <Input value={t.realName || ""} onChange={(_, d) => updateValueAt(idx, { ...t, realName: d.value || "" })} action={{
                            size: "tiny",
                            content: "清除",
                            onClick: () => updateValueAt(idx, { ...t, realName: undefined })
                        }} actionPosition="left"></Input>
                    </Table.Cell>
                    <Table.Cell>
                        <Button color="red" onClick={() => {
                            let newVal = [...editingUser];
                            newVal.splice(idx, 1);
                            setEditingUser(newVal);
                        }}>删除本行</Button>
                    </Table.Cell>
                </Table.Row>)}
                <Table.Row >
                    <Table.Cell colSpan="4">
                        <Button color="green" onClick={() => setEditingUser([...editingUser, { email: "xxx@xxx.com", username: 'xxxx' }])}>添加</Button>
                    </Table.Cell>
                </Table.Row>
            </Table.Body>
        </Table>
        <Button color="green" onClick={() => setShowSaveModal(true)}>保存</Button>
    </div>
};

export default BatchCreateUsers;
export type { EditingUser };
