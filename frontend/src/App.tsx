import "./App.css";
import Builder from "../components/Builder";
import Schedule from "../src/pages/Schedule";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { usePlanner } from "../store/usePlanner";

function Topbar() {
  const nav = useNavigate();
  const { solveNow } = usePlanner();

  const onContinue = async () => {
    await solveNow();
    nav("/src/pages/Schedule"); // route path aşağıda "/src/pages/Schedule" değil...
  };

  return (
    <div className="topbar">
      <div className="container topbar-inner">
        <div style={{fontWeight:800}}>Academic Planner</div>
        <div className="row">
          <button className="btn" onClick={()=>nav("/")}>Builder</button>
          <button className="btn btn-primary" onClick={async()=>{
            await solveNow(); nav("/schedule");
          }}>Continue</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Topbar/>
      <Routes>
        <Route path="/" element={<Builder/>} />
        <Route path="/schedule" element={<Schedule/>} />
      </Routes>
    </BrowserRouter>
  );
}
