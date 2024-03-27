import React, { useEffect, useMemo, useState } from "react";
import { Button, Container, Divider, Form, Grid, Header } from "semantic-ui-react";
import { KeyDownEvent, ProblemTagEntry } from "../../../common/types";
import { useInputValue } from "../../../common/Utils";
import ProblemTagLabel from "../../utils/ProblemTagLabel";
import { ProblemSearchFilter } from "../client/types";
import { useSelector } from "react-redux";
import { StateType } from "../../../states/Manager";

interface ProblemFilterProps {
    filter: ProblemSearchFilter;
    update: (d: ProblemSearchFilter) => void;
    allTags: ProblemTagEntry[];
    showDifficultyFilter: boolean;
    showSortingMethod: boolean;
}

const ProblemFilter: React.FC<React.PropsWithChildren<ProblemFilterProps>> = ({
    filter, update, allTags, showDifficultyFilter, showSortingMethod
}) => {
    const keyword = useInputValue(filter.searchKeyword || "");
    const [usedTags, setUsedTags] = useState(filter.tag || []);
    const tagsMapping = useMemo(() => new Map(allTags.map(x => ([x.id, x]))), [allTags]);
    const [showTags, setShowTags] = useState(false);
    const { minProblemDifficulty, maxProblemDifficulty } = useSelector((s: StateType) => s.userState.userData);
    const [currMinDiff, setCurrMinDiff] = useState(1);
    const [currMaxDiff, setCurrMaxDiff] = useState(6);
    useEffect(() => setCurrMinDiff(minProblemDifficulty), [minProblemDifficulty]);
    useEffect(() => setCurrMaxDiff(maxProblemDifficulty), [maxProblemDifficulty]);

    const apply = (sortingMethod: ProblemSearchFilter["sortingMethod"]) => {
        update({
            searchKeyword: keyword.value === "" ? undefined : keyword.value,
            tag: usedTags.length === 0 ? undefined : usedTags,
            maxDifficulty: currMaxDiff,
            minDifficulty: currMinDiff,
            sortingMethod: sortingMethod

        });
    }
    const updateSortingMethod = (newMethod: Required<ProblemSearchFilter["sortingMethod"]>) => {
        apply(newMethod);
    };
    return <>
        <Container style={{ marginTop: "30px" }}>
            <Grid columns="2">
                <Grid.Column width={12}>
                    <Form>
                        <Form.Input label="题目标题" placeholder="按回车键发起搜索" icon="search" {...keyword} onKeyDown={(evt: KeyDownEvent) => {
                            if (evt.key === "Enter") apply(filter.sortingMethod);
                        }}></Form.Input>
                        {showDifficultyFilter && <Form.Group widths={2}>
                            <Form.Input type="number" value={currMinDiff} onChange={(_, d) => setCurrMinDiff(parseInt(d.value))} label="最小难度" onKeyDown={(evt: KeyDownEvent) => {
                                if (evt.key === "Enter") apply(filter.sortingMethod);
                            }}></Form.Input>
                            <Form.Input type="number" value={currMaxDiff} onChange={(_, d) => setCurrMaxDiff(parseInt(d.value))} label="最大难度" onKeyDown={(evt: KeyDownEvent) => {
                                if (evt.key === "Enter") apply(filter.sortingMethod);
                            }}></Form.Input>
                        </Form.Group>}
                        {showSortingMethod && <Form.Group>
                            <label>排序方式</label>
                            <Form.Radio label="题目ID" checked={filter.sortingMethod === "id"} value="id" onChange={() => updateSortingMethod("id")}></Form.Radio>
                            <Form.Radio label="难度升序" checked={filter.sortingMethod === "diffAsc"} value="diffAsc" onChange={() => updateSortingMethod("diffAsc")}></Form.Radio>
                            <Form.Radio label="难度降序" checked={filter.sortingMethod === "diffDesc"} value="diffDesc" onChange={() => updateSortingMethod("diffDesc")}></Form.Radio>
                        </Form.Group>}
                    </Form>
                </Grid.Column>
                <Grid.Column>
                    <Button size="tiny" onClick={() => setShowTags(c => !c)} color="green">
                        {showTags ? "隐藏" : "题目标签筛选"}
                    </Button>
                </Grid.Column>
            </Grid>
        </Container>
        {showTags && <Container>
            <Header as="h3">
                所有标签
            </Header>
            <div>
                {allTags.map((x, i) => <ProblemTagLabel
                    key={i}
                    data={x}
                    onClick={() => setUsedTags(c => [...c.filter(y => y !== x.id), x.id])}
                ></ProblemTagLabel>)}
            </div>
            <Divider></Divider>
            <Header as="h3">
                已选中标签
            </Header>
            <div>
                {usedTags.map((x, u) => <ProblemTagLabel
                    data={tagsMapping.get(x)!}
                    onClick={() => setUsedTags(c => c.filter(y => y !== x))}
                    key={x}
                ></ProblemTagLabel>)}
            </div>
            <Divider></Divider>
            <Button color="red" size="tiny" onClick={() => apply(filter.sortingMethod)}>
                执行搜索
            </Button>
        </Container>}
    </>;
};

export default ProblemFilter;
