import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function RiskGauge({ value }) {
  let color = "#22c55e"; // green
  if (value > 40) color = "#f59e0b"; // amber
  if (value > 70) color = "#ef4444"; // red

  return (
    <div className="w-48 mx-auto mt-4">
      <CircularProgressbar
        value={value}
        maxValue={100}
        text={`${value}%`}
        circleRatio={0.75}
        styles={buildStyles({
          rotation: 0.625,
          strokeLinecap: "round",
          textSize: "18px",
          pathColor: color,
          textColor: "#111827",
          trailColor: "#fde68a",
        })}
      />
    </div>
  );
}
