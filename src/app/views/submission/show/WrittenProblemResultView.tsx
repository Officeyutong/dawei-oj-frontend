import { useMemo } from "react";
import { ProblemInfo, WrittenTestAnswer, WrittenTestQuestion } from "../../problem/client/types";
import { SubmissionInfo } from "../client/types";
import WrittenTestStatementAndSubmit from "../../problem/WrittenTestStatementAndSubmit";

interface WrittenProblemResultViewProps {
    problemStmt: WrittenTestQuestion<false>[];
    subtaskResult: SubmissionInfo["judge_result"];
    userCode: WrittenTestAnswer[];
    problemSubtasks: ProblemInfo["subtasks"];
}

const WrittenProblemResultView: React.FC<WrittenProblemResultViewProps> = ({
    problemStmt, subtaskResult, userCode, problemSubtasks
}) => {
    console.log(subtaskResult, problemSubtasks);
    const scoreSequence = useMemo(() => {
        const result = [];
        for (let i = 0; i < problemStmt.length; i++) {
            const key = `prob-${i}`;
            const score = subtaskResult[key]?.score || 0;
            const fullScore = problemSubtasks[i]?.score || 0;
            result.push({ score, fullScore });
        }
        return result;
    }, [problemStmt.length, problemSubtasks, subtaskResult]);
    return <WrittenTestStatementAndSubmit
        content={problemStmt}
        statement={{ background: "", content: "", title: "" }}
        defaultContent={userCode}
        handleSubmit={undefined}
        scoreLabels={scoreSequence}
    ></WrittenTestStatementAndSubmit>
};
export default WrittenProblemResultView;
