import { StrictMode, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BadgeCheck,
  Bell,
  BookImage,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  Home,
  Image as ImageIcon,
  KeyRound,
  List,
  LogOut,
  Mail,
  MailPlus,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
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

type CreateRoomForm = {
  name: string;
  type: RoomSummary["type"];
  description: string;
};

type RoomsResponse = {
  rooms: RoomSummary[];
  pendingInvitationCount: number;
};

type CreateRoomResponse = {
  id: number;
  name: string;
  type: RoomSummary["type"];
  role: RoomSummary["role"];
};

type PendingRoomInvitation = {
  id: number;
  roomId: number;
  roomName: string;
  roomType: RoomSummary["type"];
  inviterName: string;
  createdAt: string;
  expiresAt: string;
};

type PendingRoomInvitationsResponse = {
  items: PendingRoomInvitation[];
};

type RespondRoomInvitationResponse = {
  id: number;
  roomId: number;
  status: "ACCEPTED" | "DECLINED";
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

type CalendarRoomActivity = {
  roomId: number;
  roomName: string;
  totalCount: number;
  chatCount: number;
  memoryCount: number;
  missionCount: number;
  letterCount: number;
};

type CalendarDayActivity = {
  date: string;
  totalCount: number;
  chatCount: number;
  memoryCount: number;
  missionCount: number;
  letterCount: number;
  rooms: CalendarRoomActivity[];
};

type CalendarResponse = {
  month: string;
  selectedDate: string | null;
  days: CalendarDayActivity[];
};

type ChatMessage = {
  id: number;
  roomId: number;
  senderMemberId: number;
  senderName: string;
  senderType: "MEMBER" | "ASSISTANT";
  body: string;
  sentAt: string;
  occurredDate: string;
  mine: boolean;
};

type ChatMessagesResponse = {
  roomId: number;
  roomName: string;
  date: string | null;
  messages: ChatMessage[];
};

type SendChatMessageResponse = {
  roomId: number;
  createdMessages: ChatMessage[];
};

type ChatSearchResult = {
  messageId: number;
  senderName: string;
  body: string;
  sentAt: string;
  occurredDate: string;
};

type ChatSearchResponse = {
  roomId: number;
  keyword: string;
  results: ChatSearchResult[];
};

type ApiError = {
  code: string;
  message: string;
  requestId: string;
};

type RoomFeatureKind = "chat" | "memories" | "missions" | "letters";
type AppView = "home" | "rooms" | "room" | "settings" | RoomFeatureKind;

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";
const memberHeader = { "X-Member-Id": "1" };
const currentMonth = toDateKey(new Date()).slice(0, 7);

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

const demoPendingInvitations: PendingRoomInvitation[] = [
  {
    id: 1,
    roomId: 4,
    roomName: "민지의 여행 준비방",
    roomType: "GROUP",
    inviterName: "민지",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    roomId: 40,
    roomName: "가족 여행 사진방",
    roomType: "FAMILY",
    inviterName: "아버지",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    roomId: 41,
    roomName: "4학년 1반",
    roomType: "GROUP",
    inviterName: "지훈",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
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

const demoCalendar: CalendarResponse = {
  month: currentMonth,
  selectedDate: monthDateKey(1),
  days: [
    demoCalendarDay(1, [
      demoCalendarRoom(1, "우리 둘의 100일", { chatCount: 2, missionCount: 1 }),
      demoCalendarRoom(2, "7월 가족", { memoryCount: 1 }),
    ]),
    demoCalendarDay(2, [
      demoCalendarRoom(1, "우리 둘의 100일", { chatCount: 1 }),
      demoCalendarRoom(2, "7월 가족", { memoryCount: 1 }),
      demoCalendarRoom(3, "여름 프로젝트반", { letterCount: 1 }),
    ]),
    demoCalendarDay(3, [
      demoCalendarRoom(1, "우리 둘의 100일", { chatCount: 1, missionCount: 1 }),
      demoCalendarRoom(2, "7월 가족", { chatCount: 1, letterCount: 1 }),
      demoCalendarRoom(3, "여름 프로젝트반", { memoryCount: 1 }),
    ]),
    demoCalendarDay(4, [
      demoCalendarRoom(1, "우리 둘의 100일", { missionCount: 1 }),
      demoCalendarRoom(2, "7월 가족", { chatCount: 1, letterCount: 1 }),
      demoCalendarRoom(3, "여름 프로젝트반", { memoryCount: 1 }),
    ]),
    demoCalendarDay(5, [
      demoCalendarRoom(1, "우리 둘의 100일", { memoryCount: 1, letterCount: 1 }),
      demoCalendarRoom(2, "7월 가족", { missionCount: 1 }),
    ]),
    demoCalendarDay(7, [
      demoCalendarRoom(1, "우리 둘의 100일", { chatCount: 1 }),
      demoCalendarRoom(2, "7월 가족", { memoryCount: 1 }),
      demoCalendarRoom(3, "여름 프로젝트반", { missionCount: 1, letterCount: 1 }),
    ]),
    demoCalendarDay(8, [
      demoCalendarRoom(2, "7월 가족", { chatCount: 1, letterCount: 1 }),
    ]),
    demoCalendarDay(9, [
      demoCalendarRoom(1, "우리 둘의 100일", { memoryCount: 1, letterCount: 1 }),
      demoCalendarRoom(2, "7월 가족", { missionCount: 1 }),
      demoCalendarRoom(3, "여름 프로젝트반", { chatCount: 1 }),
    ]),
    demoCalendarDay(10, [
      demoCalendarRoom(1, "우리 둘의 100일", { chatCount: 1, memoryCount: 1, missionCount: 1 }),
      demoCalendarRoom(2, "7월 가족", { chatCount: 1, missionCount: 1 }),
      demoCalendarRoom(3, "여름 프로젝트반", { memoryCount: 1 }),
    ]),
    demoCalendarDay(11, [
      demoCalendarRoom(1, "우리 둘의 100일", { chatCount: 1 }),
      demoCalendarRoom(2, "7월 가족", { letterCount: 1 }),
      demoCalendarRoom(3, "여름 프로젝트반", { memoryCount: 1 }),
    ]),
    demoCalendarDay(12, [
      demoCalendarRoom(1, "우리 둘의 100일", { memoryCount: 1, letterCount: 1 }),
      demoCalendarRoom(3, "여름 프로젝트반", { chatCount: 1, missionCount: 1 }),
    ]),
    demoCalendarDay(14, [
      demoCalendarRoom(1, "우리 둘의 100일", { chatCount: 1, missionCount: 1 }),
      demoCalendarRoom(2, "7월 가족", { memoryCount: 1, letterCount: 1 }),
      demoCalendarRoom(3, "여름 프로젝트반", { letterCount: 1 }),
    ]),
    demoCalendarDay(15, [
      demoCalendarRoom(2, "7월 가족", { chatCount: 1, memoryCount: 1 }),
    ]),
    demoCalendarDay(17, [
      demoCalendarRoom(1, "우리 둘의 100일", { chatCount: 1, memoryCount: 1, missionCount: 1, letterCount: 1 }),
      demoCalendarRoom(3, "여름 프로젝트반", { missionCount: 1 }),
    ]),
    demoCalendarDay(19, [
      demoCalendarRoom(1, "우리 둘의 100일", { memoryCount: 1 }),
      demoCalendarRoom(3, "여름 프로젝트반", { chatCount: 1, letterCount: 1 }),
    ]),
    demoCalendarDay(20, [
      demoCalendarRoom(1, "우리 둘의 100일", { chatCount: 1 }),
      demoCalendarRoom(2, "7월 가족", { memoryCount: 1 }),
      demoCalendarRoom(3, "여름 프로젝트반", { missionCount: 1 }),
    ]),
    demoCalendarDay(21, [
      demoCalendarRoom(2, "7월 가족", { chatCount: 1, memoryCount: 1, missionCount: 1, letterCount: 1 }),
      demoCalendarRoom(3, "여름 프로젝트반", { memoryCount: 1 }),
    ]),
    demoCalendarDay(22, [
      demoCalendarRoom(1, "우리 둘의 100일", { chatCount: 1, letterCount: 1 }),
    ]),
    demoCalendarDay(23, [
      demoCalendarRoom(1, "우리 둘의 100일", { memoryCount: 1 }),
      demoCalendarRoom(2, "7월 가족", { letterCount: 1 }),
      demoCalendarRoom(3, "여름 프로젝트반", { chatCount: 1 }),
    ]),
    demoCalendarDay(24, [
      demoCalendarRoom(1, "우리 둘의 100일", { memoryCount: 1, missionCount: 1 }),
      demoCalendarRoom(3, "여름 프로젝트반", { chatCount: 1, letterCount: 1 }),
    ]),
    demoCalendarDay(26, [
      demoCalendarRoom(2, "7월 가족", { chatCount: 1, missionCount: 1, letterCount: 1 }),
    ]),
    demoCalendarDay(27, [
      demoCalendarRoom(1, "우리 둘의 100일", { letterCount: 1 }),
      demoCalendarRoom(2, "7월 가족", { chatCount: 1 }),
      demoCalendarRoom(3, "여름 프로젝트반", { memoryCount: 1, missionCount: 1 }),
    ]),
    demoCalendarDay(28, [
      demoCalendarRoom(1, "우리 둘의 100일", { chatCount: 1, missionCount: 1, letterCount: 1 }),
      demoCalendarRoom(2, "7월 가족", { memoryCount: 1 }),
      demoCalendarRoom(3, "여름 프로젝트반", { memoryCount: 1, missionCount: 1 }),
    ]),
    demoCalendarDay(29, [
      demoCalendarRoom(2, "7월 가족", { chatCount: 1, memoryCount: 1 }),
      demoCalendarRoom(3, "여름 프로젝트반", { memoryCount: 1, letterCount: 1 }),
    ]),
    demoCalendarDay(30, [
      demoCalendarRoom(2, "7월 가족", { memoryCount: 1, missionCount: 1 }),
      demoCalendarRoom(3, "여름 프로젝트반", { chatCount: 1 }),
    ]),
    demoCalendarDay(31, [
      demoCalendarRoom(1, "우리 둘의 100일", { memoryCount: 1, missionCount: 1 }),
      demoCalendarRoom(3, "여름 프로젝트반", { chatCount: 1, letterCount: 1 }),
    ]),
  ],
};

function demoCalendarRoom(
  roomId: number,
  roomName: string,
  counts: Partial<Pick<CalendarRoomActivity, "chatCount" | "memoryCount" | "missionCount" | "letterCount">>,
): CalendarRoomActivity {
  const chatCount = counts.chatCount ?? 0;
  const memoryCount = counts.memoryCount ?? 0;
  const missionCount = counts.missionCount ?? 0;
  const letterCount = counts.letterCount ?? 0;

  return {
    roomId,
    roomName,
    totalCount: chatCount + memoryCount + missionCount + letterCount,
    chatCount,
    memoryCount,
    missionCount,
    letterCount,
  };
}

function demoCalendarDay(day: number, rooms: CalendarRoomActivity[]): CalendarDayActivity {
  return {
    date: monthDateKey(day),
    totalCount: rooms.reduce((sum, room) => sum + room.totalCount, 0),
    chatCount: rooms.reduce((sum, room) => sum + room.chatCount, 0),
    memoryCount: rooms.reduce((sum, room) => sum + room.memoryCount, 0),
    missionCount: rooms.reduce((sum, room) => sum + room.missionCount, 0),
    letterCount: rooms.reduce((sum, room) => sum + room.letterCount, 0),
    rooms,
  };
}

function App() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [latestNotifications, setLatestNotifications] = useState<NotificationItem[]>([]);
  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingRoomInvitation[]>([]);
  const [calendar, setCalendar] = useState<CalendarResponse | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [calendarRoomId, setCalendarRoomId] = useState<number | null>(null);
  const [pendingInvitationCount, setPendingInvitationCount] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [expandedRoomId, setExpandedRoomId] = useState<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<AppView>("home");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatDraft, setChatDraft] = useState("");
  const [chatSearchKeyword, setChatSearchKeyword] = useState("");
  const [chatSearchResults, setChatSearchResults] = useState<ChatSearchResult[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const chatSendingRef = useRef(false);
  const [profileForm, setProfileForm] = useState({ displayName: "", profileImageUrl: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [createRoomForm, setCreateRoomForm] = useState<CreateRoomForm>({ name: "", type: "COUPLE", description: "" });
  const [inviteContacts, setInviteContacts] = useState<Record<number, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [roomFeedbackModal, setRoomFeedbackModal] = useState<{ title: string; message: string } | null>(null);
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

  useEffect(() => {
    if ((activeView !== "chat" && activeView !== "room") || !selectedRoom) return;

    void loadChatMessages(selectedRoom.id);
  }, [activeView, selectedRoom?.id]);

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
      await loadPendingInvitations();
      await loadCalendarActivities(null);
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
      setPendingInvitations(demoPendingInvitations);
      setLatestNotifications(demoNotifications.filter((notification) => !notification.read).slice(0, 3));
      setAllNotifications(demoNotifications);
      setCalendar(demoCalendar);
      setSelectedCalendarDate(demoCalendar.selectedDate ?? demoCalendar.days[0]?.date ?? null);
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

  async function loadRooms() {
    const roomsResponse = await apiGet<RoomsResponse>("/rooms");
    const visibleRooms = roomsResponse.rooms.length > 0 ? roomsResponse.rooms : demoRooms;
    setRooms(visibleRooms);
    setPendingInvitationCount(roomsResponse.pendingInvitationCount);
    setSelectedRoomId((currentSelectedRoomId) => currentSelectedRoomId ?? visibleRooms[0]?.id ?? null);

    return visibleRooms;
  }

  async function loadPendingInvitations() {
    const response = await safeApiGet<PendingRoomInvitationsResponse>("/room-invitations/pending");
    setPendingInvitations(response?.items ?? []);
  }

  async function loadCalendarActivities(nextRoomId: number | null) {
    const roomQuery = nextRoomId ? `&roomId=${nextRoomId}` : "";
    const calendarResponse = await safeApiGet<CalendarResponse>(`/calendar?month=${currentMonth}${roomQuery}`);
    const nextCalendar = calendarResponse ?? filterDemoCalendar(nextRoomId);

    setCalendar(nextCalendar);
    setSelectedCalendarDate((currentDate) => {
      if (currentDate && nextCalendar.days.some((day) => day.date === currentDate)) {
        return currentDate;
      }

      return nextCalendar.selectedDate ?? nextCalendar.days[0]?.date ?? null;
    });
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

    setLatestNotifications((current) => current.map(markAsRead));
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

  function openRoomHome(roomId: number) {
    setMessage(null);
    setErrorMessage(null);
    setSelectedRoomId(roomId);
    setExpandedRoomId(roomId);
    setActiveView("room");
  }

  function moveToRoomFeature(roomId: number, view: RoomFeatureKind) {
    setSelectedRoomId(roomId);
    setExpandedRoomId(roomId);
    setActiveView(view);
  }

  async function loadChatMessages(roomId: number) {
    setChatLoading(true);
    const response = await safeApiGet<ChatMessagesResponse>(`/rooms/${roomId}/chat/messages`);
    setChatMessages(response?.messages ?? demoChatMessages(roomId));
    setChatLoading(false);
  }

  async function sendChatMessage() {
    if (!selectedRoom) return;
    if (chatSendingRef.current) return;

    const body = chatDraft.trim();
    if (!body) {
      setErrorMessage("메시지를 입력해 주세요.");
      return;
    }

    setMessage(null);
    setErrorMessage(null);
    chatSendingRef.current = true;
    setChatSending(true);
    try {
      const response = await apiRequest<SendChatMessageResponse>(`/rooms/${selectedRoom.id}/chat/messages`, {
        method: "POST",
        body: { body },
      });
      setChatMessages((current) => [...current, ...response.createdMessages]);
      setChatDraft("");
      await loadCalendarActivities(calendarRoomId);
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      chatSendingRef.current = false;
      setChatSending(false);
    }
  }

  async function searchChatMessages() {
    if (!selectedRoom) return;

    const keyword = chatSearchKeyword.trim();
    if (!keyword) {
      setChatSearchResults([]);
      return;
    }

    const response = await safeApiGet<ChatSearchResponse>(`/rooms/${selectedRoom.id}/chat/search?keyword=${encodeURIComponent(keyword)}`);
    setChatSearchResults(response?.results ?? searchDemoChatMessages(selectedRoom.id, keyword));
  }

  function moveToChatMessage(messageId: number) {
    const element = document.getElementById(`chat-message-${messageId}`);
    element?.scrollIntoView({ block: "center", behavior: "smooth" });
    element?.classList.add("is-targeted");
    window.setTimeout(() => element?.classList.remove("is-targeted"), 1200);
  }

  function changeCalendarRoomFilter(nextRoomId: number | null) {
    setCalendarRoomId(nextRoomId);
    void loadCalendarActivities(nextRoomId);
  }

  function viewSelectedDateRecords(summaryRoomId?: number) {
    const selectedDay = calendar?.days.find((day) => day.date === selectedCalendarDate);
    const target = selectedDay ? calendarTarget(selectedDay, summaryRoomId) : null;

    if (!target) {
      return;
    }

    moveToRoomFeature(target.roomId, target.view);
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

  async function createRoom() {
    setMessage(null);
    setErrorMessage(null);
    setRoomFeedbackModal(null);
    try {
      const createdRoom = await apiRequest<CreateRoomResponse>("/rooms", {
        method: "POST",
        body: {
          name: createRoomForm.name,
          type: createRoomForm.type,
          description: createRoomForm.description || null,
        },
      });
      const nextRooms = await loadRooms();
      await loadCalendarActivities(calendarRoomId);
      setSelectedRoomId(createdRoom.id);
      setExpandedRoomId(createdRoom.id);
      setCreateRoomForm({ name: "", type: "COUPLE", description: "" });
      setRoomFeedbackModal({
        title: "방 생성 완료",
        message: `${nextRooms.find((room) => room.id === createdRoom.id)?.name ?? createdRoom.name} 방을 만들었습니다.`,
      });
    } catch (error) {
      setRoomFeedbackModal({ title: "방 생성 실패", message: toMessage(error) });
    }
  }

  async function sendRoomInvitation(roomId: number) {
    const contact = inviteContacts[roomId]?.trim() ?? "";
    setMessage(null);
    setErrorMessage(null);
    setRoomFeedbackModal(null);

    if (!contact) {
      setRoomFeedbackModal({ title: "초대 실패", message: "초대할 이메일 또는 전화번호를 입력해 주세요." });
      return;
    }

    try {
      await apiRequest<{ id: number; status: string; expiresAt: string }>(`/rooms/${roomId}/invitations`, {
        method: "POST",
        body: contact.includes("@") ? { email: contact, phoneNumber: null } : { email: null, phoneNumber: contact },
      });
      setInviteContacts((current) => ({ ...current, [roomId]: "" }));
      await loadRooms();
      setRoomFeedbackModal({ title: "초대 완료", message: "초대를 보냈습니다." });
    } catch (error) {
      setRoomFeedbackModal({ title: "초대 실패", message: toMessage(error) });
    }
  }

  async function respondInvitation(invitationId: number, action: "accept" | "decline") {
    setMessage(null);
    setErrorMessage(null);
    setRoomFeedbackModal(null);
    try {
      const response = await apiRequest<RespondRoomInvitationResponse>(`/room-invitations/${invitationId}/${action}`, {
        method: "POST",
      });
      await loadRooms();
      await loadPendingInvitations();
      if (action === "accept") {
        setSelectedRoomId(response.roomId);
        setExpandedRoomId(response.roomId);
        setRoomFeedbackModal({
          title: "초대 수락 완료",
          message: "초대를 수락했습니다. 방 리스트에 새 방이 추가되었습니다.",
        });
      } else {
        setRoomFeedbackModal({ title: "초대 거절 완료", message: "초대를 거절했습니다." });
      }
    } catch (error) {
      setRoomFeedbackModal({ title: "초대 응답 실패", message: toMessage(error) });
    }
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
            rooms={rooms}
            latestNotifications={latestNotifications}
            calendar={calendar}
            selectedCalendarDate={selectedCalendarDate}
            calendarRoomId={calendarRoomId}
            onOpenNotifications={openNotificationsModal}
            onNotificationClick={handleNotificationClick}
            onCalendarRoomFilter={changeCalendarRoomFilter}
            onCalendarDateSelect={setSelectedCalendarDate}
            onViewDateRecords={viewSelectedDateRecords}
            onOpenProfileEdit={() => setProfileEditOpen(true)}
            onLogout={() => setLogoutOpen(true)}
          />
        ) : null}
        {activeView === "room" ? (
          <RoomHomeView
            selectedRoom={selectedRoom}
            messages={chatMessages}
            draft={chatDraft}
            loading={chatLoading}
            sending={chatSending}
            onDraftChange={setChatDraft}
            onSend={sendChatMessage}
            onMoveRoomFeature={(view) => {
              if (!selectedRoom) return;
              moveToRoomFeature(selectedRoom.id, view);
            }}
          />
        ) : null}
        {activeView === "rooms" ? (
          <RoomsView
            rooms={rooms}
            selectedRoomId={selectedRoom?.id ?? null}
            pendingInvitationCount={pendingInvitationCount}
            pendingInvitations={pendingInvitations}
            createRoomForm={createRoomForm}
            inviteContacts={inviteContacts}
            onCreateRoomFormChange={setCreateRoomForm}
            onCreateRoom={createRoom}
            onInviteContactChange={(roomId, value) => setInviteContacts((current) => ({ ...current, [roomId]: value }))}
            onSendInvitation={sendRoomInvitation}
            onRespondInvitation={respondInvitation}
            onSelectRoom={openRoomHome}
          />
        ) : null}
        {activeView === "chat" ? (
          <ChatView
            selectedRoom={selectedRoom}
            messages={chatMessages}
            draft={chatDraft}
            searchKeyword={chatSearchKeyword}
            searchResults={chatSearchResults}
            loading={chatLoading}
            sending={chatSending}
            onDraftChange={setChatDraft}
            onSend={sendChatMessage}
            onSearchKeywordChange={setChatSearchKeyword}
            onSearch={searchChatMessages}
            onMoveToMessage={moveToChatMessage}
          />
        ) : null}
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

      {roomFeedbackModal ? (
        <AlertModal title={roomFeedbackModal.title} message={roomFeedbackModal.message} onClose={() => setRoomFeedbackModal(null)} />
      ) : null}

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
  onMoveRoomFeature: (roomId: number, view: RoomFeatureKind) => void;
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
                  onClick={() => onSelectRoom(room.id, "room")}
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
  rooms,
  latestNotifications,
  calendar,
  selectedCalendarDate,
  calendarRoomId,
  onOpenNotifications,
  onNotificationClick,
  onCalendarRoomFilter,
  onCalendarDateSelect,
  onViewDateRecords,
  onOpenProfileEdit,
  onLogout,
}: {
  profile: MemberProfile | null;
  initials: string;
  rooms: RoomSummary[];
  latestNotifications: NotificationItem[];
  calendar: CalendarResponse | null;
  selectedCalendarDate: string | null;
  calendarRoomId: number | null;
  onOpenNotifications: () => void;
  onNotificationClick: (notification: NotificationItem) => void;
  onCalendarRoomFilter: (roomId: number | null) => void;
  onCalendarDateSelect: (date: string) => void;
  onViewDateRecords: (roomId?: number) => void;
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
            <div className="avatar">{profile?.profileImageUrl ? <img src={profile.profileImageUrl} alt="" /> : initials}</div>
            <div className="home-profile-info">
              <strong>{profile?.displayName ?? "-"}</strong>
              <dl className="profile-username">
                <div>
                  <dt>아이디</dt>
                  <dd>{profile?.username ?? "-"}</dd>
                </div>
              </dl>
            </div>
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
              <span>전체 기록 캘린더</span>
              <h2>날짜별 기록 흐름</h2>
            </div>
            <CalendarDays size={24} />
          </div>
          <RecordCalendar
            calendar={calendar}
            rooms={rooms}
            selectedDate={selectedCalendarDate}
            selectedRoomId={calendarRoomId}
            onRoomFilter={onCalendarRoomFilter}
            onDateSelect={onCalendarDateSelect}
            onViewRecords={onViewDateRecords}
          />
        </article>
      </section>
    </>
  );
}

function RecordCalendar({
  calendar,
  rooms,
  selectedDate,
  selectedRoomId,
  onRoomFilter,
  onDateSelect,
  onViewRecords,
}: {
  calendar: CalendarResponse | null;
  rooms: RoomSummary[];
  selectedDate: string | null;
  selectedRoomId: number | null;
  onRoomFilter: (roomId: number | null) => void;
  onDateSelect: (date: string) => void;
  onViewRecords: (roomId?: number) => void;
}) {
  const [selectedSummaryRoomId, setSelectedSummaryRoomId] = useState<number | null>(null);
  const month = calendar?.month ?? currentMonth;
  const days = useMemo(() => buildCalendarCells(month), [month]);
  const activityByDate = useMemo(() => new Map((calendar?.days ?? []).map((day) => [day.date, day])), [calendar]);
  const selectedDay = selectedDate ? activityByDate.get(selectedDate) ?? null : null;
  const selectedDayLabel = selectedDate ? formatDateLabel(selectedDate) : "날짜를 선택하세요";
  const activeSummaryRooms = selectedDay?.rooms.filter((room) => room.totalCount > 0) ?? [];
  const requiresRoomSelection = activeSummaryRooms.length > 1;
  const selectedSummaryRoom = activeSummaryRooms.find((room) => room.roomId === selectedSummaryRoomId) ?? null;
  const canViewRecords = Boolean(selectedDay && selectedDay.totalCount > 0 && (!requiresRoomSelection || selectedSummaryRoom));

  useEffect(() => {
    setSelectedSummaryRoomId(null);
  }, [selectedDate, selectedRoomId]);

  return (
    <div className="record-calendar">
      <div className="calendar-filter-row" aria-label="캘린더 방 필터">
        <button className={selectedRoomId === null ? "active" : ""} type="button" onClick={() => onRoomFilter(null)}>
          전체
        </button>
        {rooms.map((room) => (
          <button className={selectedRoomId === room.id ? "active" : ""} type="button" key={room.id} onClick={() => onRoomFilter(room.id)}>
            {room.name}
          </button>
        ))}
      </div>

      <div className="calendar-legend" aria-label="기록 유형 범례">
        <span><ActivityIcon type="chat" />채팅</span>
        <span><ActivityIcon type="mission" />미션</span>
        <span><ActivityIcon type="memory" />추억</span>
        <span><ActivityIcon type="letter" />편지</span>
      </div>

      <div className="calendar-content">
        <div className="calendar-month">
          <div className="calendar-month-header">
            <strong>{formatMonthLabel(month)}</strong>
            <span>활동 있는 날짜를 선택해 기록 흐름을 확인한다.</span>
          </div>
          <div className="calendar-weekdays" aria-hidden="true">
            {["일", "월", "화", "수", "목", "금", "토"].map((weekday) => (
              <span key={weekday}>{weekday}</span>
            ))}
          </div>
          <div className="calendar-grid" aria-label={`${formatMonthLabel(month)} 기록 캘린더`}>
            {days.map((cell, index) => {
              const cellDate = cell.date;
              const activity = cellDate ? activityByDate.get(cellDate) : null;
              const isSelected = Boolean(cellDate && selectedDate === cellDate);

              return cellDate ? (
                <button
                  className={`calendar-day ${activity ? "has-activity" : ""} ${isSelected ? "selected" : ""}`}
                  type="button"
                  key={cellDate}
                  onClick={() => onDateSelect(cellDate)}
                >
                  <span>{cell.dayNumber}</span>
                  {activity ? <ActivityDots activity={activity} /> : null}
                </button>
              ) : (
                <span className="calendar-day empty" key={`empty-${index}`} />
              );
            })}
          </div>
        </div>

        <aside className="selected-day-summary">
          <span>선택 날짜 요약</span>
          <h3>{selectedDayLabel}</h3>
          {selectedDay ? (
            <>
              <p>{activitySummaryText(selectedDay)}</p>
              {requiresRoomSelection ? <p className="summary-help">기록을 볼 방을 먼저 선택하세요.</p> : null}
              <div className="summary-room-list">
                {activeSummaryRooms.map((room) => (
                  <button
                    className={room.roomId === selectedSummaryRoomId ? "selected" : ""}
                    type="button"
                    key={room.roomId}
                    onClick={() => setSelectedSummaryRoomId(room.roomId)}
                    disabled={!requiresRoomSelection}
                    aria-pressed={room.roomId === selectedSummaryRoomId}
                  >
                    <strong>{room.roomName}</strong>
                    <span>{activitySummaryText(room)}</span>
                  </button>
                ))}
              </div>
              <button className="primary-button" type="button" onClick={() => onViewRecords(selectedSummaryRoom?.roomId)} disabled={!canViewRecords}>
                {requiresRoomSelection && !selectedSummaryRoom ? "방을 선택하세요" : "기록 보기"}
              </button>
            </>
          ) : (
            <>
              <p>선택한 날짜에 아직 기록이 없습니다.</p>
              <button className="primary-button" type="button" disabled>
                기록 보기
              </button>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

function ActivityDots({ activity }: { activity: CalendarDayActivity }) {
  return (
    <span className="activity-dots" aria-label={activitySummaryText(activity)}>
      {activity.chatCount > 0 ? <ActivityIcon type="chat" /> : null}
      {activity.missionCount > 0 ? <ActivityIcon type="mission" /> : null}
      {activity.memoryCount > 0 ? <ActivityIcon type="memory" /> : null}
      {activity.letterCount > 0 ? <ActivityIcon type="letter" /> : null}
    </span>
  );
}

function ActivityIcon({ type }: { type: "chat" | "mission" | "memory" | "letter" }) {
  const className = `activity-icon ${type}`;

  if (type === "chat") return <MessageCircle className={className} size={16} aria-hidden="true" />;
  if (type === "mission") return <CheckCircle2 className={className} size={16} aria-hidden="true" />;
  if (type === "memory") return <ImageIcon className={className} size={16} aria-hidden="true" />;

  return <Mail className={className} size={16} aria-hidden="true" />;
}

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest("button, input, select, textarea, a"));
}

function RoomHomeView({
  selectedRoom,
  messages,
  draft,
  loading,
  sending,
  onDraftChange,
  onSend,
  onMoveRoomFeature,
}: {
  selectedRoom: RoomSummary | null;
  messages: ChatMessage[];
  draft: string;
  loading: boolean;
  sending: boolean;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onMoveRoomFeature: (view: RoomFeatureKind) => void;
}) {
  if (!selectedRoom) {
    return (
      <>
        <header className="page-header">
          <div>
            <h1>방 홈</h1>
            <p>참여 중인 방을 선택하면 방 기준 기록 흐름을 확인할 수 있다.</p>
          </div>
        </header>
        <section className="placeholder-page">
          <article className="dashboard-card wide-card">
            <div className="panel-heading">
              <div>
                <span>방 선택 필요</span>
                <h2>참여 방이 없습니다</h2>
              </div>
              <UsersRound size={24} />
            </div>
            <p>방 리스트에서 참여 방을 만들거나 초대를 수락해 주세요.</p>
          </article>
        </section>
      </>
    );
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1>{selectedRoom.name}</h1>
          <p>최근 대화와 기록 기능을 한 곳에서 확인한다.</p>
        </div>
      </header>

      <section className="room-home-page">
        <article className="room-home-summary">
          <div>
            <span>{roomTypeLabel(selectedRoom.type)}</span>
            <h2>{selectedRoom.name}</h2>
            <p>{selectedRoom.description ?? "설명 없음"}</p>
          </div>
          <dl className="room-home-meta">
            <div>
              <dt>역할</dt>
              <dd>{selectedRoom.role === "OWNER" ? "방장" : "멤버"}</dd>
            </div>
            <div>
              <dt>멤버</dt>
              <dd>{selectedRoom.memberCount}명</dd>
            </div>
          </dl>
        </article>

        <div className="room-home-content">
          <article className="room-chat-preview">
            <div className="room-section-heading">
              <h2>최근 대화</h2>
              <p>방의 메인 소통 흐름을 먼저 보여주고 바로 대화를 남긴다.</p>
            </div>
            <ChatMessageTimeline messages={messages} loading={loading} compact />
            <div className="chat-input-row compact-chat-input">
              <textarea
                value={draft}
                onChange={(event) => onDraftChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.nativeEvent.isComposing || event.key !== "Enter" || event.shiftKey) return;
                  event.preventDefault();
                  onSend();
                }}
                placeholder="이 방에 남길 메시지"
                rows={1}
              />
              <button className="primary-button" type="button" onClick={onSend} disabled={!selectedRoom || sending}>
                {sending ? "전송 중" : "보내기"}
              </button>
            </div>
          </article>

          <article className="room-feature-panel">
            <div className="room-section-heading">
              <h2>방 기능</h2>
              <p>대화에서 파생된 기록을 기능별로 확인한다.</p>
            </div>
            <div className="room-feature-list">
              <button className="room-feature-card memory" type="button" onClick={() => onMoveRoomFeature("memories")}>
                <span className="room-feature-icon"><BookImage size={32} /></span>
                <span>
                  <strong>추억 게시판</strong>
                  <small>사진과 글로 남긴 추억 보기</small>
                </span>
                <span aria-hidden="true">›</span>
              </button>
              <button className="room-feature-card mission" type="button" onClick={() => onMoveRoomFeature("missions")}>
                <span className="room-feature-icon"><BadgeCheck size={32} /></span>
                <span>
                  <strong>미션 인증</strong>
                  <small>인증 요청과 동의 현황 확인</small>
                </span>
                <span aria-hidden="true">›</span>
              </button>
              <button className="room-feature-card letter" type="button" onClick={() => onMoveRoomFeature("letters")}>
                <span className="room-feature-icon"><MailPlus size={32} /></span>
                <span>
                  <strong>편지</strong>
                  <small>편지를 작성하거나 받은 편지 보기</small>
                </span>
                <span aria-hidden="true">›</span>
              </button>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}

function ChatMessageTimeline({ messages, loading, compact = false }: { messages: ChatMessage[]; loading: boolean; compact?: boolean }) {
  const endRef = useRef<HTMLDivElement | null>(null);
  const groupedMessages = useMemo(() => groupChatMessagesByDate(messages), [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  return (
    <div className={`chat-message-area ${compact ? "compact-chat-area" : ""}`} aria-live="polite">
      {loading ? <p className="chat-empty">대화를 불러오는 중입니다.</p> : null}
      {!loading && groupedMessages.length === 0 ? <p className="chat-empty">아직 남긴 대화가 없습니다.</p> : null}
      {groupedMessages.map((group) => (
        <div className="chat-day-group" key={group.date}>
          <div className="chat-date-divider">{formatDateLabel(group.date)}</div>
          {group.messages.map((message) => (
            <div
              className={`chat-message-row ${message.mine ? "mine" : ""} ${message.senderType === "ASSISTANT" ? "assistant" : ""}`}
              id={`chat-message-${message.id}`}
              key={message.id}
            >
              <div className="chat-message-meta">
                <strong>{message.senderName}</strong>
                <span>{formatChatTime(message.sentAt)}</span>
              </div>
              <p className="chat-message-bubble">{message.body}</p>
            </div>
          ))}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}

function RoomsView({
  rooms,
  selectedRoomId,
  pendingInvitationCount,
  pendingInvitations,
  createRoomForm,
  inviteContacts,
  onCreateRoomFormChange,
  onCreateRoom,
  onInviteContactChange,
  onSendInvitation,
  onRespondInvitation,
  onSelectRoom,
}: {
  rooms: RoomSummary[];
  selectedRoomId: number | null;
  pendingInvitationCount: number;
  pendingInvitations: PendingRoomInvitation[];
  createRoomForm: CreateRoomForm;
  inviteContacts: Record<number, string>;
  onCreateRoomFormChange: (form: CreateRoomForm) => void;
  onCreateRoom: () => void;
  onInviteContactChange: (roomId: number, value: string) => void;
  onSendInvitation: (roomId: number) => void;
  onRespondInvitation: (invitationId: number, action: "accept" | "decline") => void;
  onSelectRoom: (roomId: number) => void;
}) {
  return (
    <>
      <header className="page-header">
        <div>
          <h1>방 리스트</h1>
          <p>방을 만들고, 초대를 보내고, 받은 초대를 수락하거나 거절한다.</p>
        </div>
      </header>

      <section className="room-hub-grid">
        <article className="hub-card room-create-card">
          <span>새 방 만들기</span>
          <div className="room-form-grid">
            <label className="field compact-field">
              방 이름
              <input
                value={createRoomForm.name}
                onChange={(event) => onCreateRoomFormChange({ ...createRoomForm, name: event.target.value })}
                placeholder="예: 우리 둘의 200일"
              />
            </label>
            <label className="field compact-field">
              방 타입
              <select
                value={createRoomForm.type}
                onChange={(event) => onCreateRoomFormChange({ ...createRoomForm, type: event.target.value as RoomSummary["type"] })}
              >
                <option value="COUPLE">커플</option>
                <option value="FAMILY">가족</option>
                <option value="GROUP">학급/동아리</option>
              </select>
            </label>
          </div>
          <label className="field compact-field">
            방 설명
            <input
              value={createRoomForm.description}
              onChange={(event) => onCreateRoomFormChange({ ...createRoomForm, description: event.target.value })}
              placeholder="방의 목적을 짧게 적는다"
            />
          </label>
          <button className="primary-button full-width compact-submit" type="button" onClick={onCreateRoom}>
            방 생성
          </button>
        </article>

        <article className="hub-card invitation-card">
          <span>초대 받은 방</span>
          <strong>{pendingInvitationCount}개</strong>
          {pendingInvitations.length > 0 ? (
            <div className="pending-invitation-list">
              {pendingInvitations.map((invitation) => (
                <div className="pending-invitation-item" key={invitation.id}>
                  <div>
                    <strong>{invitation.roomName}</strong>
                    <p>{invitation.inviterName}님이 초대했습니다. {roomTypeLabel(invitation.roomType)}</p>
                  </div>
                  <div className="inline-actions">
                    <button className="primary-button small-button" type="button" onClick={() => onRespondInvitation(invitation.id, "accept")}>
                      수락
                    </button>
                    <button className="outline-button small-button" type="button" onClick={() => onRespondInvitation(invitation.id, "decline")}>
                      거절
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>현재 처리할 초대가 없습니다.</p>
          )}
        </article>

        <article className="hub-card">
          <span>참여 방</span>
          <strong>{rooms.length}개</strong>
          <p>현재 멤버가 참여 중인 기록방 목록이다.</p>
          <p>방장인 방에서는 이메일 또는 전화번호로 바로 초대할 수 있다.</p>
        </article>
      </section>

      <section className="joined-room-list">
        {rooms.map((room) => {
          const canInvite = room.role === "OWNER";

          return (
            <article
              className={`room-card ${room.id === selectedRoomId ? "selected" : ""}`}
              key={room.id}
              role="button"
              tabIndex={0}
              aria-label={`${room.name} 방으로 이동`}
              onClick={(event) => {
                if (isInteractiveTarget(event.target)) return;
                onSelectRoom(room.id);
              }}
              onKeyDown={(event) => {
                if (isInteractiveTarget(event.target)) return;
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                onSelectRoom(room.id);
              }}
            >
              <div>
                <span>{roomTypeLabel(room.type)}</span>
                <h2>{room.name}</h2>
                <p>{room.description ?? "설명 없음"}</p>
              </div>
              <dl className="room-meta">
                <div>
                  <dt>역할</dt>
                  <dd>{canInvite ? "방장" : "멤버"}</dd>
                </div>
                <div>
                  <dt>멤버</dt>
                  <dd>{room.memberCount}명</dd>
                </div>
              </dl>
              <div className="room-card-actions">
                <div className={`invite-inline-form ${canInvite ? "" : "is-disabled"}`}>
                  <input
                    value={canInvite ? inviteContacts[room.id] ?? "" : ""}
                    onChange={(event) => onInviteContactChange(room.id, event.target.value)}
                    placeholder={canInvite ? "이메일 또는 전화번호" : "방장만 초대할 수 있습니다"}
                    aria-label={`${room.name} 초대 연락처`}
                    disabled={!canInvite}
                  />
                  <button className="primary-button" type="button" onClick={() => onSendInvitation(room.id)} disabled={!canInvite}>
                    초대
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}

function ChatView({
  selectedRoom,
  messages,
  draft,
  searchKeyword,
  searchResults,
  loading,
  sending,
  onDraftChange,
  onSend,
  onSearchKeywordChange,
  onSearch,
  onMoveToMessage,
}: {
  selectedRoom: RoomSummary | null;
  messages: ChatMessage[];
  draft: string;
  searchKeyword: string;
  searchResults: ChatSearchResult[];
  loading: boolean;
  sending: boolean;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onSearchKeywordChange: (value: string) => void;
  onSearch: () => void;
  onMoveToMessage: (messageId: number) => void;
}) {
  return (
    <>
      <header className="page-header">
        <div>
          <h1>채팅</h1>
          <p>{selectedRoom ? `${selectedRoom.name}의 날짜별 대화 기록을 확인하고 새 메시지를 남긴다.` : "선택된 방이 없습니다."}</p>
        </div>
      </header>

      <section className="chat-page">
        <article className="chat-window">
          <div className="chat-window-header">
            <div>
              <span>{selectedRoom ? roomTypeLabel(selectedRoom.type) : "방 없음"}</span>
              <h2>{selectedRoom?.name ?? "참여 방 없음"}</h2>
            </div>
            <MessageCircle size={24} />
          </div>

          <ChatMessageTimeline messages={messages} loading={loading} />

          <div className="chat-input-row">
            <textarea
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.nativeEvent.isComposing || event.key !== "Enter" || event.shiftKey) return;
                event.preventDefault();
                onSend();
              }}
              placeholder="메시지를 입력하면 방 구성원이 답장합니다."
              rows={2}
            />
            <button className="primary-button" type="button" onClick={onSend} disabled={!selectedRoom || sending}>
              {sending ? "전송 중" : "보내기"}
            </button>
          </div>
        </article>

        <aside className="chat-search-panel">
          <div className="room-section-heading">
            <h2>대화 검색</h2>
            <p>검색 결과를 누르면 해당 메시지 위치로 이동한다.</p>
          </div>
          <div className="chat-search-form">
            <input
              value={searchKeyword}
              onChange={(event) => onSearchKeywordChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                onSearch();
              }}
              placeholder="검색어 입력"
            />
            <button className="outline-button" type="button" onClick={onSearch}>
              검색
            </button>
          </div>
          <div className="chat-search-results">
            {searchResults.length === 0 ? <p>검색 결과가 여기에 표시됩니다.</p> : null}
            {searchResults.map((result) => (
              <button type="button" key={result.messageId} onClick={() => onMoveToMessage(result.messageId)}>
                <strong>{result.senderName}</strong>
                <span>{formatDateLabel(result.occurredDate)} · {formatChatTime(result.sentAt)}</span>
                <p>{result.body}</p>
              </button>
            ))}
          </div>
        </aside>
      </section>
    </>
  );
}

function RoomFeatureView({ selectedRoom, kind }: { selectedRoom: RoomSummary | null; kind: RoomFeatureKind }) {
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

function AlertModal({ title, message, onClose }: { title: string; message: string; onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="alertdialog" aria-modal="true" aria-labelledby="alert-title">
        <h2 id="alert-title">{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="primary-button" type="button" onClick={onClose}>
            확인
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

function roomFeatureCopy(kind: RoomFeatureKind) {
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
      icon: <BookImage size={24} />,
    };
  }
  if (kind === "missions") {
    return {
      title: "미션 인증",
      description: "미션 인증 화면 골격이다.",
      body: "진행중, 승인 대기, 완료 탭과 동의율은 이후 미션 인증 기능 이슈에서 구현한다.",
      icon: <BadgeCheck size={24} />,
    };
  }
  return {
    title: "편지",
    description: "편지 화면 골격이다.",
    body: "받은 편지함, 보낸 편지함, 편지 쓰기는 이후 편지 기능 이슈에서 구현한다.",
    icon: <MailPlus size={24} />,
  };
}

function demoChatMessages(roomId: number): ChatMessage[] {
  const room = demoRooms.find((candidate) => candidate.id === roomId) ?? demoRooms[0];
  const baseDate = todayDateKey();
  const yesterday = offsetDateKey(-1);

  return [
    {
      id: 8001,
      roomId: room.id,
      senderMemberId: room.id === 1 ? 2 : 3,
      senderName: room.id === 1 ? "민지" : room.id === 2 ? "아버지" : "지훈",
      senderType: "MEMBER",
      body: `${room.name}에 오늘 기록 남겨둘게.`,
      sentAt: `${yesterday}T20:10:00+09:00`,
      occurredDate: yesterday,
      mine: false,
    },
    {
      id: 8002,
      roomId: room.id,
      senderMemberId: 1,
      senderName: "류성열",
      senderType: "MEMBER",
      body: "좋아. 나중에 책에 담을 수 있게 대화도 잘 남겨보자.",
      sentAt: `${yesterday}T20:12:00+09:00`,
      occurredDate: yesterday,
      mine: true,
    },
    {
      id: 8003,
      roomId: room.id,
      senderMemberId: room.id === 1 ? 2 : 3,
      senderName: room.id === 1 ? "민지" : room.id === 2 ? "아버지" : "지훈",
      senderType: "MEMBER",
      body: "이 대화는 날짜별 기록으로 남겨두면 다시 돌아보기 좋겠다.",
      sentAt: `${baseDate}T09:05:00+09:00`,
      occurredDate: baseDate,
      mine: false,
    },
  ];
}

function searchDemoChatMessages(roomId: number, keyword: string): ChatSearchResult[] {
  return demoChatMessages(roomId)
    .filter((message) => message.body.toLowerCase().includes(keyword.toLowerCase()))
    .map((message) => ({
      messageId: message.id,
      senderName: message.senderName,
      body: message.body,
      sentAt: message.sentAt,
      occurredDate: message.occurredDate,
    }));
}

function groupChatMessagesByDate(messages: ChatMessage[]): Array<{ date: string; messages: ChatMessage[] }> {
  const groups = new Map<string, ChatMessage[]>();

  messages.forEach((message) => {
    const date = message.occurredDate;
    groups.set(date, [...(groups.get(date) ?? []), message]);
  });

  return Array.from(groups.entries()).map(([date, groupedMessages]) => ({
    date,
    messages: groupedMessages,
  }));
}

function formatChatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
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

function todayDateKey(): string {
  return offsetDateKey(0);
}

function monthDateKey(day: number): string {
  return `${currentMonth}-${`${day}`.padStart(2, "0")}`;
}

function offsetDateKey(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);

  return toDateKey(date);
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildCalendarCells(month: string): Array<{ date: string | null; dayNumber: number | null }> {
  const [year, monthIndex] = month.split("-").map(Number);
  const firstDate = new Date(year, monthIndex - 1, 1);
  const lastDate = new Date(year, monthIndex, 0);
  const cells: Array<{ date: string | null; dayNumber: number | null }> = [];

  for (let index = 0; index < firstDate.getDay(); index += 1) {
    cells.push({ date: null, dayNumber: null });
  }

  for (let day = 1; day <= lastDate.getDate(); day += 1) {
    cells.push({ date: toDateKey(new Date(year, monthIndex - 1, day)), dayNumber: day });
  }

  return cells;
}

function formatMonthLabel(month: string): string {
  const [year, monthValue] = month.split("-");

  return `${year}년 ${Number(monthValue)}월`;
}

function formatDateLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00`);
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${weekdays[date.getDay()]}요일`;
}

function activitySummaryText(activity: Pick<CalendarDayActivity, "chatCount" | "memoryCount" | "missionCount" | "letterCount">): string {
  const parts = [
    activity.chatCount > 0 ? `채팅 ${activity.chatCount}개` : null,
    activity.missionCount > 0 ? `미션 ${activity.missionCount}개` : null,
    activity.memoryCount > 0 ? `추억 ${activity.memoryCount}개` : null,
    activity.letterCount > 0 ? `편지 ${activity.letterCount}개` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : "기록 없음";
}

function calendarTarget(day: CalendarDayActivity, roomId?: number): { roomId: number; view: RoomFeatureKind } | null {
  const room = roomId
    ? day.rooms.find((candidate) => candidate.roomId === roomId && candidate.totalCount > 0)
    : day.rooms.find((candidate) => candidate.totalCount > 0);

  if (!room) {
    return null;
  }

  if (room.chatCount > 0) return { roomId: room.roomId, view: "chat" };
  if (room.memoryCount > 0) return { roomId: room.roomId, view: "memories" };
  if (room.missionCount > 0) return { roomId: room.roomId, view: "missions" };
  if (room.letterCount > 0) return { roomId: room.roomId, view: "letters" };

  return null;
}

function filterDemoCalendar(roomId: number | null): CalendarResponse {
  if (!roomId) {
    return demoCalendar;
  }

  const days = demoCalendar.days
    .map((day) => {
      const rooms = day.rooms.filter((room) => room.roomId === roomId);
      const chatCount = sumCalendarRooms(rooms, "chatCount");
      const memoryCount = sumCalendarRooms(rooms, "memoryCount");
      const missionCount = sumCalendarRooms(rooms, "missionCount");
      const letterCount = sumCalendarRooms(rooms, "letterCount");

      return {
        ...day,
        rooms,
        chatCount,
        memoryCount,
        missionCount,
        letterCount,
        totalCount: chatCount + memoryCount + missionCount + letterCount,
      };
    })
    .filter((day) => day.totalCount > 0);

  return {
    month: demoCalendar.month,
    selectedDate: days[0]?.date ?? null,
    days,
  };
}

function sumCalendarRooms(rooms: CalendarRoomActivity[], key: "chatCount" | "memoryCount" | "missionCount" | "letterCount"): number {
  return rooms.reduce((sum, room) => sum + room[key], 0);
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
