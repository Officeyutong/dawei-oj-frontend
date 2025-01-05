import { Header, Tab } from "semantic-ui-react"
import { useDocumentTitle } from "../../../common/Utils"
import VideoClipManage from "./VideoClipManage"
import VideoCourseManage from "./VideoCourseManage"
import VideoCourseDirectoryManage from "./VideoCourseDirectoryManage"

const VideoCourseAdmin: React.FC<{}> = () => {
    useDocumentTitle("视频课管理")

    return <>
        <Header as="h1">视频课管理</Header>
        <Tab renderActiveOnly={false} panes={[
            {
                menuItem: "视频切片管理",
                pane: <Tab.Pane key={1}>
                    <VideoClipManage></VideoClipManage>
                </Tab.Pane>
            },
            {
                menuItem: "视频课程管理",
                pane: <Tab.Pane key={2}>
                    <VideoCourseManage></VideoCourseManage>
                </Tab.Pane>
            },
            {
                menuItem: "视频课目录管理",
                pane: <Tab.Pane key={3}>
                    <VideoCourseDirectoryManage></VideoCourseDirectoryManage>
                </Tab.Pane>
            }
        ]}></Tab>
    </>
}


export default VideoCourseAdmin;
