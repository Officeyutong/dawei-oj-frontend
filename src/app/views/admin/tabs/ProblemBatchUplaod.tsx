
import { useRef, useState } from "react";
import { Button, Form, Input, Label, Message, Progress, Table } from "semantic-ui-react";
import { showErrorModal } from "../../../dialogs/Dialog";
import { ProblemBatchUploadResponseEntry } from "../client/types";
import { adminClient } from "../client/AdminClient";
import UploadExample from "../../../assets/batch_upload_example.zip";
import { useSelector } from "react-redux";
import { StateType } from "../../../states/Manager";
const ProblemBatchUpload = () => {
    const {minProblemDifficulty,maxProblemDifficulty} = useSelector((s:StateType)=>s.userState.userData);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const uploadInputRef = useRef<Input>(null);
    const [successData, setSuccessData] = useState<ProblemBatchUploadResponseEntry[] | null>(null);
    const doFileUplpad = async () => {
        try {
            setSuccessData(null);
            setUploading(true);
            setProgress(0);
            const refVal = uploadInputRef.current!;
            const inputRef = refVal as (typeof refVal & {
                inputRef: {
                    current: HTMLInputElement
                }
            });
            const files = inputRef.inputRef.current.files;
            if (!files || files.length === 0) {
                showErrorModal("请选择文件!");
                return;
            }
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                const item = files[i];
                formData.append(
                    item.name, item, item.name
                );
            }
            const resp = await adminClient.doBatchProblemUpload(formData, (evt: ProgressEvent) => {
                setProgress(Math.floor(evt.loaded / evt.total * 100));
            });
            setSuccessData(resp);
            inputRef.inputRef.current.files = null;
        } catch (e) { showErrorModal(String(e)) } finally {
            setUploading(false);
        }
    };
    return <div>
        <Message>
            <Message.Header>关于题目批量上传</Message.Header>
            <p>题目批量上传需要提供一个zip压缩包，其中包含</p>
            <Message.List>
                <Message.Item>一个名为data.xlsx的文件。文件内容见下文。</Message.Item>
                <Message.Item>若干个文件夹，其中每个文件夹对应一个题目。这个文件夹中存放有该题目会用到的文件，比如测试数据。OJ会自动根据文件名来生成测试点。</Message.Item>
            </Message.List>
            <p>data.xlsx的格式</p>
            <Message.List>
                <Message.Item>每行表示一道题目，按列存放题目不同部分的数据。每一列需要的数据如下</Message.Item>
                <Message.Item>
                    <Table celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell></Table.HeaderCell>
                                <Table.HeaderCell>A</Table.HeaderCell>
                                <Table.HeaderCell>B</Table.HeaderCell>
                                <Table.HeaderCell>C</Table.HeaderCell>
                                <Table.HeaderCell>D</Table.HeaderCell>
                                <Table.HeaderCell>E</Table.HeaderCell>
                                <Table.HeaderCell>F</Table.HeaderCell>
                                <Table.HeaderCell>G</Table.HeaderCell>
                                <Table.HeaderCell>H</Table.HeaderCell>
                                <Table.HeaderCell>I</Table.HeaderCell>
                                <Table.HeaderCell>J</Table.HeaderCell>
                                <Table.HeaderCell>K</Table.HeaderCell>
                                <Table.HeaderCell>L</Table.HeaderCell>
                                <Table.HeaderCell>M</Table.HeaderCell>
                                <Table.HeaderCell>N</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            <Table.Row>
                                <Table.Cell>1</Table.Cell>
                                <Table.Cell><Label>problem</Label></Table.Cell>
                                <Table.Cell>[存放题目数据的文件夹名]</Table.Cell>
                                <Table.Cell>[题目的名字]</Table.Cell>
                                <Table.Cell>[题目的背景]</Table.Cell>
                                <Table.Cell>[题目的正文]</Table.Cell>
                                <Table.Cell>[题目的输入格式]</Table.Cell>
                                <Table.Cell>[题目的输出格式]</Table.Cell>
                                <Table.Cell>[题目的提示]</Table.Cell>
                                <Table.Cell>[题目的难度]</Table.Cell>
                                <Table.Cell><Label>以英文逗号分隔的题目标签ID</Label></Table.Cell>
                                <Table.Cell><Label>_example</Label></Table.Cell>
                                <Table.Cell>[第一个样例的输入内容]</Table.Cell>
                                <Table.Cell>[第一个样例的输出内容]</Table.Cell>
                                <Table.Cell><Label>可以参考K~M列以添加更多样例</Label></Table.Cell>
                            </Table.Row>
                        </Table.Body>
                    </Table>
                </Message.Item>
                <Message.Item>
                    每一行的第一列必须固定为problem，否则系统不会识别该行
                </Message.Item>
                <Message.Item><Label>存放题目数据的文件夹名</Label>可以为空，此时系统不会为这个题目自动上传文件</Message.Item>
                <Message.Item>如果第K列的内容是<Label>_example</Label>，那么系统会把接下来两列的内容识别为一组样例的输入和输出。可以按照相同的规则继续添加更多的样例。</Message.Item>
                <Message.Item>
                    可以点击<a target="_blank" rel="noreferrer" href={UploadExample}>此处</a>下载批量上传示例文件
                </Message.Item>
                <Message.Item>题目难度必须是一个不低于{minProblemDifficulty}，不高于{maxProblemDifficulty}的整数。不得为空。</Message.Item>
                <Message.Item><Label>存放题目数据的文件夹名</Label>中不能包含中文或中文符号。</Message.Item>
            </Message.List>
        </Message>
        {successData && <Message success>
            <Message.Header>上传成功！</Message.Header>
            <Message.List>
                <Message.Item>上传了以下题目</Message.Item>
                <Message.Item>
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>题目ID</Table.HeaderCell>
                                <Table.HeaderCell>题目名称</Table.HeaderCell>
                                <Table.HeaderCell>文件数</Table.HeaderCell>
                                <Table.HeaderCell>测试点数</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {successData.map(item => <Table.Row key={item.id}>
                                <Table.Cell>{item.id}</Table.Cell>
                                <Table.Cell>{item.title}</Table.Cell>
                                <Table.Cell>{item.files}</Table.Cell>
                                <Table.Cell>{item.testcases}</Table.Cell>
                            </Table.Row>)}
                        </Table.Body>
                    </Table>
                </Message.Item>
            </Message.List>
        </Message>
        }
        <Form>
            {uploading && <Form.Field>
                <Progress percent={progress} active></Progress>
            </Form.Field>}
            <Form.Field>
                <Input disabled={uploading} type="file" fluid ref={uploadInputRef} multiple></Input>
            </Form.Field>
            <Button color="green" onClick={doFileUplpad} disabled={uploading}>
                上传
            </Button>
        </Form>
    </div>
}

export default ProblemBatchUpload;
