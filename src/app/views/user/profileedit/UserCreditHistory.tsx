import { Button, Modal } from "semantic-ui-react"

const UserCreditHistory: React.FC<{ uid: number; onClose: () => void; }> = ({ uid, onClose }) => {

    return <Modal open size="large">
        <Modal.Header>查看用户积分历史</Modal.Header>
        <Modal.Content></Modal.Content>
        <Modal.Actions>
            <Button color="red" onClick={onClose}>关闭</Button>
        </Modal.Actions>
    </Modal>
};

export default UserCreditHistory;
