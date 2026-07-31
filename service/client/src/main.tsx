import { StrictMode, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  Home,
  KeyRound,
  List,
  LogOut,
  Mail,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  Plus,
  Settings,
  ShieldAlert,
  UserRound,
  UsersRound,
  X,
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

type NotificationType = "CHAT" | "LETTER" | "MEMORY" | "MISSION_APPROVAL_REQUEST" | "MISSION_PROGRESS";

type NotificationTarget = {
  type: "CHAT" | "LETTER" | "MEMORY" | "MISSION" | null;
  id: number | null;
  url: string;
};

type NotificationItem = {
  id: number;
  type: NotificationType;
  roomId: number | null;
  roomName: string | null;
  actorName: string;
  summary: string;
  occurredAt: string;
  read: boolean;
  target: NotificationTarget;
};

type NotificationsResponse = {
  items: NotificationItem[];
};

type ApiError = {
  code: string;
  message: string;
  requestId: string;
};

type AppView = "home" | "rooms" | "chat" | "memories" | "missions" | "letters" | "settings";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";
const memberHeader = { "X-Member-Id": "1" };

const demoProfile: MemberProfile = {
  id: 1,
  displayName: "류성열",
  username: "recordryu",
  email: "ryu@example.com",
  phoneNumber: "010-1234-5678",
  profileImageUrl: null,
};

const demoSettings: NotificationSettings = {
  allEnabled: true,
  chatEnabled: true,
  letterEnabled: true,
  memoryEnabled: true,
  missionEnabled: true,
};

const demoRooms: RoomSummary[] = [
  {
    id: 1,
    name: "우리 둘의 100일",
    description: "둘이 함께 남기는 100일 기록방",
    type: "COUPLE",
    role: "OWNER",
    memberCount: 2,
    unreadChatCount: 1,
    pendingMissionCount: 2,
  },
  {
    id: 2,
    name: "7월 가족",
    description: "가족 여행과 일상 기록을 모으는 방",
    type: "FAMILY",
    role: "MEMBER",
    memberCount: 5,
    unreadChatCount: 0,
    pendingMissionCount: 1,
  },
  {
    id: 3,
    name: "여름 프로젝트반",
    description: "프로젝트반 활동과 미션 인증 기록방",
    type: "GROUP",
    role: "MEMBER",
    memberCount: 12,
    unreadChatCount: 3,
    pendingMissionCount: 0,
  },
];

const demoNotifications: NotificationItem[] = [
  {
    id: 9001,
    type: "MISSION_APPROVAL_REQUEST",
    roomId: 1,
    roomName: "우리 둘의 100일",
    actorName: "민지",
    summary: "미션 인증 동의를 기다립니다.",
    occurredAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    read: false,
    target: { type: "MISSION", id: 101, url: "/rooms/1/missions?targetId=101" },
  },
  {
    id: 9002,
    type: "CHAT",
    roomId: 1,
    roomName: "우리 둘의 100일",
    actorName: "민지",
    summary: "새 채팅을 보냈습니다.",
    occurredAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    read: false,
    target: { type: "CHAT", id: 201, url: "/rooms/1/chat?targetId=201" },
  },
  {
    id: 9003,
    type: "MEMORY",
    roomId: 2,
    roomName: "7월 가족",
    actorName: "아버지",
    summary: "가족 여행 사진을 올렸습니다.",
    occurredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true,
    target: { type: "MEMORY", id: 301, url: "/rooms/2/memories?targetId=301" },
  },
  {
    id: 9004,
    type: "LETTER",
    roomId: 3,
    roomName: "여름 프로젝트반",
    actorName: "지훈",
    summary: "보낸 편지가 도착했습니다.",
    occurredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: false,
    target: { type: "LETTER", id: 401, url: "/rooms/3/letters?targetId=401" },
  },
  {
    id: 9005,
    type: "MISSION_PROGRESS",
    roomId: 2,
    roomName: "7월 가족",
    actorName: "아버지",
    summary: "가족 미션 동의율이 60%입니다.",
    occurredAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    read: false,
    target: { type: "MISSION", id: 402, url: "/rooms/2/missions?targetId=402" },
  },
  ...Array.from({ length: 15 }, (_, index) => {
    const id = 9006 + index;
    const typeCycle: NotificationType[] = ["CHAT", "LETTER", "MEMORY", "MISSION_APPROVAL_REQUEST", "MISSION_PROGRESS"];
    const type = typeCycle[index % typeCycle.length];
    const room = demoRooms[index % demoRooms.length];
    const actorNames = ["민지", "아버지", "지훈"];
    const targetType: NotificationTarget["type"] = type === "CHAT" ? "CHAT" : type === "LETTER" ? "LETTER" : type === "MEMORY" ? "MEMORY" : "MISSION";
    const feature = targetType === "CHAT" ? "chat" : targetType === "LETTER" ? "letters" : targetType === "MEMORY" ? "memories" : "missions";

    return {
      id,
      type,
      roomId: room.id,
      roomName: room.name,
      actorName: actorNames[index % actorNames.length],
      summary: `${notificationTypeLabel(type)} 알림 예시 ${index + 1}`,
      occurredAt: new Date(Date.now() - (30 + index * 18) * 60 * 1000).toISOString(),
      read: index % 6 === 0,
      target: { type: targetType, id: 500 + index, url: `/rooms/${room.id}/${feature}?targetId=${500 + index}` },
    };
  }),
];

function App() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [latestNotifications, setLatestNotifications] = useState<NotificationItem[]>([]);
  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>([]);
  const [pendingInvitationCount, setPendingInvitationCount] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [expandedRoomId, setExpandedRoomId] = useState<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<AppView>("home");
  const [profileForm, setProfileForm] = useState({ displayName: "", profileImageUrl: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);

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
      const visibleRooms = roomsResponse.rooms.length > 0 ? roomsResponse.rooms : demoRooms;
      setProfile(profileResponse);
      setSettings(settingsResponse);
      setRooms(visibleRooms);
      await loadLatestNotifications();
      setPendingInvitationCount(roomsResponse.pendingInvitationCount);
      setProfileForm({
        displayName: profileResponse.displayName,
        profileImageUrl: profileResponse.profileImageUrl ?? "",
      });
      setSelectedRoomId((currentSelectedRoomId) => currentSelectedRoomId ?? visibleRooms[0]?.id ?? null);
    } catch (error) {
      setProfile(demoProfile);
      setSettings(demoSettings);
      setRooms(demoRooms);
      setLatestNotifications(demoNotifications.filter((notification) => !notification.read).slice(0, 3));
      setAllNotifications(demoNotifications);
      setPendingInvitationCount(1);
      setProfileForm({
        displayName: demoProfile.displayName,
        profileImageUrl: demoProfile.profileImageUrl ?? "",
      });
      setSelectedRoomId((currentSelectedRoomId) => currentSelectedRoomId ?? demoRooms[0].id);
    }
  }

  async function loadLatestNotifications() {
    const latestResponse = await safeApiGet<NotificationsResponse>("/notifications/latest");
    setLatestNotifications(latestResponse?.items.length ? latestResponse.items : demoNotifications.filter((notification) => !notification.read).slice(0, 3));
  }

  async function openNotificationsModal() {
    setNotificationsModalOpen(true);
    const response = await safeApiGet<NotificationsResponse>("/notifications?page=0&size=20");
    setAllNotifications(response?.items.length ? response.items : demoNotifications);
  }

  async function handleNotificationClick(notification: NotificationItem) {
    setMessage(null);
    setErrorMessage(null);

    markNotificationAsRead(notification.id);

    if (notification.id < 9000) {
      void safeApiRequest<{ read: boolean }>(`/notifications/${notification.id}/read`, { method: "POST" });
    }

    if (notification.roomId) {
      setSelectedRoomId(notification.roomId);
      setExpandedRoomId(notification.roomId);
    }

    setActiveView(notificationTargetView(notification));
    setNotificationsModalOpen(false);
  }

  function markNotificationAsRead(notificationId: number) {
    const markAsRead = (item: NotificationItem) => (item.id === notificationId ? { ...item, read: true } : item);

    setLatestNotifications((current) => current.map(markAsRead).filter((item) => !item.read));
    setAllNotifications((current) => current.map(markAsRead));
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
    setExpandedRoomId((currentExpandedRoomId) => (currentExpandedRoomId === roomId ? null : roomId));
    setActiveView(nextView);
  }

  function moveToRoomFeature(roomId: number, view: Exclude<AppView, "home" | "rooms" | "settings">) {
    setSelectedRoomId(roomId);
    setExpandedRoomId(roomId);
    setActiveView(view);
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
    <main className={`workspace ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        activeView={activeView}
        rooms={rooms}
        selectedRoomId={selectedRoom?.id ?? null}
        expandedRoomId={expandedRoomId}
        collapsed={sidebarCollapsed}
        pendingInvitationCount={pendingInvitationCount}
        onMove={moveToView}
        onSelectRoom={selectRoom}
        onMoveRoomFeature={moveToRoomFeature}
        onToggleSidebar={() => setSidebarCollapsed((current) => !current)}
      />

      <section className="app-page">
        {message ? <div className="notice success">{message}</div> : null}
        {errorMessage ? <div className="notice error">{errorMessage}</div> : null}

        {activeView === "home" ? (
          <HomeView
            profile={profile}
            initials={initials}
            latestNotifications={latestNotifications}
            onOpenNotifications={openNotificationsModal}
            onNotificationClick={handleNotificationClick}
            onOpenProfileEdit={() => setProfileEditOpen(true)}
            onLogout={() => setLogoutOpen(true)}
          />
        ) : null}
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

      {notificationsModalOpen ? (
        <NotificationsModal
          notifications={allNotifications.length > 0 ? allNotifications : latestNotifications}
          onNotificationClick={handleNotificationClick}
          onClose={() => setNotificationsModalOpen(false)}
        />
      ) : null}
    </main>
  );
}

function Sidebar({
  activeView,
  rooms,
  selectedRoomId,
  expandedRoomId,
  collapsed,
  pendingInvitationCount,
  onMove,
  onSelectRoom,
  onMoveRoomFeature,
  onToggleSidebar,
}: {
  activeView: AppView;
  rooms: RoomSummary[];
  selectedRoomId: number | null;
  expandedRoomId: number | null;
  collapsed: boolean;
  pendingInvitationCount: number;
  onMove: (view: AppView) => void;
  onSelectRoom: (roomId: number, nextView?: AppView) => void;
  onMoveRoomFeature: (roomId: number, view: Exclude<AppView, "home" | "rooms" | "settings">) => void;
  onToggleSidebar: () => void;
}) {
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? rooms[0] ?? null;

  return (
    <aside className={`sidebar ${collapsed ? "is-collapsed" : ""}`} aria-label="기록방 메뉴">
      <div>
        <div className="sidebar-brand">
          <div className="sidebar-brand-text">
            <strong>기록방</strong>
            <span>방 기준 메뉴</span>
          </div>
          <span className="sidebar-brand-mark" aria-hidden="true">
            기
          </span>
          <button className="sidebar-toggle" type="button" aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"} onClick={onToggleSidebar}>
            {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>

        <nav className="nav-list">
          <button className={`nav-item ${activeView === "home" ? "active" : ""}`} type="button" aria-label="홈" onClick={() => onMove("home")}>
            <Home size={18} />
            <span className="nav-label">홈</span>
          </button>
          <button className={`nav-item ${activeView === "rooms" ? "active" : ""}`} type="button" aria-label="방 리스트" onClick={() => onMove("rooms")}>
            <List size={18} />
            <span className="nav-label">방 리스트</span>
            {pendingInvitationCount > 0 ? <span className="count-badge">{pendingInvitationCount}</span> : null}
          </button>

          {rooms.map((room) => {
            const isSelected = room.id === selectedRoom?.id;
            const isExpanded = room.id === expandedRoomId && !collapsed;

            return (
              <div className={`room-entry ${isSelected ? "selected-room" : ""}`} key={room.id}>
                <button
                  className={`nav-item room-list-item ${isSelected ? "room-selected" : "muted"} ${isExpanded ? "is-expanded" : ""}`}
                  type="button"
                  aria-label={`${room.name} ${isExpanded ? "메뉴 접기" : "메뉴 펼치기"}`}
                  aria-expanded={isExpanded}
                  onClick={() => onSelectRoom(room.id, "home")}
                >
                  <UsersRound size={18} />
                  <span className="nav-label">{room.name}</span>
                  <ChevronDown size={16} />
                </button>

                <div className={`room-submenu ${isExpanded ? "is-open" : ""}`} aria-hidden={!isExpanded}>
                  <button className={activeView === "chat" && isSelected ? "active" : ""} type="button" tabIndex={isExpanded ? 0 : -1} onClick={() => onMoveRoomFeature(room.id, "chat")}>
                    <MessageCircle size={16} />
                    <span className="nav-label">채팅</span>
                    {room.unreadChatCount > 0 ? <span className="count-badge">{room.unreadChatCount}</span> : null}
                  </button>
                  <button className={activeView === "memories" && isSelected ? "active" : ""} type="button" tabIndex={isExpanded ? 0 : -1} onClick={() => onMoveRoomFeature(room.id, "memories")}>
                    <BookOpen size={16} />
                    <span className="nav-label">추억 게시판</span>
                  </button>
                  <button className={activeView === "missions" && isSelected ? "active" : ""} type="button" tabIndex={isExpanded ? 0 : -1} onClick={() => onMoveRoomFeature(room.id, "missions")}>
                    <CheckCircle2 size={16} />
                    <span className="nav-label">미션 인증</span>
                    {room.pendingMissionCount > 0 ? <span className="count-badge">{room.pendingMissionCount}</span> : null}
                  </button>
                  <button className={activeView === "letters" && isSelected ? "active" : ""} type="button" tabIndex={isExpanded ? 0 : -1} onClick={() => onMoveRoomFeature(room.id, "letters")}>
                    <Mail size={16} />
                    <span className="nav-label">편지</span>
                  </button>
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      <button className={`nav-item settings-active ${activeView === "settings" ? "active" : ""}`} type="button" aria-label="설정" onClick={() => onMove("settings")}>
        <Settings size={18} />
        <span className="nav-label">설정</span>
      </button>
    </aside>
  );
}

function HomeView({
  profile,
  initials,
  latestNotifications,
  onOpenNotifications,
  onNotificationClick,
  onOpenProfileEdit,
  onLogout,
}: {
  profile: MemberProfile | null;
  initials: string;
  latestNotifications: NotificationItem[];
  onOpenNotifications: () => void;
  onNotificationClick: (notification: NotificationItem) => void;
  onOpenProfileEdit: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      <header className="page-header">
        <div>
          <h1>메인 페이지</h1>
          <p>방 기준 사이드바로 이동하고, 프로필/알림/캘린더에서 오늘의 흐름을 확인한다.</p>
        </div>
      </header>

      <section className="home-grid">
        <article className="profile-panel compact-panel home-profile-card">
          <div className="panel-heading compact-heading">
            <div>
              <span>프로필</span>
              <h2>내 정보</h2>
            </div>
            <UserRound size={24} />
          </div>
          <div className="profile-summary home-profile-summary">
            <div className="home-profile-media">
              <div className="avatar">{profile?.profileImageUrl ? <img src={profile.profileImageUrl} alt="" /> : initials}</div>
              <dl className="home-profile-detail">
                <div>
                  <dt>이메일</dt>
                  <dd>{profile?.email ?? "-"}</dd>
                </div>
                <div>
                  <dt>전화번호</dt>
                  <dd>{profile?.phoneNumber ?? "-"}</dd>
                </div>
              </dl>
            </div>
            <div className="home-profile-info">
              <strong>{profile?.displayName ?? "-"}</strong>
              <span className="profile-username">아이디 {profile?.username ?? "-"}</span>
            </div>
          </div>
          <div className="profile-actions">
            <button className="primary-button" type="button" onClick={onOpenProfileEdit}>
              회원 정보 수정
            </button>
            <button className="outline-button" type="button" onClick={onLogout}>
              로그아웃
            </button>
          </div>
        </article>

        <article className="dashboard-card latest-notification-card">
          <div className="panel-heading compact-heading">
            <div>
              <span>최신 알림</span>
              <h2>지금 확인할 일</h2>
            </div>
            <button className="text-button" type="button" onClick={onOpenNotifications}>
              전체 보기
            </button>
          </div>

          <NotificationList notifications={latestNotifications.slice(0, 3)} onNotificationClick={onNotificationClick} />
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

function NotificationsModal({
  notifications,
  onNotificationClick,
  onClose,
}: {
  notifications: NotificationItem[];
  onNotificationClick: (notification: NotificationItem) => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal notification-modal" role="dialog" aria-modal="true" aria-labelledby="notifications-title">
        <div className="modal-title-row">
          <div>
            <h2 id="notifications-title">전체 알림</h2>
            <p>방별 채팅, 편지, 추억, 미션 알림을 최신순으로 확인한다.</p>
          </div>
          <button className="icon-button" type="button" aria-label="닫기" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <NotificationList notifications={notifications} onNotificationClick={onNotificationClick} dense />
      </section>
    </div>
  );
}

function NotificationList({
  notifications,
  onNotificationClick,
  dense = false,
}: {
  notifications: NotificationItem[];
  onNotificationClick: (notification: NotificationItem) => void;
  dense?: boolean;
}) {
  if (notifications.length === 0) {
    return (
      <div className="empty-notifications">
        <Bell size={22} />
        <span>확인할 최신 알림이 없습니다.</span>
      </div>
    );
  }

  return (
    <div className={`notification-list ${dense ? "dense" : ""}`}>
      {notifications.map((notification) => (
        <button
          className={`notification-item ${notification.read ? "read" : "unread"}`}
          type="button"
          key={notification.id}
          onClick={() => onNotificationClick(notification)}
        >
          {!notification.read ? <span className="notification-new-dot" aria-hidden="true" /> : null}
          <span className={`notification-type ${notification.type.toLowerCase().replace(/_/g, "-")}`}>
            {notificationIcon(notification.type)}
            {notificationTypeLabel(notification.type)}
          </span>
          <span className="notification-body">
            <strong>{notification.roomName ?? "기록방"}</strong>
            <span>
              {notification.actorName} · {notification.summary}
            </span>
          </span>
          <span className="notification-time">
            {!notification.read ? <span className="new-badge">NEW</span> : null}
            <Clock size={14} />
            {relativeTime(notification.occurredAt)}
          </span>
        </button>
      ))}
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

function notificationTargetView(notification: NotificationItem): AppView {
  if (notification.type === "CHAT" || notification.target.type === "CHAT") return "chat";
  if (notification.type === "LETTER" || notification.target.type === "LETTER") return "letters";
  if (notification.type === "MEMORY" || notification.target.type === "MEMORY") return "memories";
  return "missions";
}

function notificationTypeLabel(type: NotificationType): string {
  if (type === "CHAT") return "채팅";
  if (type === "LETTER") return "편지";
  if (type === "MEMORY") return "추억";
  return "미션";
}

function notificationIcon(type: NotificationType) {
  if (type === "CHAT") return <MessageCircle size={14} />;
  if (type === "LETTER") return <Mail size={14} />;
  if (type === "MEMORY") return <BookOpen size={14} />;
  return <CheckCircle2 size={14} />;
}

function relativeTime(value: string): string {
  const occurredAt = new Date(value).getTime();
  const diffMs = Date.now() - occurredAt;
  if (Number.isNaN(occurredAt) || diffMs < 0) return "방금 전";

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;

  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

async function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: "GET" });
}

async function safeApiGet<T>(path: string): Promise<T | null> {
  try {
    return await apiGet<T>(path);
  } catch {
    return null;
  }
}

async function safeApiRequest<T>(path: string, options: { method: string; body?: unknown }): Promise<T | null> {
  try {
    return await apiRequest<T>(path, options);
  } catch {
    return null;
  }
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
