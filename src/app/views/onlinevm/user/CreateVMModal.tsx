import { useEffect, useState } from "react"
import { Button, Dimmer, Loader, Message, Modal, Table } from "semantic-ui-react"
import { showConfirm, showErrorModal } from "../../../dialogs/Dialog";
import { OnlineVMProduct, UserBasicInfo } from "../client/types";
import onlineVMClient from "../client/OnlineVMClient";
import _ from "lodash";
import ChargeSchemaList from "../utils/ChargeSchemaList";
import { Markdown } from "../../../common/Markdown";

const CreateVMModal: React.FC<{ onClose: (shouldRefresh: boolean) => void }> = ({ onClose }) => {
    const [loaded, setLoaded] = useState(false);
    const [loadingText, setLoadingText] = useState<string>('')
    const [products, setProducts] = useState<OnlineVMProduct[]>([]);
    const [usedHours, setUsedHours] = useState<{ hours: number }[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<number>(0);
    const [basicInfo, setBasicInfo] = useState<UserBasicInfo | null>(null);
    const doCreate = () => {
        if (selectedProduct === null) {
            showErrorModal("请选择一款虚拟机产品");
            return;
        }
        showConfirm(`你确定要创建虚拟机吗？一旦成功，就会收取第一个小时的费用。`, async () => {
            try {
                setLoadingText('正在创建虚拟机，请勿刷新网页')
                await onlineVMClient.createVM(selectedProduct);
                onClose(true);
            } catch {

            } finally {
                setLoadingText('')
            }
        })
    };
    useEffect(() => {
        if (!loaded) (async () => {
            try {
                setLoadingText('加载中');
                const [prods, info] = await Promise.all([onlineVMClient.getProducts(), onlineVMClient.getUserBasicInfo()]);
                const newProds = prods.filter(t => (t.require_student_privilege === info.hasStudentPrivilege));
                const hours = await Promise.all(newProds.map(item => onlineVMClient.getUsedHourForProduct(item.product_id)));
                setProducts(newProds);
                setUsedHours(hours);
                setBasicInfo(info);
                setSelectedProduct(prods[0].product_id);
                setLoaded(true);
            } catch {

            } finally {
                setLoadingText('')
            }
        })();
    }, [loaded]);
    return <Modal size="large" open>
        <Modal.Header>创建新的虚拟机</Modal.Header>
        <Modal.Content>
            {loadingText !== '' && <Dimmer active>
                <Loader>{loadingText}</Loader>
            </Dimmer>}

            {loaded && basicInfo !== null && <>
                <p>当前身份：{basicInfo.hasStudentPrivilege ? "学员，可以购买学员专属虚拟机" : "非学员，不能购买学员专属虚拟机"}</p>
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>产品编号</Table.HeaderCell>
                            <Table.HeaderCell>产品名</Table.HeaderCell>
                            <Table.HeaderCell>产品介绍</Table.HeaderCell>
                            <Table.HeaderCell>收费策略</Table.HeaderCell>
                            <Table.HeaderCell>此产品已使用小时数</Table.HeaderCell>
                            <Table.HeaderCell>操作</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {_.zip(products, usedHours).map(([prod, hour]) => <Table.Row
                            positive={prod!.product_id === selectedProduct}
                            key={prod!.product_id}
                        >
                            <Table.Cell >{prod!.product_id}</Table.Cell>
                            <Table.Cell>{prod!.name}</Table.Cell>
                            <Table.Cell><Markdown markdown={prod!.description}></Markdown></Table.Cell>
                            <Table.Cell><ChargeSchemaList data={prod!.charge_schema}></ChargeSchemaList></Table.Cell>
                            <Table.Cell>{hour!.hours}</Table.Cell>
                            <Table.Cell><Button disabled={selectedProduct === prod!.product_id} size="small" color="green" onClick={() => setSelectedProduct(prod!.product_id)}>{selectedProduct === prod!.product_id ? "已选择" : "选择"}</Button></Table.Cell>
                        </Table.Row>)}
                    </Table.Body>
                </Table></>}
            <Message info>
                <Message.Header>说明</Message.Header>
                <Message.Content>
                    <p>虚拟机采取阶梯计费，每种产品的计费模式请参考上表说明。计费时，不足一小时按一小时计。每个小时开始时，会从余额中扣除这个小时的费用。如果用户的余额不足，则会自动退还对应的服务器。</p>
                    <p>对于同一种产品，同一个用户的不同订单之间，单独计费，但使用时长（折算成小时）可以累计。例如，如果用户创建了产品1的订单后使用了一个半小时，而后退还了这台服务器。而后又创建了产品产品1的订单，则计费从第3小时对应的档位开始。</p>
                </Message.Content>
            </Message>
        </Modal.Content>
        <Modal.Actions>
            <Button color="red" onClick={() => onClose(false)} disabled={loadingText !== ''}>取消</Button>
            <Button color="green" onClick={doCreate} disabled={loadingText !== ''}>确认</Button>
        </Modal.Actions>
    </Modal>
};

export default CreateVMModal;

