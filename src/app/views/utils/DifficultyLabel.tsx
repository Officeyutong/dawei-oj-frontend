import { useSelector } from "react-redux";
import { Label } from "semantic-ui-react";
import { StateType } from "../../states/Manager";

interface DifficultyLabelProps {
    difficulty: number;
}
const DifficultyLabel: React.FC<DifficultyLabelProps> = ({ difficulty }) => {
    const {  difficultyDisplayMap } = useSelector((s: StateType) => s.userState.userData);
    const diffStr = difficulty.toString();
    const obj = difficultyDisplayMap[diffStr];
    const displayStr = obj.display || `难度 ${difficulty}`;
    return <Label color={obj.color || ""}>{displayStr}</Label>
}

export default DifficultyLabel;
