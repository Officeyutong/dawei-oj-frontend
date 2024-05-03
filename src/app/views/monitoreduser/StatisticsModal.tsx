import { Button, Modal } from "semantic-ui-react";
import UserExtraStatisticsChart from "../user/extra_statistics/UserExtraStatisticsChart";

interface StatisticsModalProps {
    uid: number;
    onClose: () => void;
}

const StatisticsModal: React.FC<StatisticsModalProps> = ({ uid, onClose }) => {
    return <Modal open>
        <Modal.Header>
            查看统计
        </Modal.Header>
        <Modal.Content>
           <UserExtraStatisticsChart uid={uid}></UserExtraStatisticsChart>
        </Modal.Content>
        <Modal.Actions>
            <Button color="red" onClick={onClose}>关闭</Button>
        </Modal.Actions>
    </Modal>
}

export default StatisticsModal;
