import { List } from "semantic-ui-react";
import { VMChargeSchemaEntry } from "../client/types";

const ChargeSchemaList: React.FC<{ data: VMChargeSchemaEntry[] }> = ({ data }) => <List>
    {data.map((line, idx) => <List.Item key={idx}>
        {line.duration[0] === line.duration[1] && `第${line.duration[0]}小时：`}
        {line.duration[1] === null && `从第${line.duration[0]}小时开始：`}
        {line.duration[1] !== null && line.duration[0] !== line.duration[1] && `第${line.duration[0]}至第${line.duration[1]}小时：`}
        {line.charge / 100} 元/小时
    </List.Item>)}
</List>;

export default ChargeSchemaList;
