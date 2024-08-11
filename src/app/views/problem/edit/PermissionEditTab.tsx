import React from "react";
import { Checkbox, Form, Input } from "semantic-ui-react";
import { ProblemUpdateInfo } from "../client/types";
import { v4 as uuidv4 } from "uuid";
type ProblemPermission = Pick<ProblemUpdateInfo, "public" | "invite_code" | "submissionVisible" | "submissionVisibleCondition">;

interface PermissionEditProps extends ProblemPermission {
    onUpdate: (data: ProblemPermission) => void;
};

const PermissionEdit: React.FC<React.PropsWithChildren<PermissionEditProps>> = (props) => {

    const data: ProblemPermission = {
        public: props.public,
        invite_code: props.invite_code,
        submissionVisible: props.submissionVisible,
        submissionVisibleCondition: props.submissionVisibleCondition
    };
    const update = (idata: ProblemPermission) => {
        props.onUpdate({
            invite_code: idata.invite_code,
            public: idata.public,
            submissionVisible: idata.submissionVisible,
            submissionVisibleCondition: idata.submissionVisibleCondition
        });
    };
    return <div>
        <Form>
            <Form.Field>
                <Checkbox
                    checked={props.public}
                    toggle
                    onChange={() => update({ ...data, public: !data.public })}
                    label="公开(如果此题非公开，则用户需要具有相应权限才可使用)"
                ></Checkbox>
            </Form.Field>
            {!data.public && <>
                <Form.Field>
                    <label>邀请码</label>
                    <Input actionPosition="left" action={{
                        content: "随机生成",
                        onClick: () => update({ ...data, invite_code: uuidv4() })
                    }} value={data.invite_code} onChange={(e, d) => update({ ...data, invite_code: d.value })}></Input>
                </Form.Field>
                <Form.Field>
                    <Checkbox
                        checked={data.submissionVisible}
                        toggle
                        onChange={() => update({ ...data, submissionVisible: !data.submissionVisible })}
                        label="允许用户查看其他人的提交(如果勾选，则有权限使用该题目的用户可以在一定条件下，查看本题目中其他人的提交)"
                    ></Checkbox>
                </Form.Field>
                <Form.Group inline>
                    <label>提交查看条件</label>
                    <Form.Radio onClick={() => update({ ...data, submissionVisibleCondition: "no_condition" })} label="无条件（用户可以在任何情况下，查看此题目中其他用户的非比赛提交，和已经结束的比赛中的提交）" checked={data.submissionVisibleCondition === "no_condition"}></Form.Radio>
                    <Form.Radio onClick={() => update({ ...data, submissionVisibleCondition: "must_accepted" })} label="必须通过此题目（即用户必须要在非比赛提交，或者已经关闭的比赛的提交中通过此题目，才能查看其他人在此题目的提交）" checked={data.submissionVisibleCondition === "must_accepted"}></Form.Radio>
                </Form.Group>
            </>}
        </Form>
    </div>;
};
export default PermissionEdit;
