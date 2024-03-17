import { useSelector } from "react-redux";
import { Label, SemanticCOLORS } from "semantic-ui-react";
import { StateType } from "../../states/Manager";

interface DifficultyLabelProps {
    difficulty: number;
}
const DifficultyLabel: React.FC<DifficultyLabelProps> = ({ difficulty }) => {
    const { minProblemDifficulty, maxProblemDifficulty } = useSelector((s: StateType) => s.userState.userData);
    const diff = difficulty - minProblemDifficulty;
    const upper = maxProblemDifficulty - minProblemDifficulty;
    let color: SemanticCOLORS;
    if (diff <= 0.5 * upper) color = "green";
    else if (diff <= 0.7 * upper) color = "yellow"
    else if (diff < upper) color = "orange";
    else color = "red";
    return <Label color={color}>{difficulty}</Label>
}

export default DifficultyLabel;
