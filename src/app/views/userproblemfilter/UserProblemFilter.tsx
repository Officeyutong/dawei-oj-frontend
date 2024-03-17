import { useCallback, useEffect, useMemo, useState } from "react";
import { userProblemFilterClient } from "./client/UserProblemFilterClient";
import { UsableProblemEntry } from "./client/types";
import { useDocumentTitle } from "../../common/Utils";
import { Button, ButtonContent, Container, Dimmer, Divider, Grid, Header, Icon, Loader, Pagination, Segment, Table } from "semantic-ui-react";
import { ProblemTagEntry } from "../../common/types";
import problemClient from "../problem/client/ProblemClient";
import { ProblemSearchFilter } from "../problem/client/types";
import ProblemFilter from "../problem/list/ProblemFilter";
import { Link } from "react-router-dom";
import { PUBLIC_URL } from "../../App";
import ProblemTagLabel from "../utils/ProblemTagLabel";
import CreateProblemSetModal from "./CreateProblemSetModal";

const UserProblemFilter: React.FC<{}> = () => {
    const [filter, setFilter] = useState<ProblemSearchFilter>({});
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageCount, setPageCount] = useState(0);
    const [data, setData] = useState<UsableProblemEntry[]>([]);

    const [allTags, setAllTags] = useState<ProblemTagEntry[]>([]);
    const tagMapping = useMemo(() => new Map(allTags.map(x => ([x.id, x]))), [allTags]);
    const [tagsLoaded, setTagsLoaded] = useState(false);
    const [selectedProblem, setSelectedProblem] = useState<UsableProblemEntry[]>([]);
    const [showProblemSetCreateModal, setShowProblemSetCreateModal] = useState(false);
    const isSelected = useCallback((id: number) => {
        return selectedProblem.find(x => x.id === id) !== undefined;
    }, [selectedProblem]);
    const joinSelected = useCallback((item: UsableProblemEntry) => {
        if (!isSelected(item.id)) setSelectedProblem([...selectedProblem, item]);
    }, [isSelected, selectedProblem]);
    const removeSelected = useCallback((id: number) => {
        setSelectedProblem(selectedProblem.filter(t => t.id !== id));
    }, [selectedProblem]);
    useEffect(() => {
        if (!tagsLoaded) {
            problemClient.getProblemtags().then(resp => {
                setAllTags(resp);
                setTagsLoaded(true);
            })
        }
    }, [tagsLoaded]);
    useDocumentTitle("用户题目筛选");
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const resp = await userProblemFilterClient.getUsableProblems(page, filter.tag || [], filter.searchKeyword);
                setData(resp.data);
                setPageCount(resp.pageCount);
                console.log(resp);
            } catch (e: any) {
            } finally { setLoading(false); }
        })();
    }, [filter, page]);
    return <div>
        <Header as="h1">
            用户题目筛选
        </Header>
        {loading && <Dimmer active><Loader></Loader></Dimmer>}
        {showProblemSetCreateModal && <CreateProblemSetModal
            closeCallback={() => setShowProblemSetCreateModal(false)}
            problems={selectedProblem}
            tagMapping={tagMapping}
        ></CreateProblemSetModal>}
        <Segment stacked>
            <Grid columns={2} relaxed='very' divided>
                <Grid.Column width={8}>
                    <Header as="h3">题目列表</Header>
                    <ProblemFilter
                        allTags={allTags}
                        filter={filter}
                        update={setFilter}
                    ></ProblemFilter>
                    <Divider></Divider>
                    <Table basic="very">
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>
                                    题目编号
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    题目
                                </Table.HeaderCell>
                                <Table.HeaderCell>操作</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {data.map((x, i) => <Table.Row key={x.id}>
                                <Table.Cell textAlign="center">{x.id}</Table.Cell>
                                <Table.Cell >
                                    <Link to={`${PUBLIC_URL}/show_problem/${x.id}`} style={{ fontSize: "16px" }}>
                                        {x.title}
                                    </Link>
                                    <div style={{ maxWidth: "300px", overflowWrap: "break-word", paddingTop: 10 }}>
                                        {x.tags.map(y => <ProblemTagLabel
                                            key={y}
                                            data={tagMapping.has(y) ? tagMapping.get(y)! : { color: "black", display: y }}
                                        ></ProblemTagLabel>)}
                                    </div>
                                </Table.Cell>
                                <Table.Cell>
                                    {isSelected(x.id) ? <Button color="red" onClick={() => removeSelected(x.id)}>移除</Button> : <Button animated color="green" onClick={() => joinSelected(x)}>
                                        <ButtonContent hidden><Icon name='arrow right' /></ButtonContent>
                                        <ButtonContent visible>
                                            加入
                                        </ButtonContent>
                                    </Button>}
                                </Table.Cell>
                            </Table.Row>)}
                        </Table.Body>
                    </Table>
                    <Container textAlign="center">
                        <Pagination
                            totalPages={pageCount}
                            activePage={page}
                            onPageChange={(e, d) => setPage(d.activePage as number)}
                        ></Pagination>
                    </Container>
                </Grid.Column>

                <Grid.Column width={8}>
                    <Header as="h3">候选题目</Header>
                    <Button size="small" onClick={() => setShowProblemSetCreateModal(true)} color="green">创建习题集</Button>
                    <Table basic="very">
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>
                                    题目编号
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    题目
                                </Table.HeaderCell>
                                <Table.HeaderCell>操作</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {selectedProblem.map((x, i) => <Table.Row key={x.id}>
                                <Table.Cell textAlign="center">{x.id}</Table.Cell>
                                <Table.Cell >
                                    <Link to={`${PUBLIC_URL}/show_problem/${x.id}`} style={{ fontSize: "16px" }}>
                                        {x.title}
                                    </Link>
                                    <div style={{ maxWidth: "300px", overflowWrap: "break-word", paddingTop: 10 }}>
                                        {x.tags.map(y => <ProblemTagLabel
                                            key={y}
                                            data={tagMapping.has(y) ? tagMapping.get(y)! : { color: "black", display: y }}
                                        ></ProblemTagLabel>)}
                                    </div>
                                </Table.Cell>
                                <Table.Cell>
                                    {isSelected(x.id) ? <Button color="red" onClick={() => removeSelected(x.id)}>移除</Button> : <Button animated color="green" onClick={() => joinSelected(x)}>
                                        <ButtonContent hidden><Icon name='arrow right' /></ButtonContent>
                                        <ButtonContent visible>
                                            加入
                                        </ButtonContent>
                                    </Button>}
                                </Table.Cell>
                            </Table.Row>)}
                        </Table.Body>

                    </Table>
                </Grid.Column>
            </Grid>
        </Segment>
    </div>
}

export default UserProblemFilter;
