import React from "react";
import { Feed, Label } from "semantic-ui-react";
import { converter } from "../../common/Markdown";
import { FeedStreamEntry } from "./client/types";
import { makeProfileImageURL } from "../../common/Utils";

const FeedArea: React.FC<React.PropsWithChildren<{ data: FeedStreamEntry[]; withProfileImage: boolean; showTopLabel?: boolean; }>> = ({ data, withProfileImage, showTopLabel }) => {
    return <Feed>
        {data.map((x, i) => <Feed.Event key={i}>
            {withProfileImage && <Feed.Label>
                <img src={makeProfileImageURL(x.uid)} alt=""></img>
            </Feed.Label>}
            <Feed.Content>
                <Feed.Summary>
                    <a href={`/profile/${x.uid}`} target="_blank" rel="noreferrer">{x.username}</a>发送了动态{showTopLabel && x.top && <Label size="tiny" color="red">置顶</Label>}<Feed.Date>{x.time} - ID: {x.id}</Feed.Date>
                </Feed.Summary>
                <Feed.Extra>
                    <div dangerouslySetInnerHTML={{ __html: converter.makeHtml(x.content) }}></div>
                </Feed.Extra>
            </Feed.Content>
        </Feed.Event>)}
    </Feed>
};

export default FeedArea;
