import { Affix, Typography } from "antd";
import HomePageTopMenuNew from "./TopMenuNew";
import { useSelector } from "react-redux";
import { StateType } from "../states/Manager";
import TimedProblemSetCard from "./TimedProblemsetCard";

const BaseViewNew: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const { displayRepoInFooter, appName } = useSelector((s: StateType) => s.userState.userData);
    const hasActiveTimedProblemset = useSelector((s: StateType) => s.userState.userData.currentActiveTimedProblemset !== null);
    return <>
        <Affix><HomePageTopMenuNew></HomePageTopMenuNew></Affix>
        {children}
        <Typography.Text style={{ textAlign: "center" }}>
            <div style={{ color: "darkgrey" }} >
                {displayRepoInFooter ? <>
                    {appName} powered by <a href="https://github.com/Officeyutong/HelloJudge2">HelloJudge2</a>
                </> : <>
                    {appName} by DavidOI
                </>
                }
            </div>
        </Typography.Text>
        {hasActiveTimedProblemset &&
            <TimedProblemSetCard extraStyle={{ position: "fixed", bottom: 0, left: 20, zIndex: 999 }}></TimedProblemSetCard>
        }
    </>
};

export default BaseViewNew;
