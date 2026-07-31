import { StrictMode, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  FileText,
  Home,
  KeyRound,
  List,
  LogOut,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  Settings,
  ShieldAlert,
  UserRound,
  UsersRound,
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

type RoomSummary = {
  id: number;
  name: string;
  description: string | null;
  type: "COUPLE" | "FAMILY" | "GROUP";
  role: "OWNER" | "MEMBER";
  memberCount: number;
  unreadChatCount: number;
  pendingMissionCount: number;
};

type RoomsResponse = {
  rooms: RoomSummary[];
  pendingInvitationCount: number;
};

type ApiError = {
  code: string;
  message: string;
  requestId: string;
};

type AppView = "home" | "rooms" | "chat" | "memories" | "missions" | "letters" | "settings";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";
const memberHeader = { "X-Member-Id": "1" };

function App() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [pendingInvitationCount, setPendingInvitationCount] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<AppView>("home");
  const [profileForm, setProfileForm] = useState({ displayName: "", profileImageUrl: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId) ?? rooms[0] ?? null,
    [rooms, selectedRoomId],
  );
  const initials = useMemo(() => profile?.displayName.slice(0, 1) ?? "나", [profile]);

  useEffect(() => {
    void loadInitialData();
  }, []);

  async function loadInitialData() {
    setErrorMessage(null);
    try {
      const [profileResponse, settingsResponse, roomsResponse] = await Promise.all([
        apiGet<MemberProfile>("/members/me"),
        apiGet<NotificationSettings>("/members/me/notification-settings"),
        apiGet<RoomsResponse>("/rooms"),
      ]);
      setProfile(profileResponse);
      setSettings(settingsResponse);
      setRooms(roomsResponse.rooms);
      setPendingInvitationCount(roomsResponse.pendingInvitationCount);
      setProfileForm({
        displayName: profileResponse.displayName,
        profileImageUrl: profileResponse.profileImageUrl ?? "",
      });
      setSelectedRoomId((currentSelectedRoomId) => currentSelectedRoomId ?? roomsResponse.rooms[0]?.id ?? null);
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
      setProfileEditOpen(false);
      setMessage("프로필이 수정되었습니다.");
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

  function moveToView(view: AppView) {
    setMessage(null);
    setErrorMessage(null);
    setActiveView(view);
  }

  function selectRoom(roomId: number, nextView: AppView = activeView === "rooms" || activeView === "settings" ? "home" : activeView) {
    setSelectedRoomId(roomId);
    setActiveView(nextView);
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
    <main className="workspace">
      <Sidebar
        activeView={activeView}
        rooms={rooms}
        selectedRoomId={selectedRoom?.id ?? null}
        pendingInvitationCount={pendingInvitationCount}
        onMove={moveToView}
        onSelectRoom={selectRoom}
      />

      <section className="app-page">
        {message ? <div className="notice success">{message}</div> : null}
        {errorMessage ? <div className="notice error">{errorMessage}</div> : null}

        {activeView === "home" ? <HomeView profile={profile} selectedRoom={selectedRoom} rooms={rooms} initials={initials} /> : null}
        {activeView === "rooms" ? (
          <RoomsView
            rooms={rooms}
            selectedRoomId={selectedRoom?.id ?? null}
            pendingInvitationCount={pendingInvitationCount}
            onSelectRoom={selectRoom}
          />
        ) : null}
        {activeView === "chat" ? <RoomFeatureView selectedRoom={selectedRoom} kind="chat" /> : null}
        {activeView === "memories" ? <RoomFeatureView selectedRoom={selectedRoom} kind="memories" /> : null}
        {activeView === "missions" ? <RoomFeatureView selectedRoom={selectedRoom} kind="missions" /> : null}
        {activeView === "letters" ? <RoomFeatureView selectedRoom={selectedRoom} kind="letters" /> : null}
        {activeView === "settings" ? (
          <SettingsView
            profile={profile}
            settings={settings}
            profileForm={profileForm}
            passwordForm={passwordForm}
            initials={initials}
            onOpenProfileEdit={() => setProfileEditOpen(true)}
            onPasswordFormChange={setPasswordForm}
            onChangePassword={changePassword}
            onToggleAllNotifications={toggleAllNotifications}
            onToggleIndividualNotification={toggleIndividualNotification}
            onLogout={() => setLogoutOpen(true)}
          />
        ) : null}
      </section>

      {profileEditOpen ? (
        <ProfileEditModal
          profileForm={profileForm}
          onProfileFormChange={setProfileForm}
          onSave={saveProfile}
          onClose={() => setProfileEditOpen(false)}
        />
      ) : null}

      {logoutOpen ? <LogoutModal onClose={() => setLogoutOpen(false)} /> : null}
    </main>
  );
}

function Sidebar({
  activeView,
  rooms,
  selectedRoomId,
  pendingInvitationCount,
  onMove,
  onSelectRoom,
}: {
  activeView: AppView;
  rooms: RoomSummary[];
  selectedRoomId: number | null;
  pendingInvitationCount: number;
  onMove: (view: AppView) => void;
  onSelectRoom: (roomId: number, nextView?: AppView) => void;
}) {
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? rooms[0] ?? null;

  return (
    <aside className="sidebar" aria-label="기록방 메뉴">
      <div>
        <div className="sidebar-brand">
          <strong>기록방</strong>
          <span>방 기준 메뉴</span>
        </div>

        <nav className="nav-list">
          <button className={`nav-item ${activeView === "home" ? "active" : ""}`} type="button" onClick={() => onMove("home")}>
            <Home size={18} />
            홈
          </button>
          <button className={`nav-item ${activeView === "rooms" ? "active" : ""}`} type="button" onClick={() => onMove("rooms")}>
            <List size={18} />
            방 리스트
            {pendingInvitationCount > 0 ? <span className="count-badge">{pendingInvitationCount}</span> : null}
          </button>

          {rooms.map((room) => (
            <div className={`room-entry ${room.id === selectedRoom?.id ? "selected-room" : ""}`} key={room.id}>
              <button
                className={`nav-item room-list-item ${room.id === selectedRoom?.id ? "room-selected" : "muted"}`}
                type="button"
                onClick={() => onSelectRoom(room.id, "home")}
              >
                <UsersRound size={18} />
                <span>{room.name}</span>
                {room.id === selectedRoom?.id ? <ChevronDown size={16} /> : null}
              </button>

              {room.id === selectedRoom?.id ? (
                <div className="room-submenu">
                  <button className={activeView === "chat" ? "active" : ""} type="button" onClick={() => onMove("chat")}>
                    <MessageCircle size={16} />
                    채팅
                    {room.unreadChatCount > 0 ? <span className="count-badge">{room.unreadChatCount}</span> : null}
                  </button>
                  <button className={activeView === "memories" ? "active" : ""} type="button" onClick={() => onMove("memories")}>
                    <BookOpen size={16} />
                    추억 게시판
                  </button>
                  <button className={activeView === "missions" ? "active" : ""} type="button" onClick={() => onMove("missions")}>
                    <CheckCircle2 size={16} />
                    미션 인증
                    {room.pendingMissionCount > 0 ? <span className="count-badge">{room.pendingMissionCount}</span> : null}
                  </button>
                  <button className={activeView === "letters" ? "active" : ""} type="button" onClick={() => onMove("letters")}>
                    <Mail size={16} />
                    편지
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </nav>
      </div>

      <button className={`nav-item settings-active ${activeView === "settings" ? "active" : ""}`} type="button" onClick={() => onMove("settings")}>
        <Settings size={18} />
        설정
      </button>
    </aside>
  );
}

function HomeView({
  profile,
  selectedRoom,
  rooms,
  initials,
}: {
  profile: MemberProfile | null;
  selectedRoom: RoomSummary | null;
  rooms: RoomSummary[];
  initials: string;
}) {
  return (
    <>
      <header className="page-header">
        <div>
          <h1>홈</h1>
          <p>최상단 기록방이 자동 선택되며, 선택 방 기준으로 사이드바 기능을 사용할 수 있다.</p>
        </div>
      </header>

      <section className="home-grid">
        <article className="profile-panel compact-panel">
          <div className="panel-heading">
            <div>
              <span>프로필</span>
              <h2>{profile?.displayName ?? "불러오는 중"}</h2>
            </div>
            <UserRound size={24} />
          </div>
          <div className="profile-summary">
            <div className="avatar">{profile?.profileImageUrl ? <img src={profile.profileImageUrl} alt="" /> : initials}</div>
            <div>
              <strong>{profile?.displayName ?? "-"}</strong>
              <span>아이디 {profile?.username ?? "-"}</span>
            </div>
          </div>
        </article>

        <article className="dashboard-card">
          <div className="panel-heading">
            <div>
              <span>선택된 방</span>
              <h2>{selectedRoom?.name ?? "참여 방 없음"}</h2>
            </div>
            <UsersRound size={24} />
          </div>
          <div className="metric-grid">
            <Metric label="참여 방" value={`${rooms.length}개`} />
            <Metric label="멤버" value={selectedRoom ? `${selectedRoom.memberCount}명` : "-"} />
            <Metric label="미확인 채팅" value={selectedRoom ? `${selectedRoom.unreadChatCount}개` : "-"} />
            <Metric label="승인 대기 미션" value={selectedRoom ? `${selectedRoom.pendingMissionCount}개` : "-"} />
          </div>
        </article>

        <article className="dashboard-card wide-card">
          <div className="panel-heading">
            <div>
              <span>캘린더 자리</span>
              <h2>날짜별 기록 흐름</h2>
            </div>
            <BookOpen size={24} />
          </div>
          <div className="calendar-placeholder">
            <span>채팅, 추억, 미션, 편지 기록이 날짜별로 모이는 영역이다.</span>
          </div>
        </article>
      </section>
    </>
  );
}

function RoomsView({
  rooms,
  selectedRoomId,
  pendingInvitationCount,
  onSelectRoom,
}: {
  rooms: RoomSummary[];
  selectedRoomId: number | null;
  pendingInvitationCount: number;
  onSelectRoom: (roomId: number, nextView?: AppView) => void;
}) {
  return (
    <>
      <header className="page-header">
        <div>
          <h1>방 리스트</h1>
          <p>방 생성, 초대 받은 방 조회, 참여 방 조회, 방 관리 진입을 한 곳에서 확인한다.</p>
        </div>
        <button className="primary-button" type="button">
          <Plus size={18} />
          방 생성
        </button>
      </header>

      <section className="room-hub-grid">
        <article className="hub-card">
          <span>초대 받은 방</span>
          <strong>{pendingInvitationCount}개</strong>
          <p>초대 수락/거절은 이후 상세 이슈에서 구현한다.</p>
        </article>
        <article className="hub-card">
          <span>참여 방</span>
          <strong>{rooms.length}개</strong>
          <p>현재 멤버가 참여 중인 기록방 목록이다.</p>
        </article>
        <article className="hub-card">
          <span>방 관리</span>
          <strong>진입 골격</strong>
          <p>방 이름, 설명, 초대 관리는 이후 상세 화면으로 확장한다.</p>
        </article>
      </section>

      <section className="joined-room-list">
        {rooms.map((room) => (
          <article className={`room-card ${room.id === selectedRoomId ? "selected" : ""}`} key={room.id}>
            <div>
              <span>{roomTypeLabel(room.type)}</span>
              <h2>{room.name}</h2>
              <p>{room.description ?? "설명 없음"}</p>
            </div>
            <dl className="room-meta">
              <div>
                <dt>역할</dt>
                <dd>{room.role === "OWNER" ? "방장" : "멤버"}</dd>
              </div>
              <div>
                <dt>멤버</dt>
                <dd>{room.memberCount}명</dd>
              </div>
            </dl>
            <div className="room-card-actions">
              <button className="outline-button" type="button" onClick={() => onSelectRoom(room.id, "home")}>
                선택
              </button>
              <button className="outline-button" type="button">
                관리
              </button>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

function RoomFeatureView({ selectedRoom, kind }: { selectedRoom: RoomSummary | null; kind: Exclude<AppView, "home" | "rooms" | "settings"> }) {
  const copy = roomFeatureCopy(kind);

  return (
    <>
      <header className="page-header">
        <div>
          <h1>{copy.title}</h1>
          <p>{selectedRoom ? `${selectedRoom.name} 기준 ${copy.description}` : "선택된 방이 없습니다."}</p>
        </div>
      </header>

      <section className="placeholder-page">
        <article className="dashboard-card wide-card">
          <div className="panel-heading">
            <div>
              <span>선택 방 컨텍스트</span>
              <h2>{selectedRoom?.name ?? "참여 방 없음"}</h2>
            </div>
            {copy.icon}
          </div>
          <p>{copy.body}</p>
          <div className="skeleton-list">
            <span />
            <span />
            <span />
          </div>
        </article>
      </section>
    </>
  );
}

function SettingsView({
  profile,
  settings,
  profileForm,
  passwordForm,
  initials,
  onOpenProfileEdit,
  onPasswordFormChange,
  onChangePassword,
  onToggleAllNotifications,
  onToggleIndividualNotification,
  onLogout,
}: {
  profile: MemberProfile | null;
  settings: NotificationSettings | null;
  profileForm: { displayName: string; profileImageUrl: string };
  passwordForm: { currentPassword: string; newPassword: string };
  initials: string;
  onOpenProfileEdit: () => void;
  onPasswordFormChange: (form: { currentPassword: string; newPassword: string }) => void;
  onChangePassword: () => void;
  onToggleAllNotifications: (checked: boolean) => void;
  onToggleIndividualNotification: (key: keyof Omit<NotificationSettings, "allEnabled">, checked: boolean) => void;
  onLogout: () => void;
}) {
  return (
    <>
      <header className="page-header">
        <div>
          <h1>설정</h1>
          <p>내 계정 정보를 먼저 확인한 뒤 필요한 설정을 조정한다.</p>
        </div>
      </header>

      <section className="settings-layout">
        <article className="profile-panel">
          <div className="panel-heading">
            <div>
              <span>프로필</span>
              <h2>내 계정 정보</h2>
            </div>
            <UserRound size={24} />
          </div>

          <div className="profile-summary">
            <div className="avatar">{profile?.profileImageUrl ? <img src={profile.profileImageUrl} alt="" /> : initials}</div>
            <div>
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

          <button className="primary-button full-width" type="button" onClick={onOpenProfileEdit}>
            프로필 수정
          </button>
        </article>

        <section className="settings-stack">
          <article className="settings-row password-row">
            <div className="row-title">
              <KeyRound size={22} />
              <div>
                <h2>비밀번호 변경</h2>
                <p>새 비밀번호는 8자 이상으로 입력한다.</p>
              </div>
            </div>
            <div className="password-fields">
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) => onPasswordFormChange({ ...passwordForm, currentPassword: event.target.value })}
                placeholder="현재 비밀번호"
              />
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) => onPasswordFormChange({ ...passwordForm, newPassword: event.target.value })}
                placeholder="새 비밀번호"
              />
            </div>
            <button className="primary-button row-button" type="button" onClick={onChangePassword}>
              변경
            </button>
          </article>

          <article className="settings-card notification-card">
            <div className="panel-heading">
              <div>
                <span>알림 설정</span>
                <h2>받을 알림을 선택</h2>
              </div>
              <Bell size={24} />
            </div>

            <div className="toggle-row all-toggle">
              <div>
                <strong>전체 알림</strong>
                <span>ON이면 모든 개별 알림이 함께 켜진다.</span>
              </div>
              <Toggle checked={settings?.allEnabled ?? true} onChange={onToggleAllNotifications} />
            </div>

            <div className="notification-grid" aria-label="개별 알림 설정">
              <ToggleField
                label="채팅"
                checked={settings?.chatEnabled ?? true}
                disabled={settings?.allEnabled ?? true}
                onChange={(checked) => onToggleIndividualNotification("chatEnabled", checked)}
              />
              <ToggleField
                label="편지"
                checked={settings?.letterEnabled ?? true}
                disabled={settings?.allEnabled ?? true}
                onChange={(checked) => onToggleIndividualNotification("letterEnabled", checked)}
              />
              <ToggleField
                label="추억"
                checked={settings?.memoryEnabled ?? true}
                disabled={settings?.allEnabled ?? true}
                onChange={(checked) => onToggleIndividualNotification("memoryEnabled", checked)}
              />
              <ToggleField
                label="미션"
                checked={settings?.missionEnabled ?? true}
                disabled={settings?.allEnabled ?? true}
                onChange={(checked) => onToggleIndividualNotification("missionEnabled", checked)}
              />
            </div>
          </article>

          <article className="settings-row">
            <div className="row-title">
              <FileText size={22} />
              <div>
                <h2>이용약관 / 개인정보 처리방침</h2>
                <p>Lv1에서는 문서 연결 전 안내 상태로 표시한다.</p>
              </div>
            </div>
            <button className="outline-button row-button" type="button">
              보기
            </button>
          </article>

          <article className="settings-card danger-card">
            <div className="panel-heading danger-heading">
              <div>
                <span>위험 영역</span>
                <h2>계정 영향이 큰 작업</h2>
              </div>
              <ShieldAlert size={24} />
            </div>
            <p>회원 탈퇴는 실제 API 없이 자리만 표시하며, 별도 이슈에서 비밀번호 재확인과 최종 확인 흐름을 구현한다.</p>
            <div className="danger-actions">
              <button className="outline-button danger-text" type="button" onClick={onLogout}>
                <LogOut size={17} />
                로그아웃
              </button>
              <button className="danger-button" type="button" aria-disabled="true">
                회원 탈퇴
              </button>
            </div>
          </article>
        </section>
      </section>
    </>
  );
}

function ProfileEditModal({
  profileForm,
  onProfileFormChange,
  onSave,
  onClose,
}: {
  profileForm: { displayName: string; profileImageUrl: string };
  onProfileFormChange: (form: { displayName: string; profileImageUrl: string }) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="profile-edit-title">
        <h2 id="profile-edit-title">프로필 수정</h2>
        <p>이름과 프로필 이미지만 수정할 수 있다. 아이디, 이메일, 전화번호는 초대와 식별에 사용하므로 수정하지 않는다.</p>
        <label className="field">
          이름
          <input
            value={profileForm.displayName}
            onChange={(event) => onProfileFormChange({ ...profileForm, displayName: event.target.value })}
            placeholder="이름"
          />
        </label>
        <label className="field">
          프로필 이미지 URL
          <input
            value={profileForm.profileImageUrl}
            onChange={(event) => onProfileFormChange({ ...profileForm, profileImageUrl: event.target.value })}
            placeholder="https://example.com/profile.png"
          />
        </label>
        <div className="modal-actions">
          <button className="outline-button" type="button" onClick={onClose}>
            취소
          </button>
          <button className="primary-button" type="button" onClick={onSave}>
            저장
          </button>
        </div>
      </section>
    </div>
  );
}

function LogoutModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="logout-title">
        <h2 id="logout-title">로그아웃할까요?</h2>
        <p>현재 계정에서 로그아웃된다. Lv1에서는 세션 종료 대신 확인 흐름만 제공한다.</p>
        <div className="modal-actions">
          <button className="outline-button" type="button" onClick={onClose}>
            취소
          </button>
          <button className="primary-button" type="button" onClick={onClose}>
            로그아웃
          </button>
        </div>
      </section>
    </div>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function roomTypeLabel(type: RoomSummary["type"]): string {
  if (type === "COUPLE") return "커플";
  if (type === "FAMILY") return "가족";
  return "학급/동아리";
}

function roomFeatureCopy(kind: Exclude<AppView, "home" | "rooms" | "settings">) {
  if (kind === "chat") {
    return {
      title: "채팅",
      description: "채팅 화면 골격이다.",
      body: "날짜 구분선, 검색, 메시지 입력은 이후 채팅 기능 이슈에서 구현한다.",
      icon: <MessageCircle size={24} />,
    };
  }
  if (kind === "memories") {
    return {
      title: "추억 게시판",
      description: "추억 게시판 화면 골격이다.",
      body: "사진과 글 카드 피드, 댓글, 작성 화면은 이후 추억 게시판 기능 이슈에서 구현한다.",
      icon: <BookOpen size={24} />,
    };
  }
  if (kind === "missions") {
    return {
      title: "미션 인증",
      description: "미션 인증 화면 골격이다.",
      body: "진행중, 승인 대기, 완료 탭과 동의율은 이후 미션 인증 기능 이슈에서 구현한다.",
      icon: <CheckCircle2 size={24} />,
    };
  }
  return {
    title: "편지",
    description: "편지 화면 골격이다.",
    body: "받은 편지함, 보낸 편지함, 편지 쓰기는 이후 편지 기능 이슈에서 구현한다.",
    icon: <Mail size={24} />,
  };
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
