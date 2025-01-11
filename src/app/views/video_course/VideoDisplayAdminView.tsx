import { useMemo } from "react";
import { VideoCourseEntry } from "./client/types";
import "highlight.js/styles/default.css"
import hljs from 'highlight.js';
import CytoscapeComponent from "react-cytoscapejs";
import { Form, Header, Segment } from "semantic-ui-react";

const VideoDisplayAdminView: React.FC<{
    nodeId: number;
    courseDetail: VideoCourseEntry
}> = ({ nodeId, courseDetail }) => {
    const renderedSchema = useMemo(() => {
        return hljs.highlight(JSON.stringify(courseDetail.schema, undefined, 4), { language: "json", ignoreIllegals: true }).value
    }, [courseDetail]);

    const elements: cytoscape.ElementDefinition[] = useMemo(() => {

        const result = [];
        for (const item of courseDetail.schema) {

            if (item.type === "video") {
                result.push({
                    data: { id: item.id.toString(), }
                });

                if (item.next !== null) {
                    result.push({
                        data: {
                            id: `${item.id}-${item.next}`,
                            source: item.id.toString(),
                            target: item.next.toString(),

                        }
                    })
                }
            } else if (item.type === "choice_question") {
                result.push({
                    data: { id: item.id.toString() }
                });
                for (const content of item.content) {
                    result.push({
                        data: {
                            id: `${item.id}-${content.next}`,
                            source: item.id.toString(),
                            target: content.next.toString(),
                            name: content.content
                        }
                    })
                }
            }
        }
        return result;
    }, [courseDetail]);
    const styles = useMemo(() => {
        const result: cytoscape.Stylesheet[] = [

            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': 'blue',
                    'target-arrow-color': 'blue',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                }
            }
        ];
        courseDetail.schema.forEach(item => {
            if (item.type === "video") {
                result.push({
                    selector: `[id = "${item.id}"]`,
                    style: {
                        'background-color': 'blue',
                        'label': `视频点 ${item.id} （切片ID ${item.video_id}）`
                    }
                });
            } else if (item.type === "choice_question") {
                result.push({
                    selector: `[id = "${item.id}"]`,
                    style: {
                        'background-color': 'red',
                        'label': `选择题点 ${item.id}`
                    }
                });
                item.content.map((val, idx) => result.push({
                    selector: `[id = "${item.id}-${val.next}"]`,
                    style: {
                        'label': `选项 ${String.fromCharCode(1 + idx + 64)}: ${val.content}`,
                        'line-color': 'red',
                        'target-arrow-color': 'red',
                    }
                }))

            }
        })
        return result;
    }, [courseDetail.schema]);

    return <>
        <Header>视频详情 （管理员调试用，普通用户不会看到）</Header>
        <Segment>
            <Form>
                <Form.Field>
                    <label>当前点ID</label>
                    {nodeId}
                </Form.Field>
                <Form.Group widths={2}>
                    <Form.Field>
                        <label>视频Schema</label>
                        {renderedSchema !== null && <pre style={{ marginTop: 0 }} className="code-block" dangerouslySetInnerHTML={{ __html: renderedSchema }}>
                        </pre>}
                    </Form.Field>
                    <Form.Field>
                        <label>图结构</label>
                        <Segment
                            style={{
                                overflowX: "scroll",
                                overflowY: "scroll",
                                height: "500px"
                            }}
                        >
                            <CytoscapeComponent
                                maxZoom={3}
                                minZoom={0.5}
                                elements={elements}
                                stylesheet={styles}
                                layout={{
                                    name: "breadthfirst"
                                }}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                }}
                            ></CytoscapeComponent>
                        </Segment>
                    </Form.Field>
                </Form.Group>
            </Form>
        </Segment>
    </>
};

export default VideoDisplayAdminView;
