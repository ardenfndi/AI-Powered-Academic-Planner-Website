import "./App.css";
import Builder from "../components/Builder";
import { usePlanner } from "../store/usePlanner";

export default function App() {
  const placed = usePlanner((s) => s.placed);
  const reasoning = usePlanner((s) => s.reasoning);
  const loading = usePlanner((s) => s.loading);
  const error = usePlanner((s) => s.error);
  const solveNow = usePlanner((s) => s.solveNow);

  async function handleGenerateSchedule() {
    await solveNow();
  }

  return (
    <div>
      <div className="topbar">
        <div className="container topbar-inner">
          <div style={{ fontWeight: 800 }}>Academic Planner</div>
        </div>
      </div>

      <div
        className="container"
        style={{ paddingTop: "32px", paddingBottom: "32px" }}
      >
        {/* Ders & slot ekleme UI */}
        <Builder />

        {/* Ders Programını Oluştur bölümü */}
        <div
          style={{
            marginTop: "32px",
            padding: "20px",
            borderRadius: "16px",
            background: "#05060a",
            border: "1px solid #2a2f3a",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <h2 style={{ fontSize: "20px", fontWeight: 700 }}>
              Ders Programını Oluştur
            </h2>

            <button
              onClick={handleGenerateSchedule}
              disabled={loading}
              style={{
                padding: "8px 16px",
                borderRadius: "999px",
                border: "none",
                cursor: loading ? "default" : "pointer",
                background: loading ? "#4b5563" : "#2563eb",
                color: "white",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              {loading ? "Hesaplanıyor..." : "Programı Oluştur"}
            </button>
          </div>

          {/* Hata */}
          {error && (
            <div
              style={{
                marginBottom: "12px",
                padding: "8px 12px",
                borderRadius: "8px",
                background: "#451a1a",
                color: "#fecaca",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}

          {/* Sonuç kartı – SADECE AI AÇIKLAMASI, JSON YOK */}
          {(reasoning || placed.length > 0) && (
            <div
              style={{
                marginTop: "8px",
                padding: "12px 12px 8px",
                borderRadius: "12px",
                background: "#020617",
                border: "1px solid #1f2937",
                color: "white",
                fontSize: "13px",
              }}
            >
              {reasoning && (
                <>
                  <div style={{ marginBottom: "8px", fontWeight: 600 }}>
                    AI Açıklaması
                  </div>
                  <p
                    style={{
                      marginBottom: "12px",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {reasoning}
                  </p>
                </>
              )}
              {/* Seçilen Slotlar JSON BLOĞU BURADAN SİLİNDİ */}
            </div>
          )}

          {/* İlk açılış mesajı */}
          {!reasoning && placed.length === 0 && !error && !loading && (
            <p style={{ fontSize: "13px", opacity: 0.8 }}>
              Üstten ders ve slot ekledikten sonra{" "}
              <b>Programı Oluştur</b> düğmesine bas. Backend&apos;de
              <code> /api/solve</code> çağrılacak ve seçilen program & AI
              açıklaması burada görünecek.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
