import React from "react";
import { GeneralUserEntry } from "../../common/types";

type UserLinkProps = {
    data: Pick<GeneralUserEntry, "uid" | "username">;
    withUID?: boolean;
    style?: React.CSSProperties;
};

const UserLink: React.FC<React.PropsWithChildren<UserLinkProps>> = ({
    data, withUID, style
}) => {
    return <a target="_blank" rel="noreferrer" style={style} href={`/profile/${data.uid}`}>{withUID && `#${data.uid}.`} {data.username}</a>;
};

export default UserLink;
