import { Button, Dimmer, Form, Input, Loader, Modal } from "semantic-ui-react";
import { EditingUser } from "../BatchCreateUsers";
import XLSX, { CellObject } from "xlsx-js-style";
import { useRef, useState } from "react";
import { showErrorModal } from "../../../../dialogs/Dialog";
(window as (typeof window) & { qwq: any }).qwq = XLSX;
interface ImportUserFromExcelProps {
    onClose: () => void;
    onUpdate: (data: EditingUser[]) => void;
}

const ImportUserFromExcel: React.FC<ImportUserFromExcelProps> = ({ onClose, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [usernameColumn, setUsernameColumn] = useState<number>(0);
    const [emailColumn, setEmailColumn] = useState<number>(1);
    const [realNameColumn, setRealNameColumn] = useState<number | undefined>(undefined);
    const [phoneColumn, setPhoneColumn] = useState<number | undefined>(undefined);
    const uploadRef = useRef<Input>(null);
    const run = async () => {
        if (!uploadRef.current) {
            showErrorModal("uploadRef为空");
            return;
        }
        const refVal = uploadRef.current!;
        const inputRef = refVal as (typeof refVal & {
            inputRef: {
                current: HTMLInputElement
            }
        });
        const files = inputRef.inputRef.current.files;
        if (!files || files.length !== 1) {
            showErrorModal("请选择一个文件");
            return;
        }

        // if (usernameColumn === undefined && emailColumn === undefined && realNameColumn === undefined && phoneColumn === undefined) {
        //     showErrorModal("请使用用户名列、邮箱列、实名列、手机号列中至少一个");
        //     return;
        // }
        try {
            setLoading(true);
            const file = files[0];
            const content = await file.arrayBuffer();
            const doc = XLSX.read(content);
            console.log(doc);
            const sheet = doc.Sheets[doc.SheetNames[0]]
            const result: EditingUser[] = [];
            const { r: maxRow } = XLSX.utils.decode_cell(sheet["!ref"]!);
            console.log(maxRow);
            for (let i = 0; i < maxRow; i++) {
                const tryLoadCell: (col: number) => string = (col) => {
                    const cell = sheet[XLSX.utils.encode_cell({ r: i, c: col })];
                    if (!cell) return "";
                    if (cell === null || cell === undefined) {
                        throw new Error(`列 ${col} 在行 ${i} 上不存在`);
                    }
                    return (cell as CellObject)!.v as string;
                };
                const username = tryLoadCell(usernameColumn);
                const email = tryLoadCell(emailColumn);
                if (username === "" && email === "") continue;
                const current: EditingUser = {
                    email, username
                }
                if (realNameColumn) current.realName = tryLoadCell(realNameColumn);
                if (phoneColumn) current.phone = tryLoadCell(phoneColumn);
                result.push(current);
            }
            console.log(result);
            onUpdate(result);
            onClose();
        } catch (e) { showErrorModal(String(e)); } finally {
            setLoading(false);
        }
    };

    return <Modal open>
        <Modal.Header>从Excel文档导入数据</Modal.Header>
        <Modal.Content>
            {loading && <Dimmer active><Loader></Loader></Dimmer>}
            <Form>
                <Form.Field>
                    <label>Excel文档</label>
                    <Input type="file" ref={uploadRef}></Input>
                </Form.Field>
                <Form.Group widths={4}>
                    <Form.Field>
                        <label>用户名列</label>
                        <Input type="number" value={usernameColumn} onChange={(_, d) => setUsernameColumn(parseInt(d.value))}></Input>
                    </Form.Field>
                    <Form.Field>
                        <label>电子邮箱列</label>
                        <Input type="number" value={emailColumn} onChange={(_, d) => setEmailColumn(parseInt(d.value))}></Input>
                    </Form.Field>
                    <Form.Field>
                        <label>手机号列</label>
                        <Input value={phoneColumn || ""} onChange={(_, d) => setPhoneColumn(parseInt(d.value))} action={{
                            size: "tiny",
                            content: "清除",
                            onClick: () => setPhoneColumn(undefined)
                        }} actionPosition="left"></Input>
                    </Form.Field>
                    <Form.Field>
                        <label>实名列</label>
                        <Input value={realNameColumn || ""} onChange={(_, d) => setRealNameColumn(parseInt(d.value))} action={{
                            size: "tiny",
                            content: "清除",
                            onClick: () => setRealNameColumn(undefined)
                        }} actionPosition="left"></Input>
                    </Form.Field>
                </Form.Group>
            </Form>
        </Modal.Content>
        <Modal.Actions>
            <Button color="red" disabled={loading} onClick={onClose}>取消</Button>
            <Button color="green" disabled={loading} onClick={run}>确认</Button>
        </Modal.Actions>
    </Modal>
};

export default ImportUserFromExcel;
