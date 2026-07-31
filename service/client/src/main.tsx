import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Activity, Database, Server } from "lucide-react";
import "./styles.css";

type HealthResponse = {
  status: string;
  database: string;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${apiBaseUrl}/health`, {
      headers: {
        "X-Member-Id": "1",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return response.json() as Promise<HealthResponse>;
      })
      .then(setHealth)
      .catch((error: unknown) => {
        setErrorMessage(error instanceof Error ? error.message : "서버 상태를 확인할 수 없습니다.");
      });
  }, []);

  return (
    <main className="page">
      <section className="status-panel">
        <div className="eyebrow">Lv1 Workspace</div>
        <h1>기록방 서비스 실행 골격</h1>
        <p>서버, 클라이언트, DB, Docker 실행 흐름을 확인하기 위한 첫 화면입니다.</p>

        <div className="status-grid">
          <StatusCard
            icon={<Server size={28} />}
            title="Server"
            value={health?.status ?? "CHECKING"}
            tone={health?.status === "UP" ? "good" : "wait"}
          />
          <StatusCard
            icon={<Database size={28} />}
            title="Database"
            value={health?.database ?? "CHECKING"}
            tone={health?.database === "UP" ? "good" : "wait"}
          />
          <StatusCard icon={<Activity size={28} />} title="Seed Member" value="X-Member-Id: 1" tone="info" />
        </div>

        {errorMessage ? <div className="error-box">서버 연결 실패: {errorMessage}</div> : null}
      </section>
    </main>
  );
}

function StatusCard({
  icon,
  title,
  value,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  tone: "good" | "wait" | "info";
}) {
  return (
    <article className={`status-card ${tone}`}>
      <div className="icon-box">{icon}</div>
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
