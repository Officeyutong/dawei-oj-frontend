import React, { useCallback, useState } from "react";
import { Button, Checkbox, Dimmer, Form, Header, Input, Loader, Message, Segment } from "semantic-ui-react";
import { showConfirm, showSuccessModal } from "../../../../dialogs/Dialog";
import { showSuccessPopup } from "../../../../dialogs/Utils";
import problemClient from "../../client/ProblemClient";
import { ProblemEditReceiveInfo } from "../../client/types";
import ExtraParameterConfig from "./ExtraParameterEdit";
import SubtaskEdit from "./subtask/SubtasksEdit";

type DataEntryProps = Pick<ProblemEditReceiveInfo,
    "extra_parameter" |
    "input_file_name" |
    "output_file_name" |
    "spj_filename" |
    "subtasks" |
    "using_file_io" |
    "files" |
    "problem_type" |
    "allowManualGrading" |
    "problem_type"
>;

interface ProblemDataProps extends DataEntryProps {
    id: number;
    onUpdate: (data: DataEntryProps) => void;
};



const ProblemJudgeTab: React.FC<React.PropsWithChildren<ProblemDataProps>> = (data) => {
    const update = useCallback((localData: Partial<DataEntryProps>) => {
        const { extra_parameter, files, input_file_name, output_file_name, problem_type, spj_filename, subtasks, using_file_io, allowManualGrading } = {
            extra_parameter: data.extra_parameter,
            files: data.files,
            input_file_name: data.input_file_name,
            output_file_name: data.output_file_name,
            problem_type: data.problem_type,
            spj_filename: data.spj_filename,
            subtasks: data.subtasks,
            using_file_io: data.using_file_io,
            allowManualGrading: data.allowManualGrading,
            ...localData
        };
        data.onUpdate({
            extra_parameter, files, input_file_name, output_file_name, problem_type, spj_filename, subtasks, using_file_io, allowManualGrading
        });
    }, [data]);
    const [loading, setLoading] = useState(false);
    const refreshCache = async () => {
        try {
            setLoading(true);
            await problemClient.refreshCachedCount(data.id);
            showSuccessPopup("刷新完成");
        } catch { } finally {
            setLoading(false);
        }
    };
    const rejudgeAll = () => {
        showConfirm("重测可能会消耗大量评测资源，您确定要继续吗?", async () => {
            try {
                setLoading(true);
                await problemClient.rejudgeAll(data.id);
                showSuccessModal("重测请求已提交，请查看评测队列.");
            } catch { } finally {
                setLoading(false);
            }
        });
    };
    const updateExtraParameter = useCallback((d: any) => update({ extra_parameter: d }), [update]);
    const updateSubtasks = useCallback((d: any) => update({ subtasks: d }), [update]);

    const convertToLocalProblem = () => showConfirm("确认要将这个题目转换为本地评测题目吗？转换完成后，需要重新上传题目文件并配置子任务。此操作不可逆。", async () => {
        try {
            setLoading(true);
            await problemClient.switchToLocalProblem(data.id);
            window.location.reload();
        } catch { } finally {
            setLoading(false);
        }
    });

    return <div>
        {loading && <Dimmer active>
            <Loader></Loader>
        </Dimmer>}
        <Header as="h3">
            工具
        </Header>
        <div>
            <Button color="blue" onClick={refreshCache}>刷新缓存的提交数与AC数</Button>
            <Button color="blue" onClick={rejudgeAll}>重测本题所有提交</Button>
        </div>
        <Header as="h3">
            评测方式设定
        </Header>
        <Segment>
            <Form>
                <Form.Field>
                    <label>SPJ文件名</label>
                    <Input placeholder="留空以不使用SPJ" value={data.spj_filename} onChange={(_, d) => update({ ...data, spj_filename: d.value })}></Input>
                </Form.Field>
                <Form.Group widths="equal">
                    <Form.Field disabled={!data.using_file_io}>
                        <label>输入文件名</label>
                        <Input value={data.input_file_name} onChange={(_, d) => update({ ...data, input_file_name: d.value })}></Input>
                    </Form.Field>
                    <Form.Field disabled={!data.using_file_io}>
                        <label>输出文件名</label>
                        <Input value={data.output_file_name} onChange={(_, d) => update({ ...data, output_file_name: d.value })}></Input>
                    </Form.Field>
                </Form.Group>
                <Form.Field>
                    <Checkbox label="使用文件IO" toggle checked={data.using_file_io} onChange={() => update({ ...data, using_file_io: !data.using_file_io })}></Checkbox>
                </Form.Field>
                <Form.Field>
                    <Checkbox label="允许人工评测" toggle checked={data.allowManualGrading} onChange={() => update({ ...data, allowManualGrading: !data.allowManualGrading })}></Checkbox>
                </Form.Field>
                <Form.Field>
                    <label>题目类型</label>
                    <Button.Group>
                        <Button onClick={() => update({ problem_type: "traditional" })} active={data.problem_type === "traditional"} disabled={data.problem_type === "remote_judge"}>传统题</Button>
                        <Button onClick={() => update({ problem_type: "submit_answer" })} active={data.problem_type === "submit_answer"} disabled={data.problem_type === "remote_judge"}>提交答案题</Button>
                        <Button onClick={() => update({ problem_type: "written_test" })} active={data.problem_type === "written_test"} disabled={data.problem_type === "remote_judge"}>笔试题目</Button>

                        <Button active={data.problem_type === "remote_judge"} disabled>远程评测题目</Button>
                    </Button.Group>
                </Form.Field>
                <Message info>
                    <Message.Header>
                        关于SPJ
                    </Message.Header>
                    <Message.Content>
                        <p>SPJ已支持testlib，<a href="https://github.com/Officeyutong/HelloJudge2-Judger/blob/master/docker/testlib.h">点此下载</a>所使用的修改过的testlib.h</p>
                    </Message.Content>
                </Message>
                {data.problem_type === "submit_answer" && <Message info>
                    <Message.Header>
                        提交答案题提示
                    </Message.Header>
                    <Message.Content>
                        <p>提交答案题会要求用户在提交评测时上传一个zip压缩包，其中包括各个测试点的答案</p>
                        <p>答案的文件名与各个测试点的输出文件名相同</p>
                        <p>SPJ将会被以和普通题目相同的方式运行，目录下的user_out文件会被替换为用户所提交的答案</p>
                    </Message.Content>
                </Message>}
                {data.problem_type === "remote_judge" && <Form.Field>
                    <Button onClick={convertToLocalProblem} color="green">转换为本地评测题目</Button>
                </Form.Field>}
            </Form>
        </Segment>
        <ExtraParameterConfig
            data={data.extra_parameter}
            onUpdate={updateExtraParameter}
        ></ExtraParameterConfig>
        <SubtaskEdit
            subtasks={data.subtasks}
            files={data.files}
            onUpdate={updateSubtasks}
        ></SubtaskEdit>
    </div>;
};

export default ProblemJudgeTab;

export type {
    DataEntryProps,
    ProblemDataProps
};
