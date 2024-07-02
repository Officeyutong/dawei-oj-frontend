import { useSelector } from "react-redux";
import { StateType } from "../../states/Manager";

const VisualProgrammingGradeLabel: React.FC<{ level: number }> = ({ level }) => {
    const allLevels = useSelector((s: StateType) => s.userState.userData.visualProgrammingGradeLevel);

    if (level >= 0 && level < allLevels.length) return <div>{allLevels[level]}</div>;
    else return <div>{`评级 ${level}`}</div>;
};

export default VisualProgrammingGradeLabel;
