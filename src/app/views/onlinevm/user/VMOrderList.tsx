import { useState } from "react";
import CreateVMModal from "./CreateVMModal";
import { Button } from "semantic-ui-react";

const VMOrderList: React.FC<{}> = () => {
    const [showCreateVMModal, setShowCreateVMModal] = useState(false);
    const loadPage = async (page: number) => {

    };
    return <>
        {showCreateVMModal && <CreateVMModal onClose={flag => {
            if (flag) loadPage(1);
            setShowCreateVMModal(false);
        }}></CreateVMModal>}
        <Button color="green" onClick={() => setShowCreateVMModal(true)}>创建虚拟机</Button>
    </>
};

export default VMOrderList
