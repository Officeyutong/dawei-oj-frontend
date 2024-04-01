import { useEffect, useState } from "react";
import { EditingUser } from "../BatchCreateUsers";
import random from "random";
import { showErrorModal, showSuccessModal } from "../../../../dialogs/Dialog";
import XLSX from "xlsx-js-style";
import { Button, Dimmer, Loader, Message, Modal } from "semantic-ui-react";
import { adminClient } from "../../client/AdminClient";
interface UsersSaveModalProps {
    onClose: () => void;
    data: EditingUser[];
}

const randomPassChar = () => random.choice(["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"])!;

const UsersSaveModal: React.FC<UsersSaveModalProps> = ({ onClose, data }) => {
    const [password, setPassword] = useState<Map<string, string> | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {

        if (!loaded) {
            const newPass = new Map<string, string>();
            for (const item of data) {
                let str = "";
                for (let i = 0; i < 8; i++) str += randomPassChar();
                newPass.set(item.username, str);
            }
            if (newPass.size !== data.length) {
                showErrorModal("用户名不能出现重复");
                onClose();
            }
            setPassword(newPass);
            setLoaded(true);
        }
    }, [data, loaded, onClose]);
    const saveXlsx = () => {
        const workbook = XLSX.utils.book_new();
        const sheetData: string[][] = [];
        sheetData.push([
            "用户名", "电子邮箱", "密码", "实名", "手机号"
        ]);
        for (const item of data) {
            sheetData.push([
                item.username, item.email, password!.get(item.username)!, item.realName || "-", item.phone || "-"
            ]);
        }
        const sheet = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(workbook, sheet, "用户列表");
        XLSX.writeFile(workbook, "users.xlsx");
    };
    const save = async () => {
        try {
            setLoading(true);
            await adminClient.batchCreateUser(data.map(t => ({
                ...t,
                password: password!.get(t.username)!
            })))
            showSuccessModal("操作完成");
            onClose();
        } catch {

        } finally {
            setLoading(false);
        }
    };
    return <Modal size="small" open>
        <Modal.Header>确认批量新建用户</Modal.Header>
        <Modal.Content>
            {loading && <Dimmer active><Loader></Loader></Dimmer>}
            <Message warning>
                <Message.Header>注意</Message.Header>
                <Message.Content>
                    <p>请务必在确认提交之前点击“下载用户列表文档”下载并保存用户信息。一旦提交成功后，你将不能再次看到这些用户的密码。</p>
                    <p>一旦你点击了关闭，那么下次再次打开这个窗口时，生成的密码会不同。</p>
                </Message.Content>
            </Message>
        </Modal.Content>
        <Modal.Actions>
            <Button color="red" disabled={loading} onClick={onClose}>关闭</Button>
            <Button color="blue" disabled={loading} onClick={saveXlsx}>下载用户列表文档</Button>
            <Button color="green" disabled={loading} onClick={save}>提交</Button>
        </Modal.Actions>
    </Modal>
}

export default UsersSaveModal;
