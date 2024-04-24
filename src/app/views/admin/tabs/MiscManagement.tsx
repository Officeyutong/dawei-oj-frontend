import React from "react";
import { Button, Icon } from "semantic-ui-react";

const MiscManagement: React.FC<React.PropsWithChildren<{}>> = () => {

    return <div>
        <Button color="green" labelPosition="right" icon onClick={() => { window.open("/wiki/config") }}>
            <Icon name="paper plane outline"></Icon>
            前往Wiki管理
        </Button>

    </div>;
}

export default MiscManagement;
