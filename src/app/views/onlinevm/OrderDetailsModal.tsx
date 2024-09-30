import { Button, Form, Modal } from "semantic-ui-react"
import { OrderListEntry } from "./client/types";
import UserLink from "../utils/UserLink";
import { translatePaymentStatus } from "./client/OnlineVMClient";
import { timeStampToString } from "../../common/Utils";
import AceEditor from "react-ace";
import { useAceTheme } from "../../states/StateUtils";

const OrderDetailsModal: React.FC<{ data: OrderListEntry; onClose: () => void; }> = ({ data, onClose }) => {
    const aceTheme = useAceTheme();
    return <Modal open size="small">
        <Modal.Header>查看充值订单详情</Modal.Header>
        <Modal.Content>
            <Form>
                <Form.Group widths={4}>
                    <Form.Field>
                        <label>订单编号</label>
                        {data.order_id}
                    </Form.Field>
                    <Form.Field>
                        <label>订单用户</label>
                        <UserLink data={data.user}></UserLink>
                        {data.user.real_name && `（${data.user.real_name}）`}
                    </Form.Field>
                    <Form.Field>
                        <label>充值金额</label>
                        {(data.amount / 100).toFixed(2)}
                    </Form.Field>
                    <Form.Field>
                        <label>支付状态</label>
                        {translatePaymentStatus(data.status)}
                    </Form.Field>
                </Form.Group>
                <Form.Group widths={3}>
                    <Form.Field>
                        <label>订单创建时间</label>
                        {timeStampToString(data.time)}
                    </Form.Field>
                    <Form.Field>
                        <label>订单到期时间</label>
                        {timeStampToString(data.expire_at)}
                    </Form.Field>
                    <Form.Field>
                        <label>订单状态最后更新时间</label>
                        {timeStampToString(data.last_update_time)}
                    </Form.Field>
                </Form.Group>
                <Form.Field>
                    <label>订单内容描述</label>
                    <span>{data.description}</span>
                </Form.Field>
                {data.admin_description && <Form.Field>
                    <label>管理员备注</label>
                    <AceEditor
                        value={data.admin_description}
                        name="new-comment-edit"
                        mode="plain_text"
                        width="100%"
                        height="200px"
                        theme={aceTheme}
                    ></AceEditor>
                </Form.Field>}
            </Form>
        </Modal.Content>
        <Modal.Actions>
            <Button color="green" onClick={onClose}>关闭</Button>
        </Modal.Actions>
    </Modal>
}

export default OrderDetailsModal;
