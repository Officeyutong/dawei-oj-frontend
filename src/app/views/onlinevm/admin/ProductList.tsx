import { useEffect, useState } from "react";
import { OnlineVMProduct } from "../client/types";
import onlineVMClient from "../client/OnlineVMClient";
import { Button, Dimmer, Divider, Loader, Table } from "semantic-ui-react";
import { showSuccessPopup } from "../../../dialogs/Utils";
import { showConfirm } from "../../../dialogs/Dialog";
import ProductEditModal from "./ProductEditModal";
import ChargeSchemaList from "../utils/ChargeSchemaList";

const ProductList: React.FC<{}> = () => {
    const [data, setData] = useState<OnlineVMProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [showingProduct, setShowingProduct] = useState<OnlineVMProduct | null>(null);
    const loadData = async () => {
        try {
            setLoading(true);
            setData(await onlineVMClient.getProducts());
            setLoaded(true);
        } catch { } finally {
            setLoading(false);
        }
    }
    const doCreate = async () => {
        try {
            setLoading(true);
            await onlineVMClient.createProduct();
        } catch { } finally {
            setLoading(false);
        }
        await loadData();
        showSuccessPopup("创建完成！")
    };
    const doRemove = (id: number) => showConfirm("您确定要删除此产品吗？这个操作不可逆。", async () => {
        try {
            setLoading(true);
            await onlineVMClient.removeProduct(id);
        } catch { } finally {
            setLoading(false);
        }
        await loadData();
        showSuccessPopup("删除成功！")
    })
    useEffect(() => {
        if (!loaded) loadData();
    }, [loaded]);
    return <>
        {showingProduct && <ProductEditModal
            onClose={flag => {
                if (flag) loadData();
                setShowingProduct(null);
            }}
            product={showingProduct}
        ></ProductEditModal>}
        {loading && <Dimmer active><Loader></Loader></Dimmer>}
        <Button size="small" color="green" onClick={doCreate}>创建商品</Button>
        <Divider></Divider>
        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>产品ID</Table.HeaderCell>
                    <Table.HeaderCell>产品名</Table.HeaderCell>
                    <Table.HeaderCell>收费模式</Table.HeaderCell>
                    <Table.HeaderCell>描述</Table.HeaderCell>
                    <Table.HeaderCell>操作</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {data.map(item => <Table.Row key={item.product_id}>
                    <Table.Cell>{item.product_id}</Table.Cell>
                    <Table.Cell>{item.name}</Table.Cell>
                    <Table.Cell>
                        <ChargeSchemaList data={item.charge_schema}></ChargeSchemaList>
                    </Table.Cell>
                    <Table.Cell>
                        {item.description}
                    </Table.Cell>
                    <Table.Cell>
                        <Button size="small" color="red" onClick={() => doRemove(item.product_id)}>删除</Button>
                        <Button size="small" color="green" onClick={() => setShowingProduct(item)}>查看与编辑</Button>
                    </Table.Cell>
                </Table.Row>)}
            </Table.Body>
        </Table>
    </>
};

export default ProductList;
