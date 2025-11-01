import "./App.css";
import Builder from "../components/Builder";

export default function App() {
  return (
    <div>
      <div className="topbar">
        <div className="container topbar-inner">
          <div style={{ fontWeight: 800 }}>Academic Planner</div>
        </div>
      </div>
      <Builder />
    </div>
  );
}
