import WeeklyGrid from "../../components/WeeklyGrid";
import { usePlanner } from "../../store/usePlanner";

export default function Schedule() {
  const { placed } = usePlanner();
  return (
    <div className="container">
      <h2>Final Program</h2>
      <WeeklyGrid items={placed}/>
    </div>
  );
}
