import { StrictMode, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Bell,
  KeyRound,
  LogOut,
  Mail,
  Phone,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import "./styles.css";

type MemberProfile = {
  id: number;
  displayName: string;
  username: string;
  email: string;
  phoneNumber: string;
  profileImageUrl: string | null;
};

type NotificationSettings = {
  allEnabled: boolean;
  chatEnabled: boolean;
  letterEnabled: boolean;
  memoryEnabled: boolean;
  missionEnabled: boolean;
};

type ApiError = {
  code: string;
  message: string;
  requestId: string;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";
const memberHeader = { "X-Member-Id": "1" };

function App() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [profileForm, setProfileForm] = useState({ displayName: "", profileImageUrl: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const initials = useMemo(() => profile?.displayName.slice(0, 1) ?? "나", [profile]);

  useEffect(() => {
    void loadInitialData();
  }, []);

  async function loadInitialData() {
    setErrorMessage(null);
    try {
      const [profileResponse, settingsResponse] = await Promise.all([
        apiGet<MemberProfile>("/members/me"),
        apiGet<NotificationSettings>("/members/me/notification-settings"),
      ]);
      setProfile(profileResponse);
      setSettings(settingsResponse);
      setProfileForm({
        displayName: profileResponse.displayName,
        profileImageUrl: profileResponse.profileImageUrl ?? "",
      });
    } catch (error) {
      setErrorMessage(toMessage(error));
    }
  }

  async function saveProfile() {
    setMessage(null);
    setErrorMessage(null);
    try {
      const updatedProfile = await apiRequest<MemberProfile>("/members/me/profile", {
        method: "PATCH",
        body: {
          displayName: profileForm.displayName,
          profileImageUrl: profileForm.profileImageUrl || null,
        },
      });
      setProfile(updatedProfile);
      setProfileForm({
        displayName: updatedProfile.displayName,
        profileImageUrl: updatedProfile.profileImageUrl ?? "",
      });
      setMessage("회원 정보가 수정되었습니다.");
    } catch (error) {
      setErrorMessage(toMessage(error));
    }
  }

  async function changePassword() {
    setMessage(null);
    setErrorMessage(null);
    try {
      await apiRequest<{ changed: boolean }>("/members/me/password", {
        method: "POST",
        body: passwordForm,
      });
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setMessage("비밀번호 변경 요청이 처리되었습니다.");
    } catch (error) {
      setErrorMessage(toMessage(error));
    }
  }

  async function updateSettings(nextSettings: NotificationSettings) {
    setMessage(null);
    setErrorMessage(null);
    try {
      const savedSettings = await apiRequest<NotificationSettings>("/members/me/notification-settings", {
        method: "PUT",
        body: nextSettings,
      });
      setSettings(savedSettings);
      setMessage("알림 설정이 저장되었습니다.");
    } catch (error) {
      setErrorMessage(toMessage(error));
    }
  }

  function toggleAllNotifications(checked: boolean) {
    if (!settings) return;

    void updateSettings(
      checked
        ? {
            allEnabled: true,
            chatEnabled: true,
            letterEnabled: true,
            memoryEnabled: true,
            missionEnabled: true,
          }
        : {
            ...settings,
            allEnabled: false,
          },
    );
  }

  function toggleIndividualNotification(key: keyof Omit<NotificationSettings, "allEnabled">, checked: boolean) {
    if (!settings) return;

    void updateSettings({
      ...settings,
      allEnabled: false,
      [key]: checked,
    });
  }

  return (
    <main className="app-shell">
      <section className="hero-bar">
        <div>
          <span className="eyebrow">Lv1 Profile & Settings</span>
          <h1>내 프로필과 알림 설정</h1>
          <p>계정 식별 정보는 확인만 하고, 수정 가능한 정보와 알림 정책만 조정합니다.</p>
        </div>
        <button className="ghost-button" type="button" onClick={() => void loadInitialData()}>
          새로고침
        </button>
      </section>

      {message ? <div className="notice success">{message}</div> : null}
      {errorMessage ? <div className="notice error">{errorMessage}</div> : null}

      <section className="content-grid">
        <article className="profile-card">
          <div className="section-title">
            <UserRound size={22} />
            <h2>프로필</h2>
          </div>
          <div className="profile-main">
            <div className="avatar">{profile?.profileImageUrl ? <img src={profile.profileImageUrl} alt="" /> : initials}</div>
            <div className="profile-copy">
              <strong>{profile?.displayName ?? "불러오는 중"}</strong>
              <span>아이디 {profile?.username ?? "-"}</span>
            </div>
          </div>
          <dl className="profile-meta">
            <div>
              <Mail size={18} />
              <dt>이메일</dt>
              <dd>{profile?.email ?? "-"}</dd>
            </div>
            <div>
              <Phone size={18} />
              <dt>전화번호</dt>
              <dd>{profile?.phoneNumber ?? "-"}</dd>
            </div>
          </dl>
          <div className="profile-actions">
            <button className="primary-button" type="button" onClick={saveProfile}>
              회원 정보 수정
            </button>
            <button className="outline-button danger-text" type="button" onClick={() => setLogoutOpen(true)}>
              <LogOut size={17} />
              로그아웃
            </button>
          </div>
        </article>

        <article className="settings-card">
          <div className="section-title">
            <UserRound size={22} />
            <h2>회원 정보 수정</h2>
          </div>
          <label className="field">
            이름
            <input
              value={profileForm.displayName}
              onChange={(event) => setProfileForm({ ...profileForm, displayName: event.target.value })}
              placeholder="이름"
            />
          </label>
          <label className="field">
            프로필 이미지 URL
            <input
              value={profileForm.profileImageUrl}
              onChange={(event) => setProfileForm({ ...profileForm, profileImageUrl: event.target.value })}
              placeholder="https://example.com/profile.png"
            />
          </label>
          <div className="readonly-grid">
            <span>아이디, 이메일, 전화번호는 초대와 식별에 사용하므로 수정하지 않습니다.</span>
          </div>
          <button className="primary-button compact" type="button" onClick={saveProfile}>
            저장
          </button>
        </article>

        <article className="settings-card">
          <div className="section-title">
            <KeyRound size={22} />
            <h2>비밀번호 변경</h2>
          </div>
          <label className="field">
            현재 비밀번호
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
              placeholder="현재 비밀번호"
            />
          </label>
          <label className="field">
            새 비밀번호
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
              placeholder="8자 이상"
            />
          </label>
          <button className="primary-button compact" type="button" onClick={changePassword}>
            변경
          </button>
        </article>

        <article className="settings-card notification-panel">
          <div className="section-title">
            <Bell size={22} />
            <h2>알림 설정</h2>
          </div>
          <div className="toggle-row all-toggle">
            <div>
              <strong>전체 알림</strong>
              <span>ON이면 모든 개별 알림이 함께 켜집니다.</span>
            </div>
            <Toggle checked={settings?.allEnabled ?? true} onChange={toggleAllNotifications} />
          </div>
          <div className="toggle-grid">
            <ToggleField
              label="채팅"
              checked={settings?.chatEnabled ?? true}
              disabled={settings?.allEnabled ?? true}
              onChange={(checked) => toggleIndividualNotification("chatEnabled", checked)}
            />
            <ToggleField
              label="편지"
              checked={settings?.letterEnabled ?? true}
              disabled={settings?.allEnabled ?? true}
              onChange={(checked) => toggleIndividualNotification("letterEnabled", checked)}
            />
            <ToggleField
              label="추억"
              checked={settings?.memoryEnabled ?? true}
              disabled={settings?.allEnabled ?? true}
              onChange={(checked) => toggleIndividualNotification("memoryEnabled", checked)}
            />
            <ToggleField
              label="미션"
              checked={settings?.missionEnabled ?? true}
              disabled={settings?.allEnabled ?? true}
              onChange={(checked) => toggleIndividualNotification("missionEnabled", checked)}
            />
          </div>
        </article>

        <article className="policy-card">
          <div>
            <h2>이용약관 / 개인정보 처리방침</h2>
            <p>Lv1에서는 실제 문서 연결 전 안내 상태로 표시합니다.</p>
          </div>
          <button className="outline-button" type="button">
            보기
          </button>
        </article>

        <article className="danger-card">
          <div className="section-title danger-text">
            <ShieldAlert size={22} />
            <h2>위험 영역</h2>
          </div>
          <p>회원 탈퇴는 계정 영향이 크므로 별도 이슈에서 비밀번호 재확인과 최종 확인 흐름으로 구현합니다.</p>
          <div className="danger-actions">
            <button className="outline-button danger-text" type="button" onClick={() => setLogoutOpen(true)}>
              로그아웃
            </button>
            <button className="outline-button disabled" type="button" aria-disabled="true">
              회원 탈퇴
            </button>
          </div>
        </article>
      </section>

      {logoutOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="logout-title">
            <h2 id="logout-title">로그아웃할까요?</h2>
            <p>현재 계정에서 로그아웃됩니다. Lv1에서는 세션 종료 대신 확인 흐름만 제공합니다.</p>
            <div className="modal-actions">
              <button className="outline-button" type="button" onClick={() => setLogoutOpen(false)}>
                취소
              </button>
              <button className="primary-button" type="button" onClick={() => setLogoutOpen(false)}>
                로그아웃
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

function ToggleField({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={`toggle-field ${disabled ? "is-disabled" : ""}`}>
      <span>{label}</span>
      <Toggle checked={checked} disabled={disabled} onChange={onChange} />
    </label>
  );
}

function Toggle({
  checked,
  disabled = false,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      className={`toggle ${checked ? "checked" : ""}`}
      type="button"
      aria-pressed={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}

async function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: "GET" });
}

async function apiRequest<T>(path: string, options: { method: string; body?: unknown }): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method,
    headers: {
      ...memberHeader,
      "Content-Type": "application/json",
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const payload = (await response.json()) as T | ApiError;
  if (!response.ok) {
    throw new Error((payload as ApiError).message ?? `HTTP ${response.status}`);
  }

  return payload as T;
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : "요청을 처리할 수 없습니다.";
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
