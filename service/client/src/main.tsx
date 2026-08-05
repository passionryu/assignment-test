import { StrictMode, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { createRoot } from "react-dom/client";
import {
  BadgeCheck,
  Bell,
  BookImage,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  CircleHelp,
  Download,
  FileText,
  Home,
  Image as ImageIcon,
  List,
  LogOut,
  Mail,
  MailPlus,
  MessageCircle,
  Minus,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldAlert,
  Trash2,
  UploadCloud,
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

type ProfileForm = {
  displayName: string;
  profileImageUrl: string;
};

type DemoMemberOption = MemberProfile & {
  roleDescription: string;
  roomHint: string;
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
  unreadMemoryCount: number;
  unreadLetterCount: number;
  pendingMissionCount: number;
};

type RoomDetail = {
  id: number;
  name: string;
  description: string | null;
  type: RoomSummary["type"];
  role: RoomSummary["role"];
  memberCount: number;
  canManage: boolean;
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

type DeleteRoomResponse = {
  id: number;
  deleted: boolean;
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

type InviteeSearchResult = {
  id: number;
  displayName: string;
  username: string;
  maskedEmail: string;
  maskedPhoneNumber: string;
  profileImageUrl: string | null;
};

type InviteeSearchResponse = {
  keyword: string;
  results: InviteeSearchResult[];
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

type MemoryPostSummary = {
  id: number;
  roomId: number;
  authorMemberId: number;
  authorName: string;
  title: string;
  bodyPreview: string;
  representativeImageUrl: string | null;
  imageCount: number;
  commentCount: number;
  occurredDate: string;
  createdAt: string;
  mine: boolean;
};

type MemoryComment = {
  id: number;
  memoryPostId: number;
  authorMemberId: number;
  authorName: string;
  body: string;
  createdAt: string;
  mine: boolean;
};

type MemoryPostDetail = {
  id: number;
  roomId: number;
  authorMemberId: number;
  authorName: string;
  title: string;
  body: string;
  representativeImageUrl: string | null;
  imageCount: number;
  commentCount: number;
  occurredDate: string;
  createdAt: string;
  mine: boolean;
  comments: MemoryComment[];
};

type MemoryPostsResponse = {
  roomId: number;
  roomName: string;
  posts: MemoryPostSummary[];
};

type MemoryPostForm = {
  title: string;
  body: string;
  representativeImageUrl: string;
  representativeImageName: string;
  occurredDate: string;
};

type MemoryImageUploadResponse = {
  imageUrl: string;
  originalFileName: string;
  size: number;
};

type DeleteMemoryPostResponse = {
  id: number;
  deleted: boolean;
};

type LetterBox = "RECEIVED" | "SENT";

type LetterRecipient = {
  memberId: number;
  displayName: string;
};

type LetterSummary = {
  id: number;
  roomId: number;
  box: LetterBox;
  title: string;
  bodyPreview: string;
  counterpartMemberId: number;
  counterpartName: string;
  sentAt: string;
  occurredDate: string;
  read: boolean;
};

type LetterDetail = {
  id: number;
  roomId: number;
  title: string;
  body: string;
  senderMemberId: number;
  senderName: string;
  receiverMemberId: number;
  receiverName: string;
  sentAt: string;
  occurredDate: string;
  readAt: string | null;
  read: boolean;
  mine: boolean;
};

type LettersResponse = {
  roomId: number;
  roomName: string;
  box: LetterBox;
  recipients: LetterRecipient[];
  items: LetterSummary[];
  page: number;
  size: number;
  hasMore: boolean;
  totalCount: number;
};

type LetterForm = {
  receiverMemberId: string;
  title: string;
  body: string;
};

type SendLetterResponse = {
  letter: LetterDetail;
};

type MissionStatus = "IN_PROGRESS" | "WAITING_APPROVAL" | "COMPLETED";

type MissionSubmission = {
  id: number;
  missionId: number;
  submitterMemberId: number;
  submitterName: string;
  body: string;
  imageUrl: string;
  occurredDate: string;
  submittedAt: string;
  mine: boolean;
  approvedCount: number;
  totalMemberCount: number;
  requiredApprovalCount: number;
  approvalRate: number;
  myDecision: string | null;
  canApprove: boolean;
  completed: boolean;
};

type MissionComment = {
  id: number;
  missionId: number;
  authorMemberId: number;
  authorName: string;
  body: string;
  createdAt: string;
  mine: boolean;
};

type MissionSummary = {
  id: number;
  roomId: number;
  title: string;
  description: string;
  status: MissionStatus;
  createdByMemberId: number;
  createdByName: string;
  custom: boolean;
  completedAt: string | null;
  latestSubmission: MissionSubmission | null;
  comments: MissionComment[];
};

type MissionListResponse = {
  roomId: number;
  roomName: string;
  roomType: RoomSummary["type"];
  completionRule: string;
  missions: MissionSummary[];
};

type MissionForm = {
  title: string;
  description: string;
};

type MissionSubmissionForm = {
  missionId: number | null;
  body: string;
  imageUrl: string;
  imageName: string;
  occurredDate: string;
};

type MissionImageUploadResponse = {
  imageUrl: string;
  originalFileName: string;
  size: number;
};

type BookCreationType = "TEMPLATE";
type BookContentType = "MEMORY" | "MISSION" | "LETTER" | "CHAT";
type BookContentFilter = "ALL" | "SELECTED" | "UNSELECTED" | BookContentType;
type BookContentOrderMode = "DATE" | "TYPE";
type BookPageLimitStatus = "UNDER_MIN" | "AVAILABLE" | "OVER_MAX";

type BookProduct = {
  uid: string;
  displayName: string;
  sizeName: string;
  widthMm: number;
  heightMm: number;
  coverType: string;
  bindingType: string;
  paperDescription: string;
  minPage: number;
  maxPage: number;
  basePrice: number;
  includedPageCount: number;
  additionalPagePrice: number;
  shippingPrice: number;
  creationType: BookCreationType;
  note: string;
};

type BookProductsResponse = {
  products: BookProduct[];
};

type BookCreateRoom = {
  id: number;
  name: string;
  type: RoomSummary["type"];
  memberCount: number;
  bookableRecordCount: number;
};

type BookCreateRoomsResponse = {
  rooms: BookCreateRoom[];
};

type BookPeriod = {
  startDate: string;
  endDate: string;
};

type BookContentCandidate = {
  type: BookContentType;
  sourceId: number;
  title: string;
  description: string;
  occurredDate: string;
  authorName: string;
  imageCount: number;
  commentCount: number;
  pageCount: number;
  selectedByDefault: boolean;
  sourceLabel: string;
};

type BookContentDetailModalState = {
  content: BookContentCandidate;
  loading: boolean;
  memoryDetail?: MemoryPostDetail;
  missionDetail?: MissionSummary;
  letterDetail?: LetterDetail;
  chatMessages?: ChatMessage[];
};

type BookContentSummary = {
  memoryCount: number;
  missionCount: number;
  letterCount: number;
  chatCount: number;
  estimatedPageCount: number;
};

type BookPageRange = {
  minPage: number;
  maxPage: number;
  estimatedPageCount: number;
  status: BookPageLimitStatus;
  message: string;
};

type BookContentCandidatesResponse = {
  roomId: number;
  roomName: string;
  product: BookProduct;
  period: BookPeriod;
  defaultContents: BookContentCandidate[];
  additionalContents: BookContentCandidate[];
  summary: BookContentSummary;
  pageRange: BookPageRange;
};

type BookEstimate = {
  basePrice: number;
  includedPageCount: number;
  additionalPageCount: number;
  additionalPagePrice: number;
  shippingPrice: number;
  quantity: number;
  subtotalPrice: number;
  totalPrice: number;
};

type BookPreviewPage = {
  pageNumber: number;
  label: string;
  title: string;
  description: string;
  contentType: BookContentType | null;
  occurredDate: string | null;
};

type BookPreviewResponse = {
  previewId: number;
  creationType: BookCreationType;
  roomId: number;
  roomName: string;
  product: BookProduct;
  title: string;
  period: BookPeriod;
  contents: BookContentCandidate[];
  summary: BookContentSummary;
  pageRange: BookPageRange;
  estimate: BookEstimate;
  pages: BookPreviewPage[];
  warnings: string[];
};

const defaultBookContentTypeOrder: BookContentType[] = ["MEMORY", "MISSION", "LETTER", "CHAT"];
const bookCandidateContentTypeOptions: BookContentType[] = ["MEMORY", "MISSION", "LETTER", "CHAT"];
const bookContentStatusFilters: BookContentFilter[] = ["ALL", "SELECTED", "UNSELECTED"];
const bookContentTypeFilters: BookContentFilter[] = ["MEMORY", "MISSION", "LETTER", "CHAT"];

type PrintOrderStatus =
  | "PAID"
  | "PDF_READY"
  | "CONFIRMED"
  | "IN_PRODUCTION"
  | "PRODUCTION_COMPLETE"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED_REFUND"
  | "ERROR";

type PrintOrderSummary = {
  id: number;
  orderNo: string;
  memberId: number;
  memberName: string;
  roomId: number;
  roomName: string;
  product: BookProduct;
  title: string;
  quantity: number;
  estimatedPageCount: number;
  totalPrice: number;
  status: PrintOrderStatus;
  statusLabel: string;
  requestedAt: string;
  updatedAt: string;
};

type PrintOrdersResponse = {
  orders: PrintOrderSummary[];
};

type PrintOrderContentSnapshot = {
  type: BookContentType;
  sourceId: number;
  title: string;
  occurredDate: string;
  pageCount: number;
  sortOrder: number;
  snapshot: BookContentCandidate | null;
};

type PrintOrderStatusHistory = {
  id: number;
  previousStatus: PrintOrderStatus | null;
  nextStatus: PrintOrderStatus;
  nextStatusLabel: string;
  memo: string | null;
  changedAt: string;
};

type PrintOrderDetail = PrintOrderSummary & {
  creationType: BookCreationType;
  period: BookPeriod;
  basePrice: number;
  additionalPagePrice: number;
  shippingPrice: number;
  cancelledAt: string | null;
  cancelReason: string | null;
  contents: PrintOrderContentSnapshot[];
  statusHistories: PrintOrderStatusHistory[];
};

type CreatePrintOrderResponse = {
  order: PrintOrderDetail;
};

type PrintOrderActionResponse = {
  order: PrintOrderDetail;
};

type OrderSortKey = "REQUESTED_DESC" | "REQUESTED_ASC" | "UPDATED_DESC" | "PRICE_DESC" | "PRICE_ASC";

type OrderTableFilters = {
  startDate: string;
  endDate: string;
  query: string;
  status: PrintOrderStatus | "ALL";
  sort: OrderSortKey;
  limit: number;
  onlyCancelable: boolean;
};

type OrderActionFilter = {
  label: string;
  predicate: (order: PrintOrderSummary) => boolean;
};

type ApiError = {
  code: string;
  message: string;
  requestId: string;
};

type RoomFeatureKind = "chat" | "memories" | "missions" | "letters";
type BookArchiveView = "bookProducts" | "bookCreate" | "bookStatus" | "bookHistory";
type BookCreateStep = "room" | "product" | "period" | "content" | "preview";
type AppView = "home" | "rooms" | "room" | "settings" | RoomFeatureKind | BookArchiveView;
type RoomSettingsMode = "menu" | "info" | "edit" | "delete" | null;
type MemoryActionMode = "edit" | "delete" | null;

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";
const apiOrigin = apiBaseUrl.replace(/\/api\/?$/, "");
const selectedMemberStorageKey = "record-room:selected-member-id";
const operatorDemoMemberId = 100;
const currentMonth = toDateKey(new Date()).slice(0, 7);
const memoryPostsPerPage = 6;
const letterPageSize = 10;
const profileImageMaxBytes = 5 * 1024 * 1024;
const profileImageAllowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const demoMemberOptions: DemoMemberOption[] = [
  {
    id: 1,
    displayName: "류성열",
    username: "recordryu",
    email: "ryu@example.com",
    phoneNumber: "010-1234-5678",
    profileImageUrl: null,
    roleDescription: "커플/가족/프로젝트방 방장",
    roomHint: "우리 둘의 100일, 7월 가족, 여름 프로젝트반",
  },
  {
    id: 2,
    displayName: "여자친구",
    username: "girlfriend",
    email: "girlfriend@example.com",
    phoneNumber: "010-2222-3333",
    profileImageUrl: null,
    roleDescription: "커플방 구성원",
    roomHint: "우리 둘의 100일, 여자친구의 여행 준비방",
  },
  {
    id: 3,
    displayName: "아버지",
    username: "father",
    email: "father@example.com",
    phoneNumber: "010-3333-4444",
    profileImageUrl: null,
    roleDescription: "가족방 구성원",
    roomHint: "7월 가족, 가족 여행 사진방",
  },
  {
    id: 4,
    displayName: "지훈",
    username: "jihun",
    email: "jihun@example.com",
    phoneNumber: "010-4444-5555",
    profileImageUrl: null,
    roleDescription: "프로젝트방 구성원",
    roomHint: "여름 프로젝트반, 4학년 1반",
  },
  {
    id: operatorDemoMemberId,
    displayName: "운영자",
    username: "operator",
    email: "operator@example.com",
    phoneNumber: "010-0000-0100",
    profileImageUrl: null,
    roleDescription: "책 주문 확인 담당자",
    roomHint: "전체 주문 조회, 상태 변경, 취소 처리",
  },
];

const defaultDemoMember = demoMemberOptions[0];

function readStoredDemoMember(): DemoMemberOption | null {
  if (typeof window === "undefined") return null;

  const rawMemberId = window.localStorage.getItem(selectedMemberStorageKey);
  const memberId = rawMemberId ? Number(rawMemberId) : NaN;

  return demoMemberOptions.find((member) => member.id === memberId) ?? null;
}

function isOperatorDemoMember(member: DemoMemberOption | null): boolean {
  return member?.id === operatorDemoMemberId;
}

function buildMemberHeader(): Record<string, string> {
  const selectedMember = readStoredDemoMember() ?? defaultDemoMember;

  return { "X-Member-Id": String(selectedMember.id) };
}

function demoProfileForMember(memberId: number): MemberProfile {
  const selectedMember = demoMemberOptions.find((member) => member.id === memberId) ?? defaultDemoMember;

  return {
    id: selectedMember.id,
    displayName: selectedMember.displayName,
    username: selectedMember.username,
    email: selectedMember.email,
    phoneNumber: selectedMember.phoneNumber,
    profileImageUrl: selectedMember.profileImageUrl,
  };
}

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
    unreadMemoryCount: 1,
    unreadLetterCount: 1,
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
    unreadMemoryCount: 1,
    unreadLetterCount: 0,
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
    unreadMemoryCount: 0,
    unreadLetterCount: 1,
    pendingMissionCount: 0,
  },
];

function demoRoomsForMember(memberId: number): RoomSummary[] {
  if (memberId === 2) {
    return [
      { ...demoRooms[0], role: "MEMBER", unreadChatCount: 0, unreadMemoryCount: 1, unreadLetterCount: 0, pendingMissionCount: 1 },
      {
        id: 4,
        name: "여자친구의 여행 준비방",
        description: "여행 준비 과정을 같이 모으는 방",
        type: "GROUP",
        role: "OWNER",
        memberCount: 1,
        unreadChatCount: 0,
        unreadMemoryCount: 0,
        unreadLetterCount: 0,
        pendingMissionCount: 0,
      },
    ];
  }

  if (memberId === 3) {
    return [
      { ...demoRooms[1], role: "MEMBER", memberCount: 7 },
      {
        id: 40,
        name: "가족 여행 사진방",
        description: "가족 여행 사진을 함께 모으는 방",
        type: "FAMILY",
        role: "OWNER",
        memberCount: 1,
        unreadChatCount: 0,
        unreadMemoryCount: 0,
        unreadLetterCount: 0,
        pendingMissionCount: 0,
      },
    ];
  }

  if (memberId === 4) {
    return [
      { ...demoRooms[2], role: "MEMBER", memberCount: 6 },
      {
        id: 41,
        name: "4학년 1반",
        description: "반 기록을 함께 모으는 학급방",
        type: "GROUP",
        role: "OWNER",
        memberCount: 1,
        unreadChatCount: 0,
        unreadMemoryCount: 0,
        unreadLetterCount: 0,
        pendingMissionCount: 0,
      },
    ];
  }

  return demoRooms;
}

const demoPendingInvitations: PendingRoomInvitation[] = [
  {
    id: 1,
    roomId: 4,
    roomName: "여자친구의 여행 준비방",
    roomType: "GROUP",
    inviterName: "여자친구",
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

function demoPendingInvitationsForMember(memberId: number): PendingRoomInvitation[] {
  return memberId === 1 ? demoPendingInvitations : [];
}

const demoNotifications: NotificationItem[] = [
  {
    id: 9001,
    type: "MISSION_APPROVAL_REQUEST",
    roomId: 1,
    roomName: "우리 둘의 100일",
    actorName: "여자친구",
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
    actorName: "여자친구",
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
    const actorNames = ["여자친구", "아버지", "지훈"];
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

function demoNotificationsForMember(memberId: number): NotificationItem[] {
  if (memberId === 2) {
    return [
      {
        id: 9201,
        type: "CHAT",
        roomId: 1,
        roomName: "우리 둘의 100일",
        actorName: "류성열",
        summary: "새 채팅을 보냈습니다.",
        occurredAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        read: false,
        target: { type: "CHAT", id: 233, url: "/rooms/1/chat?targetId=233" },
      },
      {
        id: 9202,
        type: "LETTER",
        roomId: 1,
        roomName: "우리 둘의 100일",
        actorName: "류성열",
        summary: "보낸 편지가 도착했습니다.",
        occurredAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        read: true,
        target: { type: "LETTER", id: 440, url: "/rooms/1/letters?targetId=440" },
      },
    ];
  }

  if (memberId === 3) {
    return [
      {
        id: 9301,
        type: "MEMORY",
        roomId: 2,
        roomName: "7월 가족",
        actorName: "류성열",
        summary: "가족 여행 사진을 올렸습니다.",
        occurredAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        read: false,
        target: { type: "MEMORY", id: 301, url: "/rooms/2/memories?targetId=301" },
      },
    ];
  }

  if (memberId === 4) {
    return [
      {
        id: 9401,
        type: "MISSION_APPROVAL_REQUEST",
        roomId: 3,
        roomName: "여름 프로젝트반",
        actorName: "류성열",
        summary: "미션 인증 동의를 기다립니다.",
        occurredAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
        read: false,
        target: { type: "MISSION", id: 105, url: "/rooms/3/missions?targetId=105" },
      },
    ];
  }

  return demoNotifications;
}

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

function roomSummaryToDetail(room: RoomSummary): RoomDetail {
  return {
    id: room.id,
    name: room.name,
    description: room.description,
    type: room.type,
    role: room.role,
    memberCount: room.memberCount,
    canManage: room.role === "OWNER",
  };
}

function mergeRoomSummary(room: RoomSummary, detail: RoomDetail): RoomSummary {
  return {
    ...room,
    name: detail.name,
    description: detail.description,
    type: detail.type,
    role: detail.role,
    memberCount: detail.memberCount,
  };
}

function App() {
  const [selectedDemoMember, setSelectedDemoMember] = useState<DemoMemberOption | null>(() => readStoredDemoMember());
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
  const [roomListExpanded, setRoomListExpanded] = useState(true);
  const [bookMenuExpanded, setBookMenuExpanded] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<AppView>("home");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatDraft, setChatDraft] = useState("");
  const [chatSearchKeyword, setChatSearchKeyword] = useState("");
  const [chatSearchResults, setChatSearchResults] = useState<ChatSearchResult[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const chatSendingRef = useRef(false);
  const [memoryPosts, setMemoryPosts] = useState<MemoryPostSummary[]>([]);
  const [selectedMemoryPost, setSelectedMemoryPost] = useState<MemoryPostDetail | null>(null);
  const [memoryPostForm, setMemoryPostForm] = useState<MemoryPostForm>(() => initialMemoryPostForm());
  const [memoryEditForm, setMemoryEditForm] = useState<MemoryPostForm>(() => initialMemoryPostForm());
  const [memoryCommentDraft, setMemoryCommentDraft] = useState("");
  const [memoryLoading, setMemoryLoading] = useState(false);
  const [memoryDetailLoading, setMemoryDetailLoading] = useState(false);
  const [memoryCreating, setMemoryCreating] = useState(false);
  const [memoryImageUploading, setMemoryImageUploading] = useState(false);
  const [memoryEditImageUploading, setMemoryEditImageUploading] = useState(false);
  const [memoryCommentSending, setMemoryCommentSending] = useState(false);
  const [memoryActionMode, setMemoryActionMode] = useState<MemoryActionMode>(null);
  const [memoryActionLoading, setMemoryActionLoading] = useState(false);
  const [letterBox, setLetterBox] = useState<LetterBox>("RECEIVED");
  const [letterRecipients, setLetterRecipients] = useState<LetterRecipient[]>([]);
  const [letters, setLetters] = useState<LetterSummary[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<LetterDetail | null>(null);
  const [letterForm, setLetterForm] = useState<LetterForm>(() => initialLetterForm());
  const [letterLoading, setLetterLoading] = useState(false);
  const [letterDetailLoading, setLetterDetailLoading] = useState(false);
  const [letterLoadingMore, setLetterLoadingMore] = useState(false);
  const [letterHasMore, setLetterHasMore] = useState(false);
  const [letterTotalCount, setLetterTotalCount] = useState(0);
  const [letterSending, setLetterSending] = useState(false);
  const [letterFocusId, setLetterFocusId] = useState<number | null>(null);
  const [letterComposeOpen, setLetterComposeOpen] = useState(false);
  const [missionList, setMissionList] = useState<MissionListResponse | null>(null);
  const [missionForm, setMissionForm] = useState<MissionForm>(() => initialMissionForm());
  const [missionSubmissionForm, setMissionSubmissionForm] = useState<MissionSubmissionForm>(() => initialMissionSubmissionForm());
  const [missionLoading, setMissionLoading] = useState(false);
  const [missionCreating, setMissionCreating] = useState(false);
  const [missionSubmitting, setMissionSubmitting] = useState(false);
  const [missionImageUploading, setMissionImageUploading] = useState(false);
  const [missionApproving, setMissionApproving] = useState<number | null>(null);
  const [missionCreateOpen, setMissionCreateOpen] = useState(false);
  const [missionCommentDraft, setMissionCommentDraft] = useState("");
  const [missionCommentSending, setMissionCommentSending] = useState(false);
  const [bookProducts, setBookProducts] = useState<BookProduct[]>(() => demoBookProducts());
  const [bookRooms, setBookRooms] = useState<BookCreateRoom[]>([]);
  const [bookSelectedRoomId, setBookSelectedRoomId] = useState<number | null>(null);
  const [bookSelectedProductUid, setBookSelectedProductUid] = useState<string | null>(null);
  const [bookCreateStep, setBookCreateStep] = useState<BookCreateStep>("room");
  const [bookPeriod, setBookPeriod] = useState<BookPeriod>(() => ({ startDate: offsetDateKey(-30), endDate: todayDateKey() }));
  const [bookCandidateContentTypes, setBookCandidateContentTypes] = useState<BookContentType[]>([]);
  const [bookTitle, setBookTitle] = useState("");
  const [bookQuantity, setBookQuantity] = useState(1);
  const [bookContentCandidates, setBookContentCandidates] = useState<BookContentCandidatesResponse | null>(null);
  const [selectedBookContentKeys, setSelectedBookContentKeys] = useState<Record<string, boolean>>({});
  const [bookContentFilter, setBookContentFilter] = useState<BookContentFilter>("ALL");
  const [bookContentOrderMode, setBookContentOrderMode] = useState<BookContentOrderMode>("DATE");
  const [bookContentTypeOrder, setBookContentTypeOrder] = useState<BookContentType[]>(defaultBookContentTypeOrder);
  const [bookContentDetailModal, setBookContentDetailModal] = useState<BookContentDetailModalState | null>(null);
  const [bookProductsLoading, setBookProductsLoading] = useState(false);
  const [bookCandidatesLoading, setBookCandidatesLoading] = useState(false);
  const [bookPreviewLoading, setBookPreviewLoading] = useState(false);
  const [bookPreview, setBookPreview] = useState<BookPreviewResponse | null>(null);
  const [bookOrderConfirmOpen, setBookOrderConfirmOpen] = useState(false);
  const [bookStatusOrders, setBookStatusOrders] = useState<PrintOrderSummary[]>([]);
  const [bookHistoryOrders, setBookHistoryOrders] = useState<PrintOrderSummary[]>([]);
  const [selectedBookOrder, setSelectedBookOrder] = useState<PrintOrderDetail | null>(null);
  const [bookOrdersLoading, setBookOrdersLoading] = useState(false);
  const [bookOrderDetailLoading, setBookOrderDetailLoading] = useState(false);
  const [bookOrderCreating, setBookOrderCreating] = useState(false);
  const [bookOrderCancelOpen, setBookOrderCancelOpen] = useState(false);
  const [bookOrderActionLoading, setBookOrderActionLoading] = useState(false);
  const [operatorOrders, setOperatorOrders] = useState<PrintOrderSummary[]>([]);
  const [operatorSelectedOrder, setOperatorSelectedOrder] = useState<PrintOrderDetail | null>(null);
  const [operatorStatusFilter, setOperatorStatusFilter] = useState<PrintOrderStatus | "ALL">("ALL");
  const [operatorOrdersLoading, setOperatorOrdersLoading] = useState(false);
  const [operatorOrderDetailLoading, setOperatorOrderDetailLoading] = useState(false);
  const [operatorOrderActionLoading, setOperatorOrderActionLoading] = useState(false);
  const [operatorCancelOrderOpen, setOperatorCancelOrderOpen] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileForm>({ displayName: "", profileImageUrl: "" });
  const [createRoomForm, setCreateRoomForm] = useState<CreateRoomForm>({ name: "", type: "COUPLE", description: "" });
  const [inviteContacts, setInviteContacts] = useState<Record<number, string>>({});
  const [inviteSearchingRoomId, setInviteSearchingRoomId] = useState<number | null>(null);
  const [invitingMemberId, setInvitingMemberId] = useState<number | null>(null);
  const [inviteCandidateModal, setInviteCandidateModal] = useState<{
    roomId: number;
    roomName: string;
    keyword: string;
    candidates: InviteeSearchResult[];
  } | null>(null);
  const [roomSettingsMode, setRoomSettingsMode] = useState<RoomSettingsMode>(null);
  const [roomDetail, setRoomDetail] = useState<RoomDetail | null>(null);
  const [roomEditForm, setRoomEditForm] = useState({ name: "", description: "" });
  const [roomActionLoading, setRoomActionLoading] = useState(false);
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
  const bookSelectedRoom = useMemo(
    () => bookRooms.find((room) => room.id === bookSelectedRoomId) ?? null,
    [bookRooms, bookSelectedRoomId],
  );
  const bookSelectedProduct = useMemo(
    () => bookProducts.find((product) => product.uid === bookSelectedProductUid) ?? null,
    [bookProducts, bookSelectedProductUid],
  );
  const allBookContentCandidates = useMemo(
    () => [
      ...(bookContentCandidates?.defaultContents ?? []),
      ...(bookContentCandidates?.additionalContents ?? []),
    ],
    [bookContentCandidates],
  );
  const orderedBookContentCandidates = useMemo(
    () => sortBookContents(allBookContentCandidates, bookContentOrderMode, bookContentTypeOrder),
    [allBookContentCandidates, bookContentOrderMode, bookContentTypeOrder],
  );
  const selectedBookContents = useMemo(
    () => orderedBookContentCandidates.filter((content) => selectedBookContentKeys[bookContentKey(content)]),
    [orderedBookContentCandidates, selectedBookContentKeys],
  );
  const bookDraftPageRange = useMemo(
    () => buildBookPageRange(bookSelectedProduct, selectedBookContents),
    [bookSelectedProduct, selectedBookContents],
  );
  const bookDraftSummary = useMemo(
    () => buildBookContentSummary(selectedBookContents, bookDraftPageRange?.estimatedPageCount ?? 0),
    [selectedBookContents, bookDraftPageRange],
  );

  useEffect(() => {
    if (!selectedDemoMember || isOperatorDemoMember(selectedDemoMember)) return;

    void loadInitialData();
  }, [selectedDemoMember?.id]);

  useEffect(() => {
    if (!selectedDemoMember || isOperatorDemoMember(selectedDemoMember)) return;

    const pollingTimerId = window.setInterval(() => {
      void refreshSidebarState();
    }, 5000);

    return () => window.clearInterval(pollingTimerId);
  }, [selectedDemoMember?.id]);

  useEffect(() => {
    if ((activeView !== "chat" && activeView !== "room") || !selectedRoom || !selectedDemoMember) return;

    void loadChatMessages(selectedRoom.id);
    const pollingTimerId = window.setInterval(() => {
      void loadChatMessages(selectedRoom.id, { silent: true });
    }, 3000);

    return () => window.clearInterval(pollingTimerId);
  }, [activeView, selectedRoom?.id, selectedDemoMember?.id]);

  useEffect(() => {
    if (activeView !== "memories" || !selectedRoom) return;

    void readRoomFeatureNotifications(selectedRoom.id, "memories");
    void loadMemoryPosts(selectedRoom.id);
  }, [activeView, selectedRoom?.id]);

  useEffect(() => {
    if (activeView !== "missions" || !selectedRoom) return;

    void readRoomFeatureNotifications(selectedRoom.id, "missions");
    void loadMissions(selectedRoom.id);
  }, [activeView, selectedRoom?.id]);

  useEffect(() => {
    if (activeView !== "letters" || !selectedRoom) return;

    void readRoomFeatureNotifications(selectedRoom.id, "letters");
    void loadLetters(selectedRoom.id, letterBox, { focusId: letterFocusId });
  }, [activeView, selectedRoom?.id, letterBox, letterFocusId]);

  useEffect(() => {
    if (activeView !== "bookProducts" || !selectedDemoMember) return;

    void loadBookProducts();
  }, [activeView, selectedDemoMember?.id]);

  useEffect(() => {
    if (activeView !== "bookCreate" || !selectedDemoMember) return;

    void prepareBookCreate();
  }, [activeView, selectedDemoMember?.id]);

  useEffect(() => {
    if (activeView !== "bookStatus" || !selectedDemoMember) return;

    void loadBookOrders("status");
  }, [activeView, selectedDemoMember?.id]);

  useEffect(() => {
    if (activeView !== "bookHistory" || !selectedDemoMember) return;

    void loadBookOrders("history");
  }, [activeView, selectedDemoMember?.id]);

  useEffect(() => {
    if (!selectedDemoMember || !isOperatorDemoMember(selectedDemoMember)) return;

    void loadOperatorOrders(operatorStatusFilter);
  }, [selectedDemoMember?.id, operatorStatusFilter]);

  function resetSessionState() {
    setProfile(null);
    setSettings(null);
    setRooms([]);
    setLatestNotifications([]);
    setAllNotifications([]);
    setPendingInvitations([]);
    setCalendar(null);
    setSelectedCalendarDate(null);
    setCalendarRoomId(null);
    setPendingInvitationCount(0);
    setSelectedRoomId(null);
    setExpandedRoomId(null);
    setActiveView("home");
    setChatMessages([]);
    setChatDraft("");
    setChatSearchKeyword("");
    setChatSearchResults([]);
    setMemoryPosts([]);
    setSelectedMemoryPost(null);
    setLetters([]);
    setSelectedLetter(null);
    setMissionList(null);
    setLetterBox("RECEIVED");
    setLetterFocusId(null);
    setBookMenuExpanded(false);
    setBookProducts(demoBookProducts());
    setBookRooms([]);
    setBookSelectedRoomId(null);
    setBookSelectedProductUid(null);
    setBookCreateStep("room");
    setBookPeriod({ startDate: offsetDateKey(-30), endDate: todayDateKey() });
    setBookCandidateContentTypes([]);
    setBookTitle("");
    setBookQuantity(1);
    setBookContentCandidates(null);
    setSelectedBookContentKeys({});
    setBookContentFilter("ALL");
    setBookContentOrderMode("DATE");
    setBookContentTypeOrder(defaultBookContentTypeOrder);
    setBookContentDetailModal(null);
    setBookPreview(null);
    setBookOrderConfirmOpen(false);
    setBookStatusOrders([]);
    setBookHistoryOrders([]);
    setSelectedBookOrder(null);
    setBookOrderCancelOpen(false);
    setOperatorOrders([]);
    setOperatorSelectedOrder(null);
    setOperatorStatusFilter("ALL");
    setOperatorCancelOrderOpen(false);
    setProfileForm({ displayName: "", profileImageUrl: "" });
    setMessage(null);
    setErrorMessage(null);
    setRoomSettingsMode(null);
    setRoomDetail(null);
    setRoomFeedbackModal(null);
    setProfileEditOpen(false);
    setNotificationsModalOpen(false);
  }

  function selectDemoMember(member: DemoMemberOption) {
    window.localStorage.setItem(selectedMemberStorageKey, String(member.id));
    resetSessionState();
    setSelectedDemoMember(member);
  }

  function logoutToMemberSelection() {
    window.localStorage.removeItem(selectedMemberStorageKey);
    setLogoutOpen(false);
    resetSessionState();
    setSelectedDemoMember(null);
  }

  async function loadInitialData() {
    setErrorMessage(null);
    const fallbackMemberId = selectedDemoMember?.id ?? defaultDemoMember.id;
    const fallbackProfile = demoProfileForMember(fallbackMemberId);
    const fallbackRooms = demoRoomsForMember(fallbackMemberId);
    const fallbackInvitations = demoPendingInvitationsForMember(fallbackMemberId);
    const fallbackNotifications = demoNotificationsForMember(fallbackMemberId);

    try {
      const [profileResponse, settingsResponse, roomsResponse] = await Promise.all([
        apiGet<MemberProfile>("/members/me"),
        apiGet<NotificationSettings>("/members/me/notification-settings"),
        apiGet<RoomsResponse>("/rooms"),
      ]);
      const visibleRooms = roomsResponse.rooms.length > 0 ? roomsResponse.rooms : fallbackRooms;
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
      setProfile(fallbackProfile);
      setSettings(demoSettings);
      setRooms(fallbackRooms);
      setPendingInvitations(fallbackInvitations);
      setLatestNotifications(fallbackNotifications.filter(isHomeNotification).slice(0, 3));
      setAllNotifications(fallbackNotifications.filter(isHomeNotification));
      setCalendar(demoCalendar);
      setSelectedCalendarDate(demoCalendar.selectedDate ?? demoCalendar.days[0]?.date ?? null);
      setPendingInvitationCount(fallbackInvitations.length);
      setProfileForm({
        displayName: fallbackProfile.displayName,
        profileImageUrl: fallbackProfile.profileImageUrl ?? "",
      });
      setSelectedRoomId((currentSelectedRoomId) => currentSelectedRoomId ?? fallbackRooms[0]?.id ?? null);
    }
  }

  async function loadLatestNotifications() {
    const fallbackNotifications = demoNotificationsForMember(selectedDemoMember?.id ?? defaultDemoMember.id);
    const latestResponse = await safeApiGet<NotificationsResponse>("/notifications/latest");
    const latestItems = latestResponse?.items.filter(isHomeNotification);
    const fallbackItems = fallbackNotifications.filter(isHomeNotification).slice(0, 3);

    setLatestNotifications(latestItems ?? fallbackItems);
  }

  async function loadRooms() {
    const roomsResponse = await apiGet<RoomsResponse>("/rooms");
    const visibleRooms = roomsResponse.rooms.length > 0 ? roomsResponse.rooms : demoRoomsForMember(selectedDemoMember?.id ?? defaultDemoMember.id);
    setRooms(visibleRooms);
    setPendingInvitationCount(roomsResponse.pendingInvitationCount);
    setSelectedRoomId((currentSelectedRoomId) => currentSelectedRoomId ?? visibleRooms[0]?.id ?? null);

    return visibleRooms;
  }

  async function refreshSidebarState() {
    try {
      await loadRooms();
      await loadLatestNotifications();
    } catch {
      // 로컬 서버 재시작 중에는 기존 화면 상태를 유지한다.
    }
  }

  function clearRoomFeatureBadge(roomId: number, feature: RoomFeatureKind) {
    setRooms((currentRooms) =>
      currentRooms.map((room) => {
        if (room.id !== roomId) return room;

        if (feature === "chat") return { ...room, unreadChatCount: 0 };
        if (feature === "memories") return { ...room, unreadMemoryCount: 0 };
        if (feature === "missions") return { ...room, pendingMissionCount: 0 };
        if (feature === "letters") return { ...room, unreadLetterCount: 0 };

        return room;
      }),
    );
  }

  function markRoomFeatureNotificationsAsRead(roomId: number, feature: RoomFeatureKind) {
    const targetTypes = notificationTypesForRoomFeature(feature);
    const markAsRead = (item: NotificationItem) =>
      item.roomId === roomId && targetTypes.includes(item.type) ? { ...item, read: true } : item;

    setLatestNotifications((current) => current.map(markAsRead));
    setAllNotifications((current) => current.map(markAsRead));
  }

  function notificationTypesForRoomFeature(feature: RoomFeatureKind): NotificationType[] {
    if (feature === "chat") return ["CHAT"];
    if (feature === "memories") return ["MEMORY"];
    if (feature === "missions") return ["MISSION_APPROVAL_REQUEST", "MISSION_PROGRESS"];
    if (feature === "letters") return ["LETTER"];

    return [];
  }

  async function readRoomFeatureNotifications(roomId: number, feature: RoomFeatureKind) {
    clearRoomFeatureBadge(roomId, feature);
    markRoomFeatureNotificationsAsRead(roomId, feature);

    try {
      await safeApiRequest<{ read: boolean }>(`/notifications/rooms/${roomId}/features/${feature}/read`, { method: "POST" });
      await refreshSidebarState();
    } catch {
      // 로컬 서버 재시작 중에는 다음 사이드바 폴링 갱신에 맡긴다.
    }
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
    const fallbackNotifications = demoNotificationsForMember(selectedDemoMember?.id ?? defaultDemoMember.id);
    const response = await safeApiGet<NotificationsResponse>("/notifications?page=0&size=20");
    const notificationItems = response?.items.filter(isHomeNotification);
    setAllNotifications(notificationItems ?? fallbackNotifications.filter(isHomeNotification));
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

    if (notification.target.type === "LETTER") {
      setLetterBox("RECEIVED");
      setLetterFocusId(notification.target.id);
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
      setRoomFeedbackModal({ title: "프로필 수정 완료", message: "프로필 정보가 저장되었습니다." });
    } catch (error) {
      setRoomFeedbackModal({ title: "프로필 수정 실패", message: toMessage(error) });
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
    if (isBookArchiveView(view)) {
      setBookMenuExpanded(true);
    }
    setActiveView(view);
  }

  function openRoomListView() {
    setMessage(null);
    setErrorMessage(null);
    setRoomListExpanded(true);
    setActiveView("rooms");
  }

  function toggleRoomList() {
    setRoomListExpanded((current) => !current);
  }

  function toggleBookMenu() {
    setBookMenuExpanded((current) => !current);
  }

  function selectRoom(roomId: number, nextView: AppView = activeView === "rooms" || activeView === "settings" ? "home" : activeView) {
    setSelectedRoomId(roomId);
    setExpandedRoomId((currentExpandedRoomId) => (currentExpandedRoomId === roomId ? null : roomId));
    setRoomListExpanded(true);
    setActiveView(nextView);
  }

  function openRoomHome(roomId: number) {
    setMessage(null);
    setErrorMessage(null);
    setSelectedRoomId(roomId);
    setExpandedRoomId(roomId);
    setRoomListExpanded(true);
    setActiveView("room");
  }

  function moveToRoomFeature(roomId: number, view: RoomFeatureKind) {
    setSelectedRoomId(roomId);
    setExpandedRoomId(roomId);
    setRoomListExpanded(true);
    setActiveView(view);
  }

  async function loadBookProducts() {
    setBookProductsLoading(true);
    const response = await safeApiGet<BookProductsResponse>("/book-archive/products");
    const products = response?.products.length ? response.products : demoBookProducts();
    setBookProducts(products);
    setBookSelectedProductUid((current) => (current && products.some((product) => product.uid === current) ? current : null));
    setBookProductsLoading(false);
  }

  async function prepareBookCreate() {
    setBookProductsLoading(true);
    const fallbackProducts = demoBookProducts();
    const fallbackRooms = demoBookRoomsForCreate(selectedDemoMember?.id ?? defaultDemoMember.id);

    try {
      const [productsResponse, roomsResponse] = await Promise.all([
        apiGet<BookProductsResponse>("/book-archive/products"),
        apiGet<BookCreateRoomsResponse>("/book-archive/rooms"),
      ]);
      const nextProducts = productsResponse.products.length ? productsResponse.products : fallbackProducts;
      const nextRooms = roomsResponse.rooms.length ? roomsResponse.rooms : fallbackRooms;
      setBookProducts(nextProducts);
      setBookRooms(nextRooms);
      setBookSelectedRoomId((current) => (current && nextRooms.some((room) => room.id === current) ? current : null));
      setBookSelectedProductUid((current) => (current && nextProducts.some((product) => product.uid === current) ? current : null));
    } catch {
      setBookProducts(fallbackProducts);
      setBookRooms(fallbackRooms);
      setBookSelectedRoomId((current) => (current && fallbackRooms.some((room) => room.id === current) ? current : null));
      setBookSelectedProductUid((current) => (current && fallbackProducts.some((product) => product.uid === current) ? current : null));
    } finally {
      setBookProductsLoading(false);
    }
  }

  function selectBookRoom(roomId: number) {
    const room = bookRooms.find((candidate) => candidate.id === roomId);
    setBookSelectedRoomId(roomId);
    setBookTitle((current) => current || `${room?.name ?? "선택한 방"} 기록집`);
    setBookCandidateContentTypes([]);
    clearBookComposition();
    setBookCreateStep("product");
  }

  function selectBookProduct(productUid: string) {
    setBookSelectedProductUid(productUid);
    setBookCandidateContentTypes([]);
    clearBookComposition();
    setBookCreateStep("period");
  }

  function updateBookPeriod(nextPeriod: BookPeriod) {
    setBookPeriod(nextPeriod);
    clearBookComposition();
    setBookCreateStep("period");
  }

  function toggleBookCandidateContentType(type: BookContentType) {
    setBookCandidateContentTypes((current) => {
      const selected = current.includes(type)
        ? current.filter((candidate) => candidate !== type)
        : [...current, type];

      return bookCandidateContentTypeOptions.filter((candidate) => selected.includes(candidate));
    });
    clearBookComposition();
    setBookCreateStep("period");
  }

  function clearBookComposition() {
    setBookContentCandidates(null);
    setSelectedBookContentKeys({});
    setBookContentFilter("ALL");
    setBookContentOrderMode("DATE");
    setBookContentTypeOrder(defaultBookContentTypeOrder);
    setBookContentDetailModal(null);
    setBookPreview(null);
  }

  async function loadBookContentCandidates() {
    if (!bookSelectedRoomId) {
      setErrorMessage("책으로 만들 방을 먼저 선택해 주세요.");
      return;
    }

    if (!bookSelectedProductUid) {
      setErrorMessage("상품을 먼저 선택해 주세요.");
      return;
    }

    if (!bookPeriod.startDate || !bookPeriod.endDate || bookPeriod.startDate > bookPeriod.endDate) {
      setErrorMessage("가져올 기록의 기간을 올바르게 선택해 주세요.");
      return;
    }

    if (bookCandidateContentTypes.length === 0) {
      setErrorMessage("불러올 콘텐츠를 1개 이상 선택해 주세요.");
      return;
    }

    setMessage(null);
    setErrorMessage(null);
    setBookCandidatesLoading(true);
    setBookPreview(null);

    const loadingStartedAt = Date.now();
    let nextCandidates: BookContentCandidatesResponse;
    let nextErrorMessage: string | null = null;

    try {
      const contentTypesParam = encodeURIComponent(bookCandidateContentTypes.join(","));
      const response = await apiGet<BookContentCandidatesResponse>(
        `/book-archive/content-candidates?roomId=${bookSelectedRoomId}&productUid=${encodeURIComponent(bookSelectedProductUid)}&startDate=${bookPeriod.startDate}&endDate=${bookPeriod.endDate}&contentTypes=${contentTypesParam}`,
      );
      nextCandidates = filterBookContentCandidatesResponse(response, bookCandidateContentTypes);
    } catch (error) {
      nextCandidates = buildDemoBookContentCandidates(
        bookSelectedRoomId,
        bookSelectedProductUid,
        bookPeriod,
        selectedDemoMember?.id ?? defaultDemoMember.id,
        bookCandidateContentTypes,
      );
      nextErrorMessage = toMessage(error);
    }

    await waitAtLeast(loadingStartedAt, 3000);

    setBookContentCandidates(nextCandidates);
    setSelectedBookContentKeys(initialBookSelection(nextCandidates));
    setBookTitle((current) => current || `${nextCandidates.roomName} 기록집`);
    setBookCreateStep("content");
    setErrorMessage(nextErrorMessage);
    setBookCandidatesLoading(false);
  }

  function toggleBookContent(content: BookContentCandidate) {
    setSelectedBookContentKeys((current) => {
      const key = bookContentKey(content);
      return { ...current, [key]: !current[key] };
    });
    setBookPreview(null);
  }

  function moveBookContentType(type: BookContentType, direction: "UP" | "DOWN") {
    setBookContentTypeOrder((current) => {
      const index = current.indexOf(type);
      const nextIndex = direction === "UP" ? index - 1 : index + 1;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;

      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
    setBookPreview(null);
  }

  async function openBookContentDetail(content: BookContentCandidate) {
    if (!bookSelectedRoomId) return;

    setBookContentDetailModal({ content, loading: true });

    if (content.type === "MEMORY") {
      const detail = await safeApiGet<MemoryPostDetail>(`/rooms/${bookSelectedRoomId}/memories/${content.sourceId}`);
      setBookContentDetailModal({
        content,
        loading: false,
        memoryDetail: detail ?? fallbackMemoryDetailFromBookContent(bookSelectedRoomId, content),
      });
      return;
    }

    if (content.type === "MISSION") {
      const missionListResponse = await safeApiGet<MissionListResponse>(`/rooms/${bookSelectedRoomId}/missions`);
      const missionList = missionListResponse ?? demoMissionList(bookSelectedRoomId);
      setBookContentDetailModal({
        content,
        loading: false,
        missionDetail: findMissionByBookContent(missionList, content) ?? fallbackMissionDetailFromBookContent(bookSelectedRoomId, content),
      });
      return;
    }

    if (content.type === "LETTER") {
      const detail = await safeApiGet<LetterDetail>(`/rooms/${bookSelectedRoomId}/letters/${content.sourceId}`);
      setBookContentDetailModal({
        content,
        loading: false,
        letterDetail: detail ?? fallbackLetterDetailFromBookContent(bookSelectedRoomId, content),
      });
      return;
    }

    const messagesResponse = await safeApiGet<ChatMessagesResponse>(`/rooms/${bookSelectedRoomId}/chat/messages`);
    const messages = (messagesResponse?.messages ?? demoChatMessages(bookSelectedRoomId))
      .filter((message) => message.occurredDate === content.occurredDate);
    setBookContentDetailModal({
      content,
      loading: false,
      chatMessages: messages.length > 0 ? messages : fallbackChatMessagesFromBookContent(bookSelectedRoomId, content),
    });
  }

  async function createBookPreview() {
    if (!bookSelectedRoomId || !bookSelectedProductUid || !bookDraftPageRange) {
      setErrorMessage("방, 상품, 콘텐츠를 모두 선택해 주세요.");
      return;
    }

    if (selectedBookContents.length === 0) {
      setErrorMessage("책에 담을 기록을 1개 이상 선택해 주세요.");
      return;
    }

    if (bookDraftPageRange.status === "OVER_MAX") {
      setErrorMessage(bookDraftPageRange.message);
      return;
    }

    setMessage(null);
    setErrorMessage(null);
    const loadingStartedAt = Date.now();
    setBookPreviewLoading(true);

    try {
      const response = await apiRequest<BookPreviewResponse>("/book-archive/previews", {
        method: "POST",
        body: {
          roomId: bookSelectedRoomId,
          bookSpecUid: bookSelectedProductUid,
          title: bookTitle,
          quantity: bookQuantity,
          periodStartDate: bookPeriod.startDate,
          periodEndDate: bookPeriod.endDate,
          contents: selectedBookContents.map((content) => ({ type: content.type, sourceId: content.sourceId })),
        },
      });
      await waitAtLeast(loadingStartedAt, 3000);
      setBookPreview(response);
      setBookCreateStep("preview");
      setRoomFeedbackModal({
        title: "미리보기 계산 완료",
        message: "템플릿 기반 책 미리보기와 예상 견적을 계산했습니다.",
      });
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setBookPreviewLoading(false);
    }
  }

  async function createPrintOrder() {
    if (!bookPreview) {
      setErrorMessage("주문할 미리보기를 먼저 생성해 주세요.");
      return;
    }

    setMessage(null);
    setErrorMessage(null);
    setBookOrderCreating(true);

    try {
      const response = await apiRequest<CreatePrintOrderResponse>("/book-archive/orders", {
        method: "POST",
        body: { previewId: bookPreview.previewId },
      });
      setSelectedBookOrder(response.order);
      setBookStatusOrders((current) => [
        orderDetailToSummary(response.order),
        ...current.filter((order) => order.id !== response.order.id),
      ]);
      setBookOrderConfirmOpen(false);
      setBookMenuExpanded(true);
      setActiveView("bookStatus");
      setMessage("주문 요청이 생성되었습니다. 진행 상태 화면에서 제작 흐름을 확인할 수 있습니다.");
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setBookOrderCreating(false);
    }
  }

  async function loadBookOrders(scope: "status" | "history") {
    setErrorMessage(null);
    setBookOrdersLoading(true);
    try {
      const response = await apiGet<PrintOrdersResponse>(`/book-archive/orders/${scope}`);
      if (scope === "status") {
        setBookStatusOrders(response.orders);
      } else {
        setBookHistoryOrders(response.orders);
      }
      setSelectedBookOrder((current) =>
        current && response.orders.some((order) => order.id === current.id && order.status === current.status)
          ? current
          : null,
      );
    } catch (error) {
      if (scope === "status") {
        setBookStatusOrders([]);
      } else {
        setBookHistoryOrders([]);
      }
      setSelectedBookOrder(null);
      setErrorMessage(toMessage(error));
    } finally {
      setBookOrdersLoading(false);
    }
  }

  async function openBookOrderDetail(orderId: number) {
    setMessage(null);
    setErrorMessage(null);
    setBookOrderDetailLoading(true);
    try {
      const response = await apiGet<PrintOrderDetail>(`/book-archive/orders/${orderId}`);
      setSelectedBookOrder(response);
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setBookOrderDetailLoading(false);
    }
  }

  async function cancelPrintOrder(reason: string) {
    if (!selectedBookOrder) return;

    setMessage(null);
    setErrorMessage(null);
    setBookOrderActionLoading(true);
    try {
      const response = await apiRequest<PrintOrderActionResponse>(`/book-archive/orders/${selectedBookOrder.id}/cancel`, {
        method: "POST",
        body: { reason },
      });
      setSelectedBookOrder(response.order);
      setBookStatusOrders((current) => current.filter((order) => order.id !== response.order.id));
      setBookHistoryOrders((current) => [
        orderDetailToSummary(response.order),
        ...current.filter((order) => order.id !== response.order.id),
      ]);
      setBookOrderCancelOpen(false);
      setBookMenuExpanded(true);
      setActiveView("bookHistory");
      setMessage("주문이 취소되어 주문 내역으로 이동했습니다.");
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setBookOrderActionLoading(false);
    }
  }

  async function loadOperatorOrders(statusFilter: PrintOrderStatus | "ALL" = operatorStatusFilter) {
    setMessage(null);
    setErrorMessage(null);
    setOperatorOrdersLoading(true);
    try {
      const query = statusFilter === "ALL" ? "" : `?status=${encodeURIComponent(statusFilter)}`;
      const response = await apiGet<PrintOrdersResponse>(`/operator/book-orders${query}`);
      setOperatorOrders(response.orders);
      setOperatorSelectedOrder((current) =>
        current && response.orders.some((order) => order.id === current.id)
          ? current
          : null,
      );
    } catch (error) {
      setOperatorOrders([]);
      setOperatorSelectedOrder(null);
      setErrorMessage(toMessage(error));
    } finally {
      setOperatorOrdersLoading(false);
    }
  }

  async function openOperatorOrderDetail(orderId: number) {
    setMessage(null);
    setErrorMessage(null);
    setOperatorOrderDetailLoading(true);
    try {
      const response = await apiGet<PrintOrderDetail>(`/operator/book-orders/${orderId}`);
      setOperatorSelectedOrder(response);
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setOperatorOrderDetailLoading(false);
    }
  }

  async function advanceOperatorOrderStatus() {
    if (!operatorSelectedOrder) return;

    setMessage(null);
    setErrorMessage(null);
    setOperatorOrderActionLoading(true);
    try {
      const response = await apiRequest<PrintOrderActionResponse>(`/operator/book-orders/${operatorSelectedOrder.id}/next-status`, {
        method: "POST",
        body: { memo: "운영자가 다음 제작 상태로 변경했습니다." },
      });
      applyOperatorOrderUpdate(response.order);
      setMessage("주문 상태가 다음 단계로 변경되었습니다.");
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setOperatorOrderActionLoading(false);
    }
  }

  async function advanceSelectedOperatorOrderStatuses(orderIds: number[]) {
    const processableIds = orderIds.filter((orderId) => {
      const order = operatorOrders.find((item) => item.id === orderId);
      return Boolean(order && nextPrintOrderStatus(order.status));
    });

    if (processableIds.length === 0) {
      setErrorMessage("다음 상태로 변경할 수 있는 선택 주문이 없습니다.");
      return;
    }

    setMessage(null);
    setErrorMessage(null);
    setOperatorOrderActionLoading(true);
    try {
      for (const orderId of processableIds) {
        const response = await apiRequest<PrintOrderActionResponse>(`/operator/book-orders/${orderId}/next-status`, {
          method: "POST",
          body: { memo: "운영자가 선택 주문을 일괄 상태 변경했습니다." },
        });
        applyOperatorOrderUpdate(response.order);
      }
      setMessage(`${processableIds.length}건의 주문 상태를 다음 단계로 변경했습니다.`);
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setOperatorOrderActionLoading(false);
    }
  }

  async function cancelOperatorOrder(reason: string) {
    if (!operatorSelectedOrder) return;

    setMessage(null);
    setErrorMessage(null);
    setOperatorOrderActionLoading(true);
    try {
      const response = await apiRequest<PrintOrderActionResponse>(`/operator/book-orders/${operatorSelectedOrder.id}/cancel`, {
        method: "POST",
        body: { reason },
      });
      applyOperatorOrderUpdate(response.order);
      setOperatorCancelOrderOpen(false);
      setMessage("운영자 권한으로 주문을 취소 처리했습니다.");
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setOperatorOrderActionLoading(false);
    }
  }

  function applyOperatorOrderUpdate(order: PrintOrderDetail) {
    setOperatorSelectedOrder(order);
    setOperatorOrders((current) => {
      const summary = orderDetailToSummary(order);
      if (operatorStatusFilter !== "ALL" && summary.status !== operatorStatusFilter) {
        return current.filter((item) => item.id !== summary.id);
      }
      const exists = current.some((item) => item.id === summary.id);
      return exists
        ? current.map((item) => (item.id === summary.id ? summary : item))
        : [summary, ...current];
    });
  }

  async function loadChatMessages(roomId: number, options: { silent?: boolean } = {}) {
    if (!options.silent) {
      setChatLoading(true);
    }

    const response = await safeApiGet<ChatMessagesResponse>(`/rooms/${roomId}/chat/messages`);
    setChatMessages(response?.messages ?? demoChatMessages(roomId));

    if (!options.silent) {
      await safeApiRequest<{ read: boolean; readCount: number }>(`/rooms/${roomId}/chat/read`, { method: "POST" });
      await refreshSidebarState();
      setChatLoading(false);
    }
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
      await apiRequest<SendChatMessageResponse>(`/rooms/${selectedRoom.id}/chat/messages`, {
        method: "POST",
        body: { body },
      });
      setChatDraft("");
      await loadChatMessages(selectedRoom.id, { silent: true });
      await refreshSidebarState();
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

  async function loadMemoryPosts(roomId: number) {
    setMemoryLoading(true);
    setMemoryDetailLoading(false);

    const response = await safeApiGet<MemoryPostsResponse>(`/rooms/${roomId}/memories`);
    const posts = response?.posts ?? demoMemoryPosts(roomId);
    setMemoryPosts(posts);
    setMemoryLoading(false);

    if (posts.length === 0) {
      setSelectedMemoryPost(null);
      return;
    }

    const stillSelected = selectedMemoryPost?.roomId === roomId
      ? posts.find((post) => post.id === selectedMemoryPost.id)
      : null;
    void openMemoryPostDetail(roomId, stillSelected?.id ?? posts[0].id);
  }

  async function openMemoryPostDetail(roomId: number, memoryId: number) {
    setMemoryDetailLoading(true);
    const response = await safeApiGet<MemoryPostDetail>(`/rooms/${roomId}/memories/${memoryId}`);
    setSelectedMemoryPost(response ?? demoMemoryDetail(roomId, memoryId));
    setMemoryDetailLoading(false);
  }

  async function createMemoryPost() {
    if (!selectedRoom) return;

    const title = memoryPostForm.title.trim();
    const body = memoryPostForm.body.trim();
    const imageUrl = memoryPostForm.representativeImageUrl;

    if (!title || !body) {
      setErrorMessage("추억 제목과 내용을 입력해 주세요.");
      return;
    }

    setMessage(null);
    setErrorMessage(null);
    setMemoryCreating(true);

    try {
      const createdPost = await apiRequest<MemoryPostDetail>(`/rooms/${selectedRoom.id}/memories`, {
        method: "POST",
        body: {
          title,
          body,
          representativeImageUrl: imageUrl || null,
          occurredDate: memoryPostForm.occurredDate || null,
        },
      });

      setMemoryPosts((current) => [memoryDetailToSummary(createdPost), ...current.filter((post) => post.id !== createdPost.id)]);
      setSelectedMemoryPost(createdPost);
      setMemoryPostForm(initialMemoryPostForm());
      setRoomFeedbackModal({ title: "추억 등록 완료", message: "새 추억이 게시판에 등록되었습니다." });
      await loadCalendarActivities(calendarRoomId);
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setMemoryCreating(false);
    }
  }

  async function uploadMemoryImageFile(file: File): Promise<MemoryImageUploadResponse> {
    if (!selectedRoom) {
      throw new Error("이미지를 업로드할 방을 선택해 주세요.");
    }

    if (!file.type.startsWith("image/")) {
      throw new Error("이미지 파일만 선택해 주세요.");
    }

    const formData = new FormData();
    formData.append("image", file);

    return apiFormDataRequest<MemoryImageUploadResponse>(
      `/rooms/${selectedRoom.id}/memories/images`,
      formData,
    );
  }

  async function uploadMemoryImage(file: File) {
    if (!selectedRoom) return;

    setMessage(null);
    setErrorMessage(null);
    setMemoryImageUploading(true);

    try {
      const uploadedImage = await uploadMemoryImageFile(file);

      setMemoryPostForm((current) => ({
        ...current,
        representativeImageUrl: uploadedImage.imageUrl,
        representativeImageName: uploadedImage.originalFileName,
      }));
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setMemoryImageUploading(false);
    }
  }

  async function uploadMemoryEditImage(file: File) {
    if (!selectedRoom) return;

    setMessage(null);
    setErrorMessage(null);
    setMemoryEditImageUploading(true);

    try {
      const uploadedImage = await uploadMemoryImageFile(file);

      setMemoryEditForm((current) => ({
        ...current,
        representativeImageUrl: uploadedImage.imageUrl,
        representativeImageName: uploadedImage.originalFileName,
      }));
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setMemoryEditImageUploading(false);
    }
  }

  async function createMemoryComment() {
    if (!selectedRoom || !selectedMemoryPost) return;

    const body = memoryCommentDraft.trim();
    if (!body) {
      setErrorMessage("댓글을 입력해 주세요.");
      return;
    }

    setMessage(null);
    setErrorMessage(null);
    setMemoryCommentSending(true);

    try {
      const createdComment = await apiRequest<MemoryComment>(`/rooms/${selectedRoom.id}/memories/${selectedMemoryPost.id}/comments`, {
        method: "POST",
        body: { body },
      });

      setSelectedMemoryPost((current) => {
        if (!current || current.id !== selectedMemoryPost.id) return current;

        return {
          ...current,
          commentCount: current.commentCount + 1,
          comments: [...current.comments, createdComment],
        };
      });
      setMemoryPosts((current) =>
        current.map((post) => (post.id === selectedMemoryPost.id ? { ...post, commentCount: post.commentCount + 1 } : post)),
      );
      setMemoryCommentDraft("");
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setMemoryCommentSending(false);
    }
  }

  async function loadLetters(
    roomId: number,
    box: LetterBox = letterBox,
    options: { focusId?: number | null; page?: number; append?: boolean } = {},
  ) {
    const page = options.page ?? 0;
    const append = options.append ?? false;
    const focusId = options.focusId ?? letterFocusId;

    if (append) {
      setLetterLoadingMore(true);
    } else {
      setLetterLoading(true);
      setLetterDetailLoading(false);
    }

    try {
      const fallbackAllLetters = demoLetters(roomId, box);
      const fallbackStart = page * letterPageSize;
      const fallbackItems = fallbackAllLetters.slice(fallbackStart, fallbackStart + letterPageSize);
      const response = await safeApiGet<LettersResponse>(`/rooms/${roomId}/letters?box=${box}&page=${page}&size=${letterPageSize}`);
      const recipients = response?.recipients ?? demoLetterRecipients(roomId);
      const items = response?.items ?? fallbackItems;
      const totalCount = response?.totalCount ?? fallbackAllLetters.length;
      const hasMore = response?.hasMore ?? fallbackStart + items.length < totalCount;

      setLetterRecipients(recipients);
      setLetters((current) => (append ? [...current, ...items] : items));
      setLetterTotalCount(totalCount);
      setLetterHasMore(hasMore);

      if (append) {
        return;
      }

      if (items.length === 0) {
        setSelectedLetter(null);
        return;
      }

      const nextLetterId = focusId && items.some((letter) => letter.id === focusId)
        ? focusId
        : selectedLetter?.roomId === roomId && selectedLetter.mine === (box === "SENT") && items.some((letter) => letter.id === selectedLetter.id)
          ? selectedLetter.id
          : items[0].id;

      if (focusId) {
        setLetterFocusId(null);
      }
      await openLetterDetail(roomId, nextLetterId);
    } finally {
      if (append) {
        setLetterLoadingMore(false);
      } else {
        setLetterLoading(false);
      }
    }
  }

  async function loadMoreLetters() {
    if (!selectedRoom || letterLoading || letterLoadingMore || !letterHasMore) return;

    const nextPage = Math.floor(letters.length / letterPageSize);
    await loadLetters(selectedRoom.id, letterBox, { page: nextPage, append: true });
  }

  async function openLetterDetail(roomId: number, letterId: number) {
    setLetterDetailLoading(true);
    const response = await safeApiGet<LetterDetail>(`/rooms/${roomId}/letters/${letterId}`);
    const detail = response ?? demoLetterDetail(roomId, letterId, letterBox);

    setSelectedLetter(detail);
    setLetters((current) => current.map((letter) => (letter.id === letterId ? { ...letter, read: detail.read } : letter)));
    setLetterDetailLoading(false);
  }

  async function sendLetter() {
    if (!selectedRoom) return;

    const receiverMemberId = Number(letterForm.receiverMemberId);
    const title = letterForm.title.trim();
    const body = letterForm.body.trim();

    if (!receiverMemberId || !title || !body) {
      setErrorMessage("수신자, 제목, 내용을 모두 입력해 주세요.");
      return;
    }

    setMessage(null);
    setErrorMessage(null);
    setLetterSending(true);

    try {
      const response = await apiRequest<SendLetterResponse>(`/rooms/${selectedRoom.id}/letters`, {
        method: "POST",
        body: {
          receiverMemberId,
          title,
          body,
        },
      });

      setLetterForm(initialLetterForm());
      setLetterComposeOpen(false);
      setLetterBox("SENT");
      setSelectedLetter(response.letter);
      await loadLetters(selectedRoom.id, "SENT", { focusId: response.letter.id });
      await loadCalendarActivities(calendarRoomId);
      setRoomFeedbackModal({ title: "편지 전송 완료", message: "선택한 구성원에게 편지를 보냈습니다." });
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setLetterSending(false);
    }
  }

  function changeLetterBox(nextBox: LetterBox) {
    setLetterBox(nextBox);
    setLetterFocusId(null);
    setSelectedLetter(null);
  }

  function openMemoryEditModal() {
    if (!selectedMemoryPost) return;

    setMemoryEditForm({
      title: selectedMemoryPost.title,
      body: selectedMemoryPost.body,
      representativeImageUrl: selectedMemoryPost.representativeImageUrl ?? "",
      representativeImageName: selectedMemoryPost.representativeImageUrl ? "현재 대표 사진" : "",
      occurredDate: selectedMemoryPost.occurredDate,
    });
    setMemoryActionMode("edit");
  }

  async function updateMemoryPost() {
    if (!selectedRoom || !selectedMemoryPost) return;

    const title = memoryEditForm.title.trim();
    const body = memoryEditForm.body.trim();

    if (!title || !body) {
      setErrorMessage("추억 제목과 내용을 입력해 주세요.");
      return;
    }

    setMessage(null);
    setErrorMessage(null);
    setMemoryActionLoading(true);

    try {
      const updatedPost = await apiRequest<MemoryPostDetail>(`/rooms/${selectedRoom.id}/memories/${selectedMemoryPost.id}`, {
        method: "PATCH",
        body: {
          title,
          body,
          representativeImageUrl: memoryEditForm.representativeImageUrl || null,
          occurredDate: memoryEditForm.occurredDate || null,
        },
      });

      setSelectedMemoryPost(updatedPost);
      setMemoryPosts((current) => current.map((post) => (post.id === updatedPost.id ? memoryDetailToSummary(updatedPost) : post)));
      setMemoryActionMode(null);
      setRoomFeedbackModal({ title: "추억 수정 완료", message: "선택한 추억이 수정되었습니다." });
      await loadCalendarActivities(calendarRoomId);
    } catch (error) {
      setRoomFeedbackModal({ title: "추억 수정 실패", message: toMessage(error) });
    } finally {
      setMemoryActionLoading(false);
    }
  }

  async function deleteMemoryPost() {
    if (!selectedRoom || !selectedMemoryPost) return;

    const deletedPostId = selectedMemoryPost.id;

    setMessage(null);
    setErrorMessage(null);
    setMemoryActionLoading(true);

    try {
      await apiRequest<DeleteMemoryPostResponse>(`/rooms/${selectedRoom.id}/memories/${deletedPostId}`, {
        method: "DELETE",
      });

      setMemoryPosts((current) => current.filter((post) => post.id !== deletedPostId));
      setSelectedMemoryPost(null);
      setMemoryCommentDraft("");
      setMemoryActionMode(null);
      await loadMemoryPosts(selectedRoom.id);
      await loadCalendarActivities(calendarRoomId);
      setRoomFeedbackModal({ title: "추억 삭제 완료", message: "선택한 추억이 삭제되었습니다." });
    } catch (error) {
      setRoomFeedbackModal({ title: "추억 삭제 실패", message: toMessage(error) });
    } finally {
      setMemoryActionLoading(false);
    }
  }

  async function loadMissions(roomId: number) {
    setMissionLoading(true);

    const response = await safeApiGet<MissionListResponse>(`/rooms/${roomId}/missions`);
    const nextMissionList = response ?? demoMissionList(roomId);
    setMissionList(nextMissionList);
    setMissionSubmissionForm((current) => {
      const currentMissionExists = nextMissionList.missions.some((mission) => mission.id === current.missionId);
      return {
        ...initialMissionSubmissionForm(),
        missionId: currentMissionExists ? current.missionId : nextMissionList.missions[0]?.id ?? null,
      };
    });
    setMissionLoading(false);
  }

  async function createMission() {
    if (!selectedRoom) return;

    const title = missionForm.title.trim();
    const description = missionForm.description.trim();
    if (!title || !description) {
      setErrorMessage("미션 제목과 설명을 입력해 주세요.");
      return;
    }

    setMessage(null);
    setErrorMessage(null);
    setMissionCreating(true);

    try {
      const createdMission = await apiRequest<MissionSummary>(`/rooms/${selectedRoom.id}/missions`, {
        method: "POST",
        body: { title, description },
      });
      setMissionList((current) => {
        const base = current ?? demoMissionList(selectedRoom.id);
        return { ...base, missions: [createdMission, ...base.missions.filter((mission) => mission.id !== createdMission.id)] };
      });
      setMissionSubmissionForm(initialMissionSubmissionForm(createdMission.id));
      setMissionForm(initialMissionForm());
      setMissionCreateOpen(false);
      setRoomFeedbackModal({ title: "미션 추가 완료", message: "새 커스텀 미션이 추가되었습니다." });
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setMissionCreating(false);
    }
  }

  async function uploadMissionImage(file: File) {
    if (!selectedRoom) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("이미지 파일만 선택해 주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setMessage(null);
    setErrorMessage(null);
    setMissionImageUploading(true);

    try {
      const uploadedImage = await apiFormDataRequest<MissionImageUploadResponse>(`/rooms/${selectedRoom.id}/missions/images`, formData);
      setMissionSubmissionForm((current) => ({
        ...current,
        imageUrl: uploadedImage.imageUrl,
        imageName: uploadedImage.originalFileName,
      }));
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setMissionImageUploading(false);
    }
  }

  async function submitMission() {
    if (!selectedRoom || !missionSubmissionForm.missionId) return;

    const body = missionSubmissionForm.body.trim();
    if (!body || !missionSubmissionForm.imageUrl) {
      setErrorMessage("인증 사진과 내용을 모두 입력해 주세요.");
      return;
    }

    setMessage(null);
    setErrorMessage(null);
    setMissionSubmitting(true);

    try {
      const updatedMission = await apiRequest<MissionSummary>(`/rooms/${selectedRoom.id}/missions/${missionSubmissionForm.missionId}/submissions`, {
        method: "POST",
        body: {
          body,
          imageUrl: missionSubmissionForm.imageUrl,
          occurredDate: missionSubmissionForm.occurredDate || null,
        },
      });
      setMissionList((current) => replaceMissionSummary(current, updatedMission));
      setMissionSubmissionForm(initialMissionSubmissionForm(updatedMission.id));
      await loadCalendarActivities(calendarRoomId);
      setRoomFeedbackModal({ title: "미션 인증 요청 완료", message: "인증 사진과 기록이 동의 대기 상태로 등록되었습니다." });
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setMissionSubmitting(false);
    }
  }

  async function approveMissionSubmission(submissionId: number) {
    if (!selectedRoom) return;

    setMessage(null);
    setErrorMessage(null);
    setMissionApproving(submissionId);

    try {
      await apiRequest(`/rooms/${selectedRoom.id}/mission-submissions/${submissionId}/approve`, { method: "POST" });
      await loadMissions(selectedRoom.id);
      await loadCalendarActivities(calendarRoomId);
      setRoomFeedbackModal({ title: "미션 동의 완료", message: "미션 인증에 동의했습니다. 완료 조건을 만족하면 미션이 완료됩니다." });
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setMissionApproving(null);
    }
  }

  async function createMissionComment() {
    if (!selectedRoom || !missionSubmissionForm.missionId) return;

    const body = missionCommentDraft.trim();
    if (!body) {
      setErrorMessage("댓글을 입력해 주세요.");
      return;
    }

    setMessage(null);
    setErrorMessage(null);
    setMissionCommentSending(true);

    try {
      const createdComment = await apiRequest<MissionComment>(
        `/rooms/${selectedRoom.id}/missions/${missionSubmissionForm.missionId}/comments`,
        {
          method: "POST",
          body: { body },
        },
      );

      setMissionList((current) => {
        if (!current) return current;

        return {
          ...current,
          missions: current.missions.map((mission) =>
            mission.id === createdComment.missionId
              ? { ...mission, comments: [...mission.comments, createdComment] }
              : mission,
          ),
        };
      });
      setMissionCommentDraft("");
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setMissionCommentSending(false);
    }
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

  async function searchRoomInvitees(roomId: number) {
    const contact = inviteContacts[roomId]?.trim() ?? "";
    setMessage(null);
    setErrorMessage(null);
    setRoomFeedbackModal(null);
    setInviteCandidateModal(null);

    if (!contact) {
      setRoomFeedbackModal({ title: "검색 실패", message: "검색어를 입력해 주세요." });
      return;
    }

    setInviteSearchingRoomId(roomId);
    try {
      const response = await apiGet<InviteeSearchResponse>(
        `/rooms/${roomId}/invitation-candidates?keyword=${encodeURIComponent(contact)}`,
      );

      if (response.results.length === 0) {
        setRoomFeedbackModal({ title: "검색 결과 없음", message: "초대할 회원을 찾을 수 없습니다." });
        return;
      }

      const exactUsernameInvitee = response.results.find((invitee) => invitee.username.toLowerCase() === contact.toLowerCase());
      if (exactUsernameInvitee) {
        await sendRoomInvitation(roomId, exactUsernameInvitee.id);
        return;
      }

      setInviteCandidateModal({
        roomId,
        roomName: rooms.find((room) => room.id === roomId)?.name ?? "선택한 방",
        keyword: response.keyword,
        candidates: response.results,
      });
    } catch (error) {
      setRoomFeedbackModal({ title: "검색 실패", message: toMessage(error) });
    } finally {
      setInviteSearchingRoomId(null);
    }
  }

  async function sendRoomInvitation(roomId: number, inviteeMemberId: number) {
    setMessage(null);
    setErrorMessage(null);
    setRoomFeedbackModal(null);
    setInvitingMemberId(inviteeMemberId);

    try {
      await apiRequest<{ id: number; status: string; expiresAt: string }>(`/rooms/${roomId}/invitations`, {
        method: "POST",
        body: { memberId: inviteeMemberId },
      });
      setInviteContacts((current) => ({ ...current, [roomId]: "" }));
      setInviteCandidateModal(null);
      await loadRooms();
      setRoomFeedbackModal({ title: "초대 완료", message: "초대를 보냈습니다." });
    } catch (error) {
      setRoomFeedbackModal({ title: "초대 실패", message: toMessage(error) });
    } finally {
      setInvitingMemberId(null);
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

  async function openRoomSettings() {
    if (!selectedRoom) return;

    const fallbackDetail = roomSummaryToDetail(selectedRoom);
    setMessage(null);
    setErrorMessage(null);
    setRoomFeedbackModal(null);
    setRoomDetail(fallbackDetail);
    setRoomEditForm({
      name: fallbackDetail.name,
      description: fallbackDetail.description ?? "",
    });
    setRoomSettingsMode("menu");

    const response = await safeApiGet<RoomDetail>(`/rooms/${selectedRoom.id}`);
    if (!response) return;

    setRoomDetail(response);
    setRoomEditForm({
      name: response.name,
      description: response.description ?? "",
    });
  }

  async function updateRoomInfo() {
    if (!roomDetail) return;

    setRoomActionLoading(true);
    setMessage(null);
    setErrorMessage(null);
    try {
      const updatedRoom = await apiRequest<RoomDetail>(`/rooms/${roomDetail.id}`, {
        method: "PATCH",
        body: {
          name: roomEditForm.name,
          description: roomEditForm.description || null,
        },
      });

      setRoomDetail(updatedRoom);
      setRooms((currentRooms) => currentRooms.map((room) => (room.id === updatedRoom.id ? mergeRoomSummary(room, updatedRoom) : room)));
      setRoomSettingsMode(null);
      setRoomFeedbackModal({ title: "방 정보 수정 완료", message: "방 이름과 설명이 수정되었습니다." });
    } catch (error) {
      setRoomSettingsMode(null);
      setRoomFeedbackModal({ title: "방 정보 수정 실패", message: toMessage(error) });
    } finally {
      setRoomActionLoading(false);
    }
  }

  async function deleteSelectedRoom() {
    if (!roomDetail) return;

    setRoomActionLoading(true);
    setMessage(null);
    setErrorMessage(null);
    try {
      await apiRequest<DeleteRoomResponse>(`/rooms/${roomDetail.id}`, {
        method: "DELETE",
      });

      const nextRooms = await loadRooms();
      const nextRoomId = nextRooms[0]?.id ?? null;
      const nextCalendarRoomId = calendarRoomId === roomDetail.id ? null : calendarRoomId;
      setSelectedRoomId(nextRoomId);
      setExpandedRoomId(nextRoomId);
      setRoomListExpanded(true);
      setCalendarRoomId(nextCalendarRoomId);
      setActiveView(nextRoomId ? "rooms" : "home");
      await loadCalendarActivities(nextCalendarRoomId);
      setRoomSettingsMode(null);
      setRoomDetail(null);
      setRoomFeedbackModal({ title: "방 삭제 완료", message: "선택한 방을 삭제했습니다." });
    } catch (error) {
      setRoomSettingsMode(null);
      setRoomFeedbackModal({ title: "방 삭제 실패", message: toMessage(error) });
    } finally {
      setRoomActionLoading(false);
    }
  }

  if (!selectedDemoMember) {
    return <DemoMemberSelectionView members={demoMemberOptions} onSelect={selectDemoMember} />;
  }

  if (isOperatorDemoMember(selectedDemoMember)) {
    return (
      <>
        <OperatorBookOrdersView
          operator={selectedDemoMember}
          orders={operatorOrders}
          selectedOrder={operatorSelectedOrder}
          statusFilter={operatorStatusFilter}
          loading={operatorOrdersLoading}
          detailLoading={operatorOrderDetailLoading}
          actionLoading={operatorOrderActionLoading}
          message={message}
          errorMessage={errorMessage}
          onStatusFilterChange={setOperatorStatusFilter}
          onOpenOrder={openOperatorOrderDetail}
          onAdvanceStatus={advanceOperatorOrderStatus}
          onAdvanceSelectedStatuses={advanceSelectedOperatorOrderStatuses}
          onOpenCancel={() => setOperatorCancelOrderOpen(true)}
          onCloseOrderDetail={() => setOperatorSelectedOrder(null)}
          onLogout={logoutToMemberSelection}
        />

        {operatorCancelOrderOpen && operatorSelectedOrder ? (
          <BookOrderCancelModal
            order={operatorSelectedOrder}
            loading={operatorOrderActionLoading}
            onCancelOrder={cancelOperatorOrder}
            onClose={() => setOperatorCancelOrderOpen(false)}
          />
        ) : null}
      </>
    );
  }

  return (
    <main className={`workspace ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        activeView={activeView}
        rooms={rooms}
        selectedRoomId={selectedRoom?.id ?? null}
        expandedRoomId={expandedRoomId}
        roomListExpanded={roomListExpanded}
        bookMenuExpanded={bookMenuExpanded}
        collapsed={sidebarCollapsed}
        pendingInvitationCount={pendingInvitationCount}
        onMove={moveToView}
        onOpenRoomList={openRoomListView}
        onToggleRoomList={toggleRoomList}
        onToggleBookMenu={toggleBookMenu}
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
            onOpenRoomSettings={openRoomSettings}
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
            inviteSearchingRoomId={inviteSearchingRoomId}
            onCreateRoomFormChange={setCreateRoomForm}
            onCreateRoom={createRoom}
            onInviteContactChange={(roomId, value) => setInviteContacts((current) => ({ ...current, [roomId]: value }))}
            onSearchInvitees={searchRoomInvitees}
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
        {activeView === "memories" ? (
          <MemoryBoardView
            selectedRoom={selectedRoom}
            posts={memoryPosts}
            selectedPost={selectedMemoryPost}
            form={memoryPostForm}
            commentDraft={memoryCommentDraft}
            loading={memoryLoading}
            detailLoading={memoryDetailLoading}
            creating={memoryCreating}
            imageUploading={memoryImageUploading}
            commentSending={memoryCommentSending}
            onFormChange={setMemoryPostForm}
            onImageUpload={uploadMemoryImage}
            onImageClear={() => setMemoryPostForm((current) => ({ ...current, representativeImageUrl: "", representativeImageName: "" }))}
            onCommentDraftChange={setMemoryCommentDraft}
            onCreatePost={createMemoryPost}
            onOpenPost={(memoryId) => {
              if (!selectedRoom) return;
              void openMemoryPostDetail(selectedRoom.id, memoryId);
            }}
            onOpenEdit={openMemoryEditModal}
            onOpenDelete={() => setMemoryActionMode("delete")}
            onCreateComment={createMemoryComment}
          />
        ) : null}
        {activeView === "missions" ? (
          <MissionBoardView
            selectedRoom={selectedRoom}
            missionList={missionList}
            missionForm={missionForm}
            submissionForm={missionSubmissionForm}
            commentDraft={missionCommentDraft}
            createModalOpen={missionCreateOpen}
            loading={missionLoading}
            creating={missionCreating}
            submitting={missionSubmitting}
            imageUploading={missionImageUploading}
            approvingSubmissionId={missionApproving}
            commentSending={missionCommentSending}
            onMissionFormChange={setMissionForm}
            onSubmissionFormChange={setMissionSubmissionForm}
            onCommentDraftChange={setMissionCommentDraft}
            onOpenCreateModal={() => setMissionCreateOpen(true)}
            onCloseCreateModal={() => setMissionCreateOpen(false)}
            onCreateMission={createMission}
            onImageUpload={uploadMissionImage}
            onImageClear={() => setMissionSubmissionForm((current) => ({ ...current, imageUrl: "", imageName: "" }))}
            onSubmitMission={submitMission}
            onApproveSubmission={approveMissionSubmission}
            onCreateComment={createMissionComment}
          />
        ) : null}
        {activeView === "letters" ? (
          <LetterBoardView
            selectedRoom={selectedRoom}
            box={letterBox}
            recipients={letterRecipients}
            letters={letters}
            selectedLetter={selectedLetter}
            form={letterForm}
            loading={letterLoading}
            detailLoading={letterDetailLoading}
            loadingMore={letterLoadingMore}
            hasMore={letterHasMore}
            totalCount={letterTotalCount}
            sending={letterSending}
            composeOpen={letterComposeOpen}
            onBoxChange={changeLetterBox}
            onFormChange={setLetterForm}
            onOpenCompose={() => setLetterComposeOpen(true)}
            onCloseCompose={() => setLetterComposeOpen(false)}
            onSendLetter={sendLetter}
            onLoadMore={loadMoreLetters}
            onOpenLetter={(letterId) => {
              if (!selectedRoom) return;
              void openLetterDetail(selectedRoom.id, letterId);
            }}
          />
        ) : null}
        {activeView === "bookProducts" ? (
          <BookProductGuideView
            products={bookProducts}
            loading={bookProductsLoading}
            onStartCreate={() => moveToView("bookCreate")}
          />
        ) : null}
        {activeView === "bookCreate" ? (
          <BookCreateView
            rooms={bookRooms}
            products={bookProducts}
            calendar={calendar}
            selectedRoomId={bookSelectedRoomId}
            selectedProductUid={bookSelectedProductUid}
            activeStep={bookCreateStep}
            period={bookPeriod}
            candidateContentTypes={bookCandidateContentTypes}
            title={bookTitle}
            quantity={bookQuantity}
            contentCandidates={bookContentCandidates}
            selectedContentKeys={selectedBookContentKeys}
            selectedContents={selectedBookContents}
            allContents={orderedBookContentCandidates}
            contentFilter={bookContentFilter}
            contentOrderMode={bookContentOrderMode}
            contentTypeOrder={bookContentTypeOrder}
            draftSummary={bookDraftSummary}
            draftPageRange={bookDraftPageRange}
            preview={bookPreview}
            loading={bookProductsLoading || bookCandidatesLoading}
            candidatesLoading={bookCandidatesLoading}
            previewLoading={bookPreviewLoading}
            onStepChange={setBookCreateStep}
            onSelectRoom={selectBookRoom}
            onSelectProduct={selectBookProduct}
            onPeriodChange={updateBookPeriod}
            onToggleCandidateContentType={toggleBookCandidateContentType}
            onTitleChange={setBookTitle}
            onQuantityChange={setBookQuantity}
            onContentFilterChange={setBookContentFilter}
            onContentOrderModeChange={(mode) => {
              setBookContentOrderMode(mode);
              setBookPreview(null);
            }}
            onMoveContentType={moveBookContentType}
            onLoadCandidates={loadBookContentCandidates}
            onToggleContent={toggleBookContent}
            onOpenContentDetail={openBookContentDetail}
            onCreatePreview={createBookPreview}
            onOpenOrderConfirm={() => setBookOrderConfirmOpen(true)}
          />
        ) : null}
        {activeView === "bookStatus" ? (
          <BookOrdersView
            mode="status"
            orders={bookStatusOrders}
            selectedOrder={selectedBookOrder}
            loading={bookOrdersLoading}
            detailLoading={bookOrderDetailLoading}
            actionLoading={bookOrderActionLoading}
            onOpenOrder={openBookOrderDetail}
            onOpenCancel={() => setBookOrderCancelOpen(true)}
            onCloseOrderDetail={() => setSelectedBookOrder(null)}
          />
        ) : null}
        {activeView === "bookHistory" ? (
          <BookOrdersView
            mode="history"
            orders={bookHistoryOrders}
            selectedOrder={selectedBookOrder}
            loading={bookOrdersLoading}
            detailLoading={bookOrderDetailLoading}
            actionLoading={bookOrderActionLoading}
            onOpenOrder={openBookOrderDetail}
            onCloseOrderDetail={() => setSelectedBookOrder(null)}
          />
        ) : null}
        {activeView === "settings" ? (
          <SettingsView
            profile={profile}
            initials={initials}
            onOpenProfileEdit={() => setProfileEditOpen(true)}
            onLogout={() => setLogoutOpen(true)}
          />
        ) : null}
      </section>

      {profileEditOpen ? (
        <ProfileEditModal
          profile={profile}
          profileForm={profileForm}
          onProfileFormChange={setProfileForm}
          onSave={saveProfile}
          onClose={() => setProfileEditOpen(false)}
        />
      ) : null}

      {logoutOpen ? <LogoutModal onClose={() => setLogoutOpen(false)} onConfirm={logoutToMemberSelection} /> : null}

      {bookOrderConfirmOpen && bookPreview ? (
        <BookOrderConfirmModal
          preview={bookPreview}
          creating={bookOrderCreating}
          onCreateOrder={createPrintOrder}
          onClose={() => setBookOrderConfirmOpen(false)}
        />
      ) : null}

      {bookOrderCancelOpen && selectedBookOrder ? (
        <BookOrderCancelModal
          order={selectedBookOrder}
          loading={bookOrderActionLoading}
          onCancelOrder={cancelPrintOrder}
          onClose={() => setBookOrderCancelOpen(false)}
        />
      ) : null}

      {bookContentDetailModal ? (
        <BookContentDetailModal
          detail={bookContentDetailModal}
          onClose={() => setBookContentDetailModal(null)}
        />
      ) : null}

      {inviteCandidateModal ? (
        <InviteeSelectionModal
          roomName={inviteCandidateModal.roomName}
          keyword={inviteCandidateModal.keyword}
          candidates={inviteCandidateModal.candidates}
          invitingMemberId={invitingMemberId}
          onInvite={(inviteeMemberId) => sendRoomInvitation(inviteCandidateModal.roomId, inviteeMemberId)}
          onClose={() => setInviteCandidateModal(null)}
        />
      ) : null}

      {roomFeedbackModal ? (
        <AlertModal title={roomFeedbackModal.title} message={roomFeedbackModal.message} onClose={() => setRoomFeedbackModal(null)} />
      ) : null}

      {roomSettingsMode ? (
        <RoomSettingsModal
          mode={roomSettingsMode}
          room={roomDetail}
          editForm={roomEditForm}
          loading={roomActionLoading}
          onModeChange={setRoomSettingsMode}
          onEditFormChange={setRoomEditForm}
          onSave={updateRoomInfo}
          onDelete={deleteSelectedRoom}
          onClose={() => setRoomSettingsMode(null)}
        />
      ) : null}

      {memoryActionMode === "edit" && selectedMemoryPost ? (
        <MemoryEditModal
          post={selectedMemoryPost}
          form={memoryEditForm}
          loading={memoryActionLoading}
          imageUploading={memoryEditImageUploading}
          onFormChange={setMemoryEditForm}
          onImageUpload={uploadMemoryEditImage}
          onImageClear={() => setMemoryEditForm((current) => ({ ...current, representativeImageUrl: "", representativeImageName: "" }))}
          onSave={updateMemoryPost}
          onClose={() => setMemoryActionMode(null)}
        />
      ) : null}

      {memoryActionMode === "delete" && selectedMemoryPost ? (
        <MemoryDeleteModal
          post={selectedMemoryPost}
          loading={memoryActionLoading}
          onDelete={deleteMemoryPost}
          onClose={() => setMemoryActionMode(null)}
        />
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

function DemoMemberSelectionView({
  members,
  onSelect,
}: {
  members: DemoMemberOption[];
  onSelect: (member: DemoMemberOption) => void;
}) {
  return (
    <main className="member-select-page">
      <section className="member-select-panel" aria-labelledby="member-select-title">
        <div className="member-select-heading">
          <span className="eyebrow">체험 시작</span>
          <h1 id="member-select-title">사용자를 선택하세요</h1>
        </div>

        <div className="member-select-grid">
          {members.map((member) => (
            <button className="member-select-card" type="button" key={member.id} onClick={() => onSelect(member)}>
              <span className="member-select-avatar" aria-hidden="true">
                {member.displayName.slice(0, 1)}
              </span>
              <span className="member-select-info">
                <strong>{member.displayName}</strong>
                <span>아이디 {member.username}</span>
                <small>{member.roleDescription}</small>
                <em>{member.roomHint}</em>
              </span>
              <UserRound size={22} />
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function OperatorBookOrdersView({
  operator,
  orders,
  selectedOrder,
  statusFilter,
  loading,
  detailLoading,
  actionLoading,
  message,
  errorMessage,
  onStatusFilterChange,
  onOpenOrder,
  onAdvanceStatus,
  onAdvanceSelectedStatuses,
  onOpenCancel,
  onCloseOrderDetail,
  onLogout,
}: {
  operator: DemoMemberOption;
  orders: PrintOrderSummary[];
  selectedOrder: PrintOrderDetail | null;
  statusFilter: PrintOrderStatus | "ALL";
  loading: boolean;
  detailLoading: boolean;
  actionLoading: boolean;
  message: string | null;
  errorMessage: string | null;
  onStatusFilterChange: (status: PrintOrderStatus | "ALL") => void;
  onOpenOrder: (orderId: number) => void;
  onAdvanceStatus: () => void;
  onAdvanceSelectedStatuses: (orderIds: number[]) => void;
  onOpenCancel: () => void;
  onCloseOrderDetail: () => void;
  onLogout: () => void;
}) {
  const table = useOrderTableState(orders, statusFilter, operatorOrderActionFilter);
  const processableSelectedIds = table.selectedOrders
    .filter((order) => nextPrintOrderStatus(order.status))
    .map((order) => order.id);

  useEffect(() => {
    table.updateFilter("status", statusFilter);
  }, [statusFilter]);

  const changeFilter = <K extends keyof OrderTableFilters>(key: K, value: OrderTableFilters[K]) => {
    table.updateFilter(key, value);
    if (key === "status") {
      onStatusFilterChange(value as PrintOrderStatus | "ALL");
    }
  };

  return (
    <main className="operator-page">
      <header className="operator-header">
        <div>
          <span className="eyebrow">운영자 주문 확인</span>
          <h1>책 주문 관리</h1>
          <p>{operator.displayName} 캐릭터로 전체 주문을 필터링하고 CSV 추출, 상세 조회, 상태 변경을 처리합니다.</p>
        </div>
        <div className="operator-header-actions">
          <button className="danger-button" type="button" onClick={onLogout}>
            <LogOut size={17} />
            로그아웃
          </button>
        </div>
      </header>

      {message ? <div className="success-banner">{message}</div> : null}
      {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}

      <section className="operator-layout" aria-busy={loading || detailLoading || actionLoading}>
        <aside className="operator-order-list-panel order-table-panel">
          <div className="book-section-heading compact">
            <div>
              <span>전체 주문</span>
              <h2>{table.filteredOrders.length}건</h2>
            </div>
          </div>

          <OrderTableToolbar
            filters={table.filters}
            actionFilterLabel={table.actionFilterLabel}
            showActionFilter={false}
            resultCount={table.filteredOrders.length}
            selectedCount={table.selectedOrders.length}
            allCsvDisabled={orders.length === 0}
            filteredCsvDisabled={table.filteredOrders.length === 0}
            onFilterChange={changeFilter}
            onReset={() => {
              table.resetFilters("ALL");
              onStatusFilterChange("ALL");
            }}
            onDownloadAll={() => downloadPrintOrdersCsv("operator-orders-all.csv", orders)}
            onDownloadFiltered={() => downloadPrintOrdersCsv("operator-orders-filtered.csv", table.filteredOrders)}
            onDownloadSelected={() => downloadPrintOrdersCsv("operator-orders-selected.csv", table.selectedOrders)}
          />

          {table.selectedOrders.length > 0 ? (
            <div className="order-batch-bar">
              <strong>{table.selectedOrders.length}건 선택됨</strong>
              <button
                className="primary-button"
                type="button"
                onClick={() => onAdvanceSelectedStatuses(processableSelectedIds)}
                disabled={processableSelectedIds.length === 0 || actionLoading}
              >
                {processableSelectedIds.length}건 다음 상태로
              </button>
              <button className="outline-button" type="button" onClick={() => downloadPrintOrdersCsv("operator-orders-selected.csv", table.selectedOrders)}>
                선택한 데이터 CSV
              </button>
              <button className="outline-button" type="button" onClick={() => table.setSelectedIds([])}>
                선택 해제
              </button>
            </div>
          ) : null}

          <PrintOrderDataTable
            orders={table.visibleOrders}
            selectedOrderId={selectedOrder?.id ?? null}
            selectedIds={table.selectedIds}
            loading={loading}
            emptyMessage="조건에 맞는 주문이 없습니다."
            onToggleOrder={table.toggleOrder}
            onToggleVisibleOrders={table.toggleVisibleOrders}
            onOpenOrder={onOpenOrder}
          />
        </aside>
      </section>

      {detailLoading || selectedOrder ? (
        <PrintOrderDetailModal
          order={selectedOrder}
          detailLoading={detailLoading}
          actionLoading={actionLoading}
          onAdvanceStatus={onAdvanceStatus}
          onOpenCancel={onOpenCancel}
          onClose={onCloseOrderDetail}
        />
      ) : null}
    </main>
  );
}

function PrintOrderDetailModal({
  order,
  detailLoading,
  actionLoading,
  onAdvanceStatus,
  onOpenCancel,
  onClose,
}: {
  order: PrintOrderDetail | null;
  detailLoading: boolean;
  actionLoading: boolean;
  onAdvanceStatus?: () => void;
  onOpenCancel?: () => void;
  onClose: () => void;
}) {
  if (detailLoading) {
    return (
      <div className="modal-backdrop" role="presentation">
        <section className="modal print-order-detail-modal" role="dialog" aria-modal="true" aria-labelledby="print-order-detail-title">
          <div className="modal-title-row">
            <div>
              <h2 id="print-order-detail-title">주문 상세</h2>
              <p>주문 상세를 불러오는 중입니다.</p>
            </div>
            <button className="icon-button" type="button" onClick={onClose} aria-label="닫기">
              <X size={18} />
            </button>
          </div>
          <div className="book-empty-state">주문 상세를 불러오는 중입니다.</div>
        </section>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const nextStatus = nextPrintOrderStatus(order.status);
  const preview = buildPrintOrderPreview(order);
  const hasActions = Boolean(onAdvanceStatus || onOpenCancel);

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal print-order-detail-modal" role="dialog" aria-modal="true" aria-labelledby="print-order-detail-title">
        <div className="modal-title-row">
          <div>
            <span className={`book-order-status-badge ${printOrderStatusTone(order.status)}`}>{order.statusLabel}</span>
            <h2 id="print-order-detail-title">{order.title}</h2>
            <p>{order.orderNo}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="닫기" disabled={actionLoading}>
            <X size={18} />
          </button>
        </div>

        <div className="print-order-detail-body">
          <section className="print-order-detail-summary" aria-labelledby="print-order-summary-title">
            <div className="order-detail-section-heading">
              <h3 id="print-order-summary-title">주문 정보</h3>
            </div>
            <dl className="book-order-detail-list">
              <div>
                <dt>주문자</dt>
                <dd>{order.memberName}</dd>
              </div>
              <div>
                <dt>방</dt>
                <dd>{order.roomName}</dd>
              </div>
              <div>
                <dt>상품</dt>
                <dd>{order.product.displayName}</dd>
              </div>
              <div>
                <dt>기간</dt>
                <dd>{formatDateLabel(order.period.startDate)} ~ {formatDateLabel(order.period.endDate)}</dd>
              </div>
              <div>
                <dt>페이지/수량</dt>
                <dd>{order.estimatedPageCount}p · {order.quantity}권</dd>
              </div>
              <div className="total">
                <dt>총액</dt>
                <dd>{formatCurrency(order.totalPrice)}</dd>
              </div>
            </dl>

            {hasActions ? (
              <div className="operator-order-actions">
                {onAdvanceStatus ? (
                  <button className="primary-button" type="button" onClick={onAdvanceStatus} disabled={!nextStatus || actionLoading}>
                    {nextStatus ? `다음 상태: ${printOrderStatusLabel(nextStatus)}` : "다음 상태 없음"}
                  </button>
                ) : null}
                {onOpenCancel ? (
                  <button className="danger-button" type="button" onClick={onOpenCancel} disabled={!canCancelPrintOrder(order.status) || actionLoading}>
                    주문 취소
                  </button>
                ) : null}
              </div>
            ) : null}

            {order.cancelReason ? (
              <div className="book-order-cancel-reason">
                <strong>취소 사유</strong>
                <p>{order.cancelReason}</p>
              </div>
            ) : null}
          </section>

          <OrderStatusProgress order={order} />

          <OrderStatusEventList histories={order.statusHistories} />

          <div className="book-order-subsection">
            <div className="order-detail-section-heading">
              <h3>담긴 콘텐츠 미리보기</h3>
              <span>{order.contents.length}개 · {order.estimatedPageCount}p</span>
            </div>
            <BookTemplatePreviewViewer preview={preview} className="print-order-preview-viewer" />
          </div>
        </div>
      </section>
    </div>
  );
}

function Sidebar({
  activeView,
  rooms,
  selectedRoomId,
  expandedRoomId,
  roomListExpanded,
  bookMenuExpanded,
  collapsed,
  pendingInvitationCount,
  onMove,
  onOpenRoomList,
  onToggleRoomList,
  onToggleBookMenu,
  onSelectRoom,
  onMoveRoomFeature,
  onToggleSidebar,
}: {
  activeView: AppView;
  rooms: RoomSummary[];
  selectedRoomId: number | null;
  expandedRoomId: number | null;
  roomListExpanded: boolean;
  bookMenuExpanded: boolean;
  collapsed: boolean;
  pendingInvitationCount: number;
  onMove: (view: AppView) => void;
  onOpenRoomList: () => void;
  onToggleRoomList: () => void;
  onToggleBookMenu: () => void;
  onSelectRoom: (roomId: number, nextView?: AppView) => void;
  onMoveRoomFeature: (roomId: number, view: RoomFeatureKind) => void;
  onToggleSidebar: () => void;
}) {
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? rooms[0] ?? null;
  const bookMenuActive = isBookArchiveView(activeView);

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
          <div className={`nav-item-combo ${activeView === "rooms" ? "active" : ""} ${roomListExpanded ? "is-expanded" : ""}`}>
            <button className="nav-item room-list-nav" type="button" aria-label="방 리스트" onClick={onOpenRoomList}>
              <List size={18} />
              <span className="nav-label">방 리스트</span>
              {pendingInvitationCount > 0 ? (
                <span className="count-badge" aria-label={`대기 중인 초대 ${pendingInvitationCount}개`}>
                  {pendingInvitationCount}
                </span>
              ) : null}
            </button>
            <button className="nav-icon-toggle" type="button" aria-label={roomListExpanded ? "방 목록 접기" : "방 목록 펼치기"} aria-expanded={roomListExpanded} onClick={onToggleRoomList}>
              <ChevronDown size={16} />
            </button>
          </div>

          <div className={`room-list-tree ${roomListExpanded ? "is-open" : ""}`} aria-hidden={!roomListExpanded}>
            {rooms.map((room) => {
              const isSelected = room.id === selectedRoom?.id;
              const isExpanded = roomListExpanded && room.id === expandedRoomId && !collapsed;

              return (
                <div className={`room-entry ${isSelected ? "selected-room" : ""}`} key={room.id}>
                  <button
                    className={`nav-item room-list-item ${isSelected ? "room-selected" : "muted"} ${isExpanded ? "is-expanded" : ""}`}
                    type="button"
                    title={room.name}
                    tabIndex={roomListExpanded ? 0 : -1}
                    aria-label={`${room.name} ${isExpanded ? "메뉴 접기" : "메뉴 펼치기"}`}
                    aria-expanded={isExpanded}
                    onClick={() => onSelectRoom(room.id, "room")}
                  >
                    <UsersRound className="room-icon-expanded" size={18} />
                    <span className="room-initial-badge" aria-hidden="true">
                      {roomInitial(room.name)}
                    </span>
                    <span className="nav-label">{room.name}</span>
                    <ChevronDown size={16} />
                  </button>

                  <div className={`room-submenu ${isExpanded ? "is-open" : ""}`} aria-hidden={!isExpanded}>
                    <button className={activeView === "chat" && isSelected ? "active" : ""} type="button" tabIndex={isExpanded ? 0 : -1} onClick={() => onMoveRoomFeature(room.id, "chat")}>
                      <MessageCircle size={16} />
                      <span className="nav-label">채팅</span>
                      {room.unreadChatCount > 0 ? (
                        <span className="count-badge" aria-label={`읽지 않은 채팅 ${room.unreadChatCount}개`}>
                          {room.unreadChatCount}
                        </span>
                      ) : null}
                    </button>
                    <button className={activeView === "memories" && isSelected ? "active" : ""} type="button" tabIndex={isExpanded ? 0 : -1} onClick={() => onMoveRoomFeature(room.id, "memories")}>
                      <BookOpen size={16} />
                      <span className="nav-label">추억 게시판</span>
                      {room.unreadMemoryCount > 0 ? (
                        <span className="count-badge" aria-label={`읽지 않은 추억 ${room.unreadMemoryCount}개`}>
                          {room.unreadMemoryCount}
                        </span>
                      ) : null}
                    </button>
                    <button className={activeView === "missions" && isSelected ? "active" : ""} type="button" tabIndex={isExpanded ? 0 : -1} onClick={() => onMoveRoomFeature(room.id, "missions")}>
                      <CheckCircle2 size={16} />
                      <span className="nav-label">미션 인증</span>
                      {room.pendingMissionCount > 0 ? (
                        <span className="count-badge" aria-label={`확인할 미션 ${room.pendingMissionCount}개`}>
                          {room.pendingMissionCount}
                        </span>
                      ) : null}
                    </button>
                    <button className={activeView === "letters" && isSelected ? "active" : ""} type="button" tabIndex={isExpanded ? 0 : -1} onClick={() => onMoveRoomFeature(room.id, "letters")}>
                      <Mail size={16} />
                      <span className="nav-label">편지</span>
                      {room.unreadLetterCount > 0 ? (
                        <span className="count-badge" aria-label={`읽지 않은 편지 ${room.unreadLetterCount}개`}>
                          {room.unreadLetterCount}
                        </span>
                      ) : null}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={`nav-item-combo book-nav-combo ${bookMenuActive ? "active" : ""} ${bookMenuExpanded ? "is-expanded" : ""}`}>
            <button className="nav-item room-list-nav" type="button" aria-label="추억을 책으로 소장" onClick={() => onMove("bookProducts")}>
              <BookOpen size={18} />
              <span className="nav-label">추억을 책으로 소장</span>
            </button>
            <button className="nav-icon-toggle" type="button" aria-label={bookMenuExpanded ? "책 메뉴 접기" : "책 메뉴 펼치기"} aria-expanded={bookMenuExpanded} onClick={onToggleBookMenu}>
              <ChevronDown size={16} />
            </button>
          </div>

          <div className={`room-submenu book-submenu ${bookMenuExpanded && !collapsed ? "is-open" : ""}`} aria-hidden={!bookMenuExpanded || collapsed}>
            <button className={activeView === "bookProducts" ? "active" : ""} type="button" tabIndex={bookMenuExpanded && !collapsed ? 0 : -1} onClick={() => onMove("bookProducts")}>
              <CircleHelp size={16} />
              <span className="nav-label">상품 안내</span>
            </button>
            <button className={activeView === "bookCreate" ? "active" : ""} type="button" tabIndex={bookMenuExpanded && !collapsed ? 0 : -1} onClick={() => onMove("bookCreate")}>
              <BookImage size={16} />
              <span className="nav-label">책 만들기</span>
            </button>
            <button className={activeView === "bookStatus" ? "active" : ""} type="button" tabIndex={bookMenuExpanded && !collapsed ? 0 : -1} onClick={() => onMove("bookStatus")}>
              <Clock size={16} />
              <span className="nav-label">주문 상태</span>
            </button>
            <button className={activeView === "bookHistory" ? "active" : ""} type="button" tabIndex={bookMenuExpanded && !collapsed ? 0 : -1} onClick={() => onMove("bookHistory")}>
              <FileText size={16} />
              <span className="nav-label">주문 내역</span>
            </button>
          </div>
        </nav>
      </div>

      <button className={`nav-item settings-active ${activeView === "settings" ? "active" : ""}`} type="button" aria-label="설정" onClick={() => onMove("settings")}>
        <Settings size={18} />
        <span className="nav-label">설정</span>
      </button>
    </aside>
  );
}

function roomInitial(name: string) {
  return Array.from(name.trim())[0] ?? "?";
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

function BookPeriodRangeCalendar({
  calendar,
  period,
  rangeAnchor,
  disabled,
  onDateSelect,
}: {
  calendar: CalendarResponse;
  period: BookPeriod;
  rangeAnchor: string | null;
  disabled: boolean;
  onDateSelect: (date: string) => void;
}) {
  const days = useMemo(() => buildCalendarCells(calendar.month), [calendar.month]);
  const activityByDate = useMemo(() => new Map(calendar.days.map((day) => [day.date, day])), [calendar.days]);
  const rangeStart = period.startDate <= period.endDate ? period.startDate : period.endDate;
  const rangeEnd = period.startDate <= period.endDate ? period.endDate : period.startDate;

  return (
    <div className="book-range-calendar" aria-label="책에 담을 기록 기간 캘린더">
      <div className="book-range-calendar-header">
        <div>
          <strong>{formatMonthLabel(calendar.month)}</strong>
          <p>{rangeAnchor ? `${formatDateLabel(rangeAnchor)}부터 끝 날짜를 선택하세요.` : "캘린더에서 시작일과 종료일을 차례로 선택하세요."}</p>
        </div>
        <div className="calendar-legend" aria-label="기록 유형 범례">
          <span><ActivityIcon type="chat" />채팅</span>
          <span><ActivityIcon type="mission" />미션</span>
          <span><ActivityIcon type="memory" />추억</span>
          <span><ActivityIcon type="letter" />편지</span>
        </div>
      </div>

      <div className="book-range-weekdays" aria-hidden="true">
        {["일", "월", "화", "수", "목", "금", "토"].map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>
      <div className="book-range-grid">
        {days.map((cell, index) => {
          const cellDate = cell.date;
          if (!cellDate) {
            return <span className="book-range-day empty" key={`book-empty-${index}`} />;
          }

          const activity = activityByDate.get(cellDate) ?? null;
          const isStart = cellDate === rangeStart;
          const isEnd = cellDate === rangeEnd;
          const isInRange = cellDate >= rangeStart && cellDate <= rangeEnd;
          const isAnchor = cellDate === rangeAnchor;

          return (
            <button
              className={`book-range-day ${activity ? "has-activity" : ""} ${isInRange ? "in-range" : ""} ${isStart ? "range-start" : ""} ${isEnd ? "range-end" : ""} ${isAnchor ? "range-anchor" : ""}`}
              type="button"
              key={cellDate}
              onClick={() => onDateSelect(cellDate)}
              disabled={disabled}
              aria-pressed={isInRange}
            >
              <span>{cell.dayNumber}</span>
              {activity ? <ActivityDots activity={activity} /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest("button, input, select, textarea, a"));
}

function HelpButton({ title, message }: { title: string; message: string }) {
  return (
    <span className="help-tooltip-wrap">
      <span
        className="help-icon-button"
        tabIndex={0}
        aria-label={`${title} 도움말`}
      >
        <CircleHelp size={16} />
      </span>
      <span className="help-tooltip" role="tooltip">
        <strong>{title}</strong>
        <span>{message}</span>
      </span>
    </span>
  );
}

function RoomHomeView({
  selectedRoom,
  messages,
  draft,
  loading,
  sending,
  onDraftChange,
  onSend,
  onOpenRoomSettings,
  onMoveRoomFeature,
}: {
  selectedRoom: RoomSummary | null;
  messages: ChatMessage[];
  draft: string;
  loading: boolean;
  sending: boolean;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onOpenRoomSettings: () => void;
  onMoveRoomFeature: (view: RoomFeatureKind) => void;
}) {
  if (!selectedRoom) {
    return (
      <>
        <header className="page-header">
          <div>
            <h1>방 홈</h1>
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
        </div>
      </header>

      <section className="room-home-page">
        <article className="room-home-summary">
          <div>
            <span>{roomTypeLabel(selectedRoom.type)}</span>
            <h2>{selectedRoom.name}</h2>
            <p>{selectedRoom.description ?? "설명 없음"}</p>
          </div>
          <div className="room-home-control">
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
            <button className="room-settings-button" type="button" aria-label="방 설정 열기" onClick={onOpenRoomSettings}>
              <Settings size={22} />
            </button>
          </div>
        </article>

        <div className="room-home-content">
          <article className="room-chat-preview">
            <div className="room-section-heading">
              <div className="heading-help-row">
                <h2>최근 대화</h2>
                <HelpButton title="최근 대화" message="방 구성원이 남긴 최근 메시지를 확인하고 바로 새 메시지를 남길 수 있습니다." />
              </div>
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
              <div className="heading-help-row">
                <h2>방 기능</h2>
                <HelpButton title="방 기능" message="추억 게시판, 미션 인증, 편지 화면으로 이동해 방의 기록을 기능별로 확인합니다." />
              </div>
            </div>
            <div className="room-feature-list">
              <button className="room-feature-card memory" type="button" onClick={() => onMoveRoomFeature("memories")}>
                <span className="room-feature-icon"><BookImage size={32} /></span>
                <span>
                  <strong>추억 게시판</strong>
                </span>
                <span aria-hidden="true">›</span>
              </button>
              <button className="room-feature-card mission" type="button" onClick={() => onMoveRoomFeature("missions")}>
                <span className="room-feature-icon"><BadgeCheck size={32} /></span>
                <span>
                  <strong>미션 인증</strong>
                </span>
                <span aria-hidden="true">›</span>
              </button>
              <button className="room-feature-card letter" type="button" onClick={() => onMoveRoomFeature("letters")}>
                <span className="room-feature-icon"><MailPlus size={32} /></span>
                <span>
                  <strong>편지</strong>
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
  inviteSearchingRoomId,
  onCreateRoomFormChange,
  onCreateRoom,
  onInviteContactChange,
  onSearchInvitees,
  onRespondInvitation,
  onSelectRoom,
}: {
  rooms: RoomSummary[];
  selectedRoomId: number | null;
  pendingInvitationCount: number;
  pendingInvitations: PendingRoomInvitation[];
  createRoomForm: CreateRoomForm;
  inviteContacts: Record<number, string>;
  inviteSearchingRoomId: number | null;
  onCreateRoomFormChange: (form: CreateRoomForm) => void;
  onCreateRoom: () => void;
  onInviteContactChange: (roomId: number, value: string) => void;
  onSearchInvitees: (roomId: number) => void;
  onRespondInvitation: (invitationId: number, action: "accept" | "decline") => void;
  onSelectRoom: (roomId: number) => void;
}) {
  return (
    <>
      <header className="page-header">
        <div>
          <h1>방 리스트</h1>
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
          <div className="hub-card-heading">
            <span>참여 방</span>
            <HelpButton title="참여 방" message="현재 선택한 사용자가 참여 중인 방입니다. 방장인 방에서는 사용자를 검색한 뒤 초대 대상을 선택할 수 있습니다." />
          </div>
          <strong>{rooms.length}개</strong>
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
              <div className="room-card-actions">
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
                <div className="invite-search-area" onClick={(event) => event.stopPropagation()}>
                  <div className={`invite-inline-form ${canInvite ? "" : "is-disabled"}`}>
                    <input
                      value={canInvite ? inviteContacts[room.id] ?? "" : ""}
                      onChange={(event) => onInviteContactChange(room.id, event.target.value)}
                      onKeyDown={(event) => {
                        if (!canInvite || event.key !== "Enter") return;
                        event.preventDefault();
                        onSearchInvitees(room.id);
                      }}
                      placeholder="이름, 아이디, 이메일 또는 전화번호로 검색"
                      aria-label={`${room.name} 초대 대상 검색`}
                      disabled={!canInvite}
                    />
                    <button
                      className="primary-button"
                      type="button"
                      onClick={() => onSearchInvitees(room.id)}
                      disabled={!canInvite || inviteSearchingRoomId === room.id}
                    >
                      {inviteSearchingRoomId === room.id ? "검색 중" : "검색"}
                    </button>
                  </div>
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
            <div className="heading-help-row">
              <h2>대화 검색</h2>
              <HelpButton title="대화 검색" message="검색 결과를 선택하면 해당 메시지 위치로 이동합니다." />
            </div>
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

function MemoryBoardView({
  selectedRoom,
  posts,
  selectedPost,
  form,
  commentDraft,
  loading,
  detailLoading,
  creating,
  imageUploading,
  commentSending,
  onFormChange,
  onImageUpload,
  onImageClear,
  onCommentDraftChange,
  onCreatePost,
  onOpenPost,
  onOpenEdit,
  onOpenDelete,
  onCreateComment,
}: {
  selectedRoom: RoomSummary | null;
  posts: MemoryPostSummary[];
  selectedPost: MemoryPostDetail | null;
  form: MemoryPostForm;
  commentDraft: string;
  loading: boolean;
  detailLoading: boolean;
  creating: boolean;
  imageUploading: boolean;
  commentSending: boolean;
  onFormChange: (form: MemoryPostForm) => void;
  onImageUpload: (file: File) => void;
  onImageClear: () => void;
  onCommentDraftChange: (value: string) => void;
  onCreatePost: () => void;
  onOpenPost: (memoryId: number) => void;
  onOpenEdit: () => void;
  onOpenDelete: () => void;
  onCreateComment: () => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(posts.length / memoryPostsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const visiblePosts = posts.slice((safePage - 1) * memoryPostsPerPage, safePage * memoryPostsPerPage);
  const uploadInputId = `memory-image-upload-${selectedRoom?.id ?? "none"}`;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRoom?.id, posts.length]);

  function handleImageDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      onImageUpload(file);
    }
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1>추억 게시판</h1>
        </div>
      </header>

      <section className="memory-page">
        <div className="memory-main-column">
          <article className="memory-compose-card">
            <div className="room-section-heading">
              <div className="heading-help-row">
                <h2>추억 남기기</h2>
                <HelpButton title="추억 남기기" message="노트북의 사진을 선택하고 글을 입력해 방의 추억을 남깁니다." />
              </div>
            </div>
            <div className="memory-form">
              <label>
                제목
                <input
                  value={form.title}
                  onChange={(event) => onFormChange({ ...form, title: event.target.value })}
                  placeholder="예: 카페에서 찍은 사진"
                />
              </label>
              <label>
                날짜
                <input
                  type="date"
                  value={form.occurredDate}
                  onChange={(event) => onFormChange({ ...form, occurredDate: event.target.value })}
                />
              </label>
              <div
                className={`memory-upload-dropzone memory-form-wide ${form.representativeImageUrl ? "has-image" : ""}`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleImageDrop}
              >
                <input
                  id={uploadInputId}
                  type="file"
                  accept="image/*"
                  disabled={!selectedRoom || imageUploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      onImageUpload(file);
                    }
                    event.currentTarget.value = "";
                  }}
                />
                <UploadCloud size={28} />
                <div>
                  <strong>{imageUploading ? "이미지 업로드 중" : "사진을 끌어놓거나 파일을 선택하세요"}</strong>
                  <span>jpg, png, gif, webp · 5MB 이하</span>
                </div>
                <label className="outline-button upload-pick-button" htmlFor={uploadInputId}>
                  파일 선택
                </label>
              </div>
              {form.representativeImageUrl ? (
                <div className="memory-upload-preview memory-form-wide">
                  <MemoryImage imageUrl={form.representativeImageUrl} title={form.representativeImageName || "선택한 이미지"} />
                  <div>
                    <strong>{form.representativeImageName || "선택한 이미지"}</strong>
                  </div>
                  <button className="icon-button" type="button" onClick={onImageClear} aria-label="선택 이미지 제거">
                    <X size={18} />
                  </button>
                </div>
              ) : null}
              <label className="memory-form-wide">
                내용
                <textarea
                  value={form.body}
                  onChange={(event) => onFormChange({ ...form, body: event.target.value })}
                  placeholder="사진에 담긴 상황과 감정을 남겨주세요."
                  rows={4}
                />
              </label>
            </div>
            <button className="primary-button full-width" type="button" onClick={onCreatePost} disabled={!selectedRoom || creating}>
              {creating ? "등록 중" : "추억 등록"}
            </button>
          </article>

          <article className="memory-list-panel">
            <div className="memory-list-heading">
              <div>
                <h2>추억 목록</h2>
                <p>{loading ? "추억을 불러오는 중입니다." : `${posts.length}개의 추억이 있습니다. ${safePage}/${totalPages} 페이지`}</p>
              </div>
              <BookImage size={24} />
            </div>
            <div className="memory-post-grid">
              {!loading && posts.length === 0 ? <p className="empty-state">아직 남긴 추억이 없습니다.</p> : null}
              {visiblePosts.map((post) => (
                <button
                  className={`memory-post-card ${selectedPost?.id === post.id ? "selected" : ""}`}
                  type="button"
                  key={post.id}
                  onClick={() => onOpenPost(post.id)}
                >
                  <MemoryImage imageUrl={post.representativeImageUrl} title={post.title} />
                  <span>{formatDateLabel(post.occurredDate)}</span>
                  <strong>{post.title}</strong>
                  <p>{post.bodyPreview}</p>
                  <small>{post.authorName} · 댓글 {post.commentCount}개</small>
                </button>
              ))}
            </div>
            {posts.length > memoryPostsPerPage ? (
              <div className="memory-pagination" aria-label="추억 목록 페이지 이동">
                <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={safePage === 1}>
                  이전
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button className={safePage === page ? "active" : ""} type="button" key={page} onClick={() => setCurrentPage(page)}>
                    {page}
                  </button>
                ))}
                <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={safePage === totalPages}>
                  다음
                </button>
              </div>
            ) : null}
          </article>
        </div>

        <aside className="memory-detail-panel">
          <div className="memory-detail-header">
            <div>
              <span>선택한 추억</span>
              <h2>{selectedPost?.title ?? "게시글을 선택하세요"}</h2>
            </div>
            <div className="memory-detail-header-side">
              <BookImage size={24} />
              {selectedPost?.mine ? (
                <div className="memory-detail-actions" aria-label="추억 게시글 관리">
                  <button className="memory-action-button" type="button" onClick={onOpenEdit}>
                    <Pencil size={15} />
                    수정
                  </button>
                  <button className="memory-action-button danger" type="button" onClick={onOpenDelete}>
                    <Trash2 size={15} />
                    삭제
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          {detailLoading ? <p className="empty-state">상세 내용을 불러오는 중입니다.</p> : null}
          {!detailLoading && selectedPost ? (
            <>
              <MemoryImage imageUrl={selectedPost.representativeImageUrl} title={selectedPost.title} large />
              <div className="memory-detail-meta">
                <span>{selectedPost.authorName}</span>
                <span>{formatDateLabel(selectedPost.occurredDate)}</span>
                <span>댓글 {selectedPost.commentCount}개</span>
              </div>
              <p className="memory-detail-body">{selectedPost.body}</p>
              <div className="memory-comments">
                <h3>댓글</h3>
                <div className="memory-comment-list">
                  {selectedPost.comments.length === 0 ? <p className="empty-state">아직 댓글이 없습니다.</p> : null}
                  {selectedPost.comments.map((comment) => (
                    <div className={`memory-comment-row ${comment.mine ? "mine" : "other"}`} key={comment.id}>
                      <div className="memory-comment-meta">
                        <strong>{comment.authorName}</strong>
                        <span>{formatChatTime(comment.createdAt)}</span>
                      </div>
                      <div className="memory-comment-bubble">
                        <p>{comment.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="memory-comment-form">
                <textarea
                  value={commentDraft}
                  onChange={(event) => onCommentDraftChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.nativeEvent.isComposing || event.key !== "Enter" || event.shiftKey) return;
                    event.preventDefault();
                    onCreateComment();
                  }}
                  placeholder="댓글을 남겨주세요."
                  rows={2}
                />
                <button className="primary-button" type="button" onClick={onCreateComment} disabled={commentSending}>
                  {commentSending ? "등록 중" : "댓글 등록"}
                </button>
              </div>
            </>
          ) : null}
          {!detailLoading && !selectedPost ? <p className="empty-state">왼쪽 목록에서 확인할 추억을 선택하세요.</p> : null}
        </aside>
      </section>
    </>
  );
}

function MemoryImage({ imageUrl, title, large = false }: { imageUrl: string | null; title: string; large?: boolean }) {
  if (!imageUrl) {
    return (
      <div className={`memory-image-placeholder ${large ? "large" : ""}`}>
        <BookImage size={large ? 36 : 26} />
      </div>
    );
  }

  return (
    <img className={`memory-image ${large ? "large" : ""}`} src={resolveImageSource(imageUrl)} alt={`${title} 대표 이미지`} />
  );
}

function LetterBoardView({
  selectedRoom,
  box,
  recipients,
  letters,
  selectedLetter,
  form,
  loading,
  detailLoading,
  loadingMore,
  hasMore,
  totalCount,
  sending,
  composeOpen,
  onBoxChange,
  onFormChange,
  onOpenCompose,
  onCloseCompose,
  onSendLetter,
  onLoadMore,
  onOpenLetter,
}: {
  selectedRoom: RoomSummary | null;
  box: LetterBox;
  recipients: LetterRecipient[];
  letters: LetterSummary[];
  selectedLetter: LetterDetail | null;
  form: LetterForm;
  loading: boolean;
  detailLoading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  totalCount: number;
  sending: boolean;
  composeOpen: boolean;
  onBoxChange: (box: LetterBox) => void;
  onFormChange: (form: LetterForm) => void;
  onOpenCompose: () => void;
  onCloseCompose: () => void;
  onSendLetter: () => void;
  onLoadMore: () => void;
  onOpenLetter: (letterId: number) => void;
}) {
  return (
    <>
      <header className="page-header">
        <div>
          <h1>편지</h1>
        </div>
      </header>

      <section className="letter-page">
        <div className="letter-main-column">
          <article className="letter-list-panel">
            <div className="letter-list-heading">
              <div>
                <h2>편지함</h2>
                <p>{loading ? "편지를 불러오는 중입니다." : `${totalCount}개의 ${letterBoxTitle(box)}가 있습니다.`}</p>
              </div>
              <button className="letter-compose-open-button" type="button" onClick={onOpenCompose} disabled={!selectedRoom}>
                <MailPlus size={18} />
                <span>+ 편지 보내기</span>
              </button>
            </div>
            <div className="letter-box-tabs" role="tablist" aria-label="편지함 선택">
              <button className={box === "RECEIVED" ? "active" : ""} type="button" onClick={() => onBoxChange("RECEIVED")}>
                받은 편지
              </button>
              <button className={box === "SENT" ? "active" : ""} type="button" onClick={() => onBoxChange("SENT")}>
                보낸 편지
              </button>
            </div>
            <div className="letter-card-list">
              {!loading && letters.length === 0 ? <p className="empty-state">아직 편지가 없습니다.</p> : null}
              {letters.map((letter) => (
                <button
                  className={`letter-card ${selectedLetter?.id === letter.id ? "selected" : ""} ${letter.read || box === "SENT" ? "read" : "unread"}`}
                  type="button"
                  key={letter.id}
                  onClick={() => onOpenLetter(letter.id)}
                >
                  <div className="letter-card-top">
                    <span>{box === "SENT" ? "받는 사람" : "보낸 사람"} · {letter.counterpartName}</span>
                    {!letter.read && box === "RECEIVED" ? <strong>NEW</strong> : null}
                  </div>
                  <h3>{letter.title}</h3>
                  <p>{letter.bodyPreview}</p>
                  <small>{formatDateLabel(letter.occurredDate)} · {formatChatTime(letter.sentAt)}</small>
                </button>
              ))}
            </div>
            {hasMore ? (
              <button className="letter-more-button" type="button" onClick={onLoadMore} disabled={loadingMore}>
                {loadingMore ? <span className="letter-loading-spinner" aria-hidden="true" /> : null}
                {loadingMore ? "불러오는 중" : "더 보기"}
              </button>
            ) : null}
          </article>
        </div>

        <aside className="letter-detail-panel">
          <div className="letter-detail-header">
            <div>
              <span>선택한 편지</span>
              <h2>{selectedLetter?.title ?? "편지를 선택하세요"}</h2>
            </div>
            <Mail size={24} />
          </div>
          {detailLoading ? <p className="empty-state">편지 내용을 불러오는 중입니다.</p> : null}
          {!detailLoading && selectedLetter ? (
            <>
              <div className="letter-paper">
                <div className="letter-paper-meta">
                  <span>보낸 사람</span>
                  <strong>{selectedLetter.senderName}</strong>
                </div>
                <div className="letter-paper-meta">
                  <span>받는 사람</span>
                  <strong>{selectedLetter.receiverName}</strong>
                </div>
                <p>{selectedLetter.body}</p>
              </div>
              <div className="letter-detail-info">
                <span>{formatDateLabel(selectedLetter.occurredDate)}</span>
                <span>{formatChatTime(selectedLetter.sentAt)}</span>
                <span>{selectedLetter.mine ? "보낸 편지" : selectedLetter.read ? "읽은 편지" : "새 편지"}</span>
              </div>
            </>
          ) : null}
          {!detailLoading && !selectedLetter ? <p className="empty-state">왼쪽 편지함에서 읽을 편지를 선택하세요.</p> : null}
        </aside>
      </section>

      {composeOpen ? (
        <LetterComposeModal
          selectedRoom={selectedRoom}
          recipients={recipients}
          form={form}
          sending={sending}
          onFormChange={onFormChange}
          onSendLetter={onSendLetter}
          onClose={onCloseCompose}
        />
      ) : null}
    </>
  );
}

function LetterComposeModal({
  selectedRoom,
  recipients,
  form,
  sending,
  onFormChange,
  onSendLetter,
  onClose,
}: {
  selectedRoom: RoomSummary | null;
  recipients: LetterRecipient[];
  form: LetterForm;
  sending: boolean;
  onFormChange: (form: LetterForm) => void;
  onSendLetter: () => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal letter-compose-modal" role="dialog" aria-modal="true" aria-labelledby="letter-compose-title">
        <h2 id="letter-compose-title">편지 보내기</h2>
        <div className="letter-form letter-modal-form">
          <label>
            수신자
            <select
              value={form.receiverMemberId}
              onChange={(event) => onFormChange({ ...form, receiverMemberId: event.target.value })}
              disabled={!selectedRoom || recipients.length === 0}
            >
              <option value="">받는 사람 선택</option>
              {recipients.map((recipient) => (
                <option key={recipient.memberId} value={recipient.memberId}>
                  {recipient.displayName}
                </option>
              ))}
            </select>
          </label>
          <label>
            제목
            <input
              value={form.title}
              onChange={(event) => onFormChange({ ...form, title: event.target.value })}
              placeholder="예: 오늘 고마웠던 마음"
            />
          </label>
          <label>
            내용
            <textarea
              value={form.body}
              onChange={(event) => onFormChange({ ...form, body: event.target.value })}
              placeholder="상대에게 보내고 싶은 말을 편하게 남겨주세요."
              rows={6}
            />
          </label>
        </div>
        <div className="modal-actions">
          <button className="outline-button" type="button" onClick={onClose} disabled={sending}>
            취소
          </button>
          <button className="primary-button" type="button" onClick={onSendLetter} disabled={!selectedRoom || sending}>
            {sending ? "보내는 중" : "편지 보내기"}
          </button>
        </div>
      </section>
    </div>
  );
}

function MissionBoardView({
  selectedRoom,
  missionList,
  missionForm,
  submissionForm,
  commentDraft,
  createModalOpen,
  loading,
  creating,
  submitting,
  imageUploading,
  approvingSubmissionId,
  commentSending,
  onMissionFormChange,
  onSubmissionFormChange,
  onCommentDraftChange,
  onOpenCreateModal,
  onCloseCreateModal,
  onCreateMission,
  onImageUpload,
  onImageClear,
  onSubmitMission,
  onApproveSubmission,
  onCreateComment,
}: {
  selectedRoom: RoomSummary | null;
  missionList: MissionListResponse | null;
  missionForm: MissionForm;
  submissionForm: MissionSubmissionForm;
  commentDraft: string;
  createModalOpen: boolean;
  loading: boolean;
  creating: boolean;
  submitting: boolean;
  imageUploading: boolean;
  approvingSubmissionId: number | null;
  commentSending: boolean;
  onMissionFormChange: (form: MissionForm) => void;
  onSubmissionFormChange: (form: MissionSubmissionForm) => void;
  onCommentDraftChange: (value: string) => void;
  onOpenCreateModal: () => void;
  onCloseCreateModal: () => void;
  onCreateMission: () => void;
  onImageUpload: (file: File) => void;
  onImageClear: () => void;
  onSubmitMission: () => void;
  onApproveSubmission: (submissionId: number) => void;
  onCreateComment: () => void;
}) {
  const missions = missionList?.missions ?? [];
  const selectedMission = missions.find((mission) => mission.id === submissionForm.missionId) ?? missions[0] ?? null;
  const uploadInputId = `mission-image-upload-${selectedRoom?.id ?? "none"}`;
  const requiredApprovalCount = selectedRoom ? requiredMissionApprovals(selectedRoom.type, selectedRoom.memberCount) : 0;
  const inProgressMissionCount = missions.filter((mission) => mission.latestSubmission && mission.status !== "COMPLETED").length;
  const waitingApprovalMissionCount = missions.filter((mission) => mission.status === "WAITING_APPROVAL").length;

  useEffect(() => {
    if (!selectedMission || submissionForm.missionId === selectedMission.id) return;

    onSubmissionFormChange({ ...submissionForm, missionId: selectedMission.id });
  }, [selectedMission?.id]);

  function handleImageDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      onImageUpload(file);
    }
  }

  function selectMission(mission: MissionSummary) {
    onSubmissionFormChange({
      ...submissionForm,
      missionId: mission.id,
      body: "",
      imageUrl: "",
      imageName: "",
    });
    onCommentDraftChange("");
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1>미션 인증</h1>
        </div>
      </header>

      <section className="mission-page">
        <article className="mission-room-card">
          <div>
            <span>{selectedRoom ? roomTypeLabel(selectedRoom.type) : "기록방"}</span>
            <h2>{selectedRoom?.name ?? "방을 선택하세요"}</h2>
            <p>{missionList?.completionRule ?? "커플은 상대 동의, 가족/학급/동아리는 방장 승인 또는 과반 동의로 완료된다."}</p>
          </div>
          <div className="mission-room-metrics">
            <Metric label="전체 미션" value={`${missions.length}개`} />
            <Metric label="진행 중" value={`${inProgressMissionCount}개`} />
            <Metric label="승인 대기" value={`${waitingApprovalMissionCount}개`} />
            <Metric label="완료" value={`${missions.filter((mission) => mission.status === "COMPLETED").length}개`} />
          </div>
        </article>

        <div className="mission-grid">
          <div className="mission-main-column">
            <article className="mission-list-panel">
              <div className="memory-list-heading">
                <div>
                  <div className="heading-help-row">
                    <h2>미션 목록</h2>
                    <HelpButton title="미션 목록" message="방 타입에 맞는 기본 미션과 구성원이 직접 추가한 미션을 함께 확인합니다." />
                  </div>
                </div>
                <button className="primary-button mission-list-create-button" type="button" onClick={onOpenCreateModal} disabled={!selectedRoom}>
                  + 커스텀 미션 추가
                </button>
              </div>
              <div className="mission-card-grid">
                {!loading && missions.length === 0 ? <p className="empty-state">아직 미션이 없습니다.</p> : null}
                {missions.map((mission) => {
                  const visibleStatus = mission.latestSubmission ? mission.status : null;

                  return (
                    <button
                      className={`mission-card ${selectedMission?.id === mission.id ? "selected" : ""}`}
                      type="button"
                      key={mission.id}
                      onClick={() => selectMission(mission)}
                    >
                      <div className="mission-card-title">
                        {visibleStatus === "WAITING_APPROVAL" ? (
                          <span className="mission-status-group">
                            <span className="mission-status in-progress">진행 중</span>
                            <span className="mission-status waiting-approval">승인 대기</span>
                          </span>
                        ) : visibleStatus ? (
                          <span className={`mission-status ${visibleStatus.toLowerCase().replace("_", "-")}`}>{missionStatusLabel(visibleStatus)}</span>
                        ) : (
                          <span className="mission-status not-started">진행 전</span>
                        )}
                        {mission.custom ? <span className="mission-custom-badge">커스텀</span> : <span aria-hidden="true" />}
                      </div>
                      <strong>{mission.title}</strong>
                      <p>{mission.description}</p>
                      {mission.latestSubmission ? (
                        <small>
                          {mission.latestSubmission.submitterName} 인증 · 동의 {mission.latestSubmission.approvedCount}/{mission.latestSubmission.requiredApprovalCount}
                        </small>
                      ) : (
                        <small>아직 인증 전 · 동의 0/{requiredApprovalCount}</small>
                      )}
                    </button>
                  );
                })}
              </div>
            </article>
          </div>

          <aside className="mission-detail-panel">
            <div className="memory-detail-header">
              <div>
                <span>선택한 미션</span>
                <h2>{selectedMission?.title ?? "미션을 선택하세요"}</h2>
              </div>
              <BadgeCheck size={24} />
            </div>

            {selectedMission ? (
              <>
                <p className="mission-detail-description">{selectedMission.description}</p>

                {selectedMission.latestSubmission ? (
                  <section className="mission-proof-card">
                    <div className="mission-proof-heading">
                      <span className={`mission-status ${selectedMission.status.toLowerCase().replace("_", "-")}`}>
                        {missionStatusLabel(selectedMission.status)}
                      </span>
                      <small>{formatDateLabel(selectedMission.latestSubmission.occurredDate)}</small>
                    </div>
                    <MissionProofImage imageUrl={selectedMission.latestSubmission.imageUrl} title={selectedMission.title} />
                    <strong>{selectedMission.latestSubmission.submitterName}</strong>
                    <p>{selectedMission.latestSubmission.body}</p>
                    <div className="mission-progress-row">
                      <span>동의율 {selectedMission.latestSubmission.approvalRate}%</span>
                      <span>
                        {selectedMission.latestSubmission.approvedCount}/{selectedMission.latestSubmission.requiredApprovalCount}
                      </span>
                    </div>
                    <div className="mission-progress-track" aria-hidden="true">
                      <span style={{ width: `${Math.min(100, selectedMission.latestSubmission.approvalRate)}%` }} />
                    </div>
                    {selectedMission.latestSubmission.completed ? (
                      <div className="mission-complete-note">
                        <CheckCircle2 size={18} />
                        완료 조건을 만족한 미션입니다.
                      </div>
                    ) : selectedMission.latestSubmission.canApprove ? (
                      <button
                        className="primary-button full-width"
                        type="button"
                        onClick={() => onApproveSubmission(selectedMission.latestSubmission!.id)}
                        disabled={approvingSubmissionId === selectedMission.latestSubmission.id}
                      >
                        {approvingSubmissionId === selectedMission.latestSubmission.id ? "동의 중" : "인증 동의"}
                      </button>
                    ) : (
                      <p className="mission-muted-note">
                        {selectedMission.latestSubmission.mine ? "내가 올린 인증은 다른 구성원의 동의를 기다립니다." : "이미 처리했거나 동의할 수 없는 인증입니다."}
                      </p>
                    )}
                  </section>
                ) : (
                  <p className="empty-state">아직 제출된 인증이 없습니다. 아래에서 사진과 기록을 올려보세요.</p>
                )}

                {!selectedMission.latestSubmission ? (
                  <section className="mission-submit-card">
                    <div className="room-section-heading">
                      <div className="heading-help-row">
                        <h2>사진으로 인증하기</h2>
                        <HelpButton title="사진 인증" message="인증 사진은 필수이며, 제출 후 구성원 동의를 기다립니다." />
                      </div>
                    </div>
                    <div
                      className={`memory-upload-dropzone ${submissionForm.imageUrl ? "has-image" : ""}`}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={handleImageDrop}
                    >
                      <input
                        id={uploadInputId}
                        type="file"
                        accept="image/*"
                        disabled={!selectedRoom || imageUploading}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            onImageUpload(file);
                          }
                          event.currentTarget.value = "";
                        }}
                      />
                      <UploadCloud size={28} />
                      <div>
                        <strong>{imageUploading ? "사진 업로드 중" : "사진을 끌어놓거나 파일을 선택하세요"}</strong>
                        <span>jpg, png, gif, webp · 5MB 이하</span>
                      </div>
                      <label className="outline-button upload-pick-button" htmlFor={uploadInputId}>
                        파일 선택
                      </label>
                    </div>
                    {submissionForm.imageUrl ? (
                      <div className="mission-upload-preview">
                        <MissionProofImage imageUrl={submissionForm.imageUrl} title={submissionForm.imageName || selectedMission.title} />
                        <div>
                          <strong>{submissionForm.imageName || "선택한 사진"}</strong>
                          <button className="memory-action-button" type="button" onClick={onImageClear}>
                            선택 제거
                          </button>
                        </div>
                      </div>
                    ) : null}
                    <label className="mission-input-label">
                      날짜
                      <input
                        type="date"
                        value={submissionForm.occurredDate}
                        onChange={(event) => onSubmissionFormChange({ ...submissionForm, occurredDate: event.target.value })}
                      />
                    </label>
                    <label className="mission-input-label">
                      인증 내용
                      <textarea
                        value={submissionForm.body}
                        onChange={(event) => onSubmissionFormChange({ ...submissionForm, body: event.target.value })}
                        placeholder="사진으로 인증한 상황을 짧게 남겨주세요."
                        rows={4}
                      />
                    </label>
                    <button className="primary-button full-width" type="button" onClick={onSubmitMission} disabled={submitting}>
                      {submitting ? "요청 중" : "인증 요청"}
                    </button>
                  </section>
                ) : null}

                <section className="memory-comments mission-comments">
                  <h3>댓글</h3>
                  <div className="memory-comment-list mission-comment-list">
                    {selectedMission.comments.length === 0 ? <p className="empty-state">아직 댓글이 없습니다.</p> : null}
                    {selectedMission.comments.map((comment) => (
                      <div className={`memory-comment-row ${comment.mine ? "mine" : "other"}`} key={comment.id}>
                        <div className="memory-comment-meta">
                          <strong>{comment.authorName}</strong>
                          <span>{formatChatTime(comment.createdAt)}</span>
                        </div>
                        <div className="memory-comment-bubble">
                          <p>{comment.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                <div className="memory-comment-form mission-comment-form">
                  <textarea
                    value={commentDraft}
                    onChange={(event) => onCommentDraftChange(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.nativeEvent.isComposing || event.key !== "Enter" || event.shiftKey) return;
                      event.preventDefault();
                      onCreateComment();
                    }}
                    placeholder="댓글을 남겨주세요."
                    rows={2}
                  />
                  <button className="primary-button" type="button" onClick={onCreateComment} disabled={commentSending}>
                    {commentSending ? "등록 중" : "댓글 등록"}
                  </button>
                </div>
              </>
            ) : (
              <p className="empty-state">왼쪽 목록에서 미션을 선택하세요.</p>
            )}
          </aside>
        </div>
      </section>

      {createModalOpen ? (
        <MissionCreateModal
          missionForm={missionForm}
          creating={creating}
          onMissionFormChange={onMissionFormChange}
          onCreateMission={onCreateMission}
          onClose={onCloseCreateModal}
        />
      ) : null}
    </>
  );
}

function MissionCreateModal({
  missionForm,
  creating,
  onMissionFormChange,
  onCreateMission,
  onClose,
}: {
  missionForm: MissionForm;
  creating: boolean;
  onMissionFormChange: (form: MissionForm) => void;
  onCreateMission: () => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal mission-create-modal" role="dialog" aria-modal="true" aria-labelledby="mission-create-title">
        <div className="modal-title-row">
          <div>
            <h2 id="mission-create-title">커스텀 미션 추가</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </div>
        <div className="mission-create-form">
          <label>
            제목
            <input
              value={missionForm.title}
              onChange={(event) => onMissionFormChange({ ...missionForm, title: event.target.value })}
              placeholder="예: 주말 산책 사진"
            />
          </label>
          <label>
            설명
            <textarea
              value={missionForm.description}
              onChange={(event) => onMissionFormChange({ ...missionForm, description: event.target.value })}
              placeholder="사진으로 인증할 조건을 적어주세요."
              rows={4}
            />
          </label>
        </div>
        <div className="modal-actions">
          <button className="outline-button" type="button" onClick={onClose} disabled={creating}>
            취소
          </button>
          <button className="primary-button" type="button" onClick={onCreateMission} disabled={creating}>
            {creating ? "추가 중" : "미션 추가"}
          </button>
        </div>
      </section>
    </div>
  );
}

function MissionProofImage({ imageUrl, title }: { imageUrl: string; title: string }) {
  if (!imageUrl) {
    return (
      <div className="mission-proof-placeholder">
        <ImageIcon size={30} />
      </div>
    );
  }

  return <img className="mission-proof-image" src={resolveImageSource(imageUrl)} alt={`${title} 인증 사진`} />;
}

function RoomFeatureView({ selectedRoom, kind }: { selectedRoom: RoomSummary | null; kind: RoomFeatureKind }) {
  const copy = roomFeatureCopy(kind);

  return (
    <>
      <header className="page-header">
        <div>
          <h1>{copy.title}</h1>
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

function BookProductGuideView({
  products,
  loading,
  onStartCreate,
}: {
  products: BookProduct[];
  loading: boolean;
  onStartCreate: () => void;
}) {
  return (
    <>
      <header className="page-header">
        <div>
          <h1>상품 안내</h1>
          <p>상품별 상세 안내 페이지는 기획중입니다.</p>
        </div>
        <button className="primary-button" type="button" onClick={onStartCreate}>
          책 만들기
        </button>
      </header>

      <section className="book-page">
        <div className="book-placeholder-panel">
          <div>
            <span className="eyebrow">기획중</span>
            <h2>상품 상세 안내는 별도 화면으로 정리할 예정입니다.</h2>
            <p>현재 구현 범위에서는 책 만들기 과정의 상품 선택 카드에서 필요한 판형, 커버, 제본, 페이지 범위 정보를 제공합니다.</p>
          </div>
          <CircleHelp size={30} />
        </div>

        <div className="book-product-grid" aria-busy={loading}>
          {products.map((product) => (
            <article className="book-product-card" key={product.uid}>
              <div className="book-product-card-title">
                <BookOpen size={22} />
                <h2>{product.displayName}</h2>
              </div>
              <dl className="book-spec-list compact">
                <div>
                  <dt>판형</dt>
                  <dd>{product.widthMm} x {product.heightMm}mm</dd>
                </div>
                <div>
                  <dt>커버/제본</dt>
                  <dd>{coverLabel(product.coverType)} · {product.bindingType}</dd>
                </div>
                <div>
                  <dt>페이지</dt>
                  <dd>{product.minPage}~{product.maxPage}p</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function BookCreateView({
  rooms,
  products,
  calendar,
  selectedRoomId,
  selectedProductUid,
  activeStep,
  period,
  candidateContentTypes,
  title,
  quantity,
  contentCandidates,
  selectedContentKeys,
  selectedContents,
  allContents,
  contentFilter,
  contentOrderMode,
  contentTypeOrder,
  draftSummary,
  draftPageRange,
  preview,
  loading,
  candidatesLoading,
  previewLoading,
  onStepChange,
  onSelectRoom,
  onSelectProduct,
  onPeriodChange,
  onToggleCandidateContentType,
  onTitleChange,
  onQuantityChange,
  onContentFilterChange,
  onContentOrderModeChange,
  onMoveContentType,
  onLoadCandidates,
  onToggleContent,
  onOpenContentDetail,
  onCreatePreview,
  onOpenOrderConfirm,
}: {
  rooms: BookCreateRoom[];
  products: BookProduct[];
  calendar: CalendarResponse | null;
  selectedRoomId: number | null;
  selectedProductUid: string | null;
  activeStep: BookCreateStep;
  period: BookPeriod;
  candidateContentTypes: BookContentType[];
  title: string;
  quantity: number;
  contentCandidates: BookContentCandidatesResponse | null;
  selectedContentKeys: Record<string, boolean>;
  selectedContents: BookContentCandidate[];
  allContents: BookContentCandidate[];
  contentFilter: BookContentFilter;
  contentOrderMode: BookContentOrderMode;
  contentTypeOrder: BookContentType[];
  draftSummary: BookContentSummary;
  draftPageRange: BookPageRange | null;
  preview: BookPreviewResponse | null;
  loading: boolean;
  candidatesLoading: boolean;
  previewLoading: boolean;
  onStepChange: (step: BookCreateStep) => void;
  onSelectRoom: (roomId: number) => void;
  onSelectProduct: (productUid: string) => void;
  onPeriodChange: (period: BookPeriod) => void;
  onToggleCandidateContentType: (type: BookContentType) => void;
  onTitleChange: (title: string) => void;
  onQuantityChange: (quantity: number) => void;
  onContentFilterChange: (filter: BookContentFilter) => void;
  onContentOrderModeChange: (mode: BookContentOrderMode) => void;
  onMoveContentType: (type: BookContentType, direction: "UP" | "DOWN") => void;
  onLoadCandidates: () => void;
  onToggleContent: (content: BookContentCandidate) => void;
  onOpenContentDetail: (content: BookContentCandidate) => void;
  onCreatePreview: () => void;
  onOpenOrderConfirm: () => void;
}) {
  const selectedProduct = products.find((product) => product.uid === selectedProductUid) ?? null;
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? null;
  const periodCalendar = useMemo(() => buildBookPeriodCalendar(calendar, selectedRoomId), [calendar, selectedRoomId]);
  const [periodRangeAnchor, setPeriodRangeAnchor] = useState<string | null>(null);
  const canLoadCandidates = Boolean(selectedRoom && selectedProduct && period.startDate && period.endDate && period.startDate <= period.endDate && candidateContentTypes.length > 0);
  const canPreview = Boolean(selectedRoom && selectedProduct && selectedContents.length > 0 && draftPageRange?.status !== "OVER_MAX");
  const steps: Array<{ key: BookCreateStep; label: string }> = [
    { key: "room", label: "방 선택" },
    { key: "product", label: "상품 선택" },
    { key: "period", label: "기간 선택" },
    { key: "content", label: "기록 선택" },
    { key: "preview", label: "미리보기" },
  ];

  const canEnterStep = (step: BookCreateStep) => {
    if (step === "room") return true;
    if (step === "product") return Boolean(selectedRoom);
    if (step === "period") return Boolean(selectedRoom && selectedProduct);
    if (step === "content") return Boolean(selectedRoom && selectedProduct && contentCandidates);
    return Boolean(preview);
  };
  const isStepCompleted = (step: BookCreateStep) => {
    if (step === "room") return Boolean(selectedRoom);
    if (step === "product") return Boolean(selectedProduct);
    if (step === "period") return Boolean(contentCandidates);
    if (step === "content") return canPreview;
    return Boolean(preview);
  };
  const stepSummary = (step: BookCreateStep) => {
    if (step === "room") return selectedRoom?.name ?? "선택 전";
    if (step === "product") return selectedProduct?.displayName ?? "선택 전";
    if (step === "period") return `${formatDateLabel(period.startDate)} ~ ${formatDateLabel(period.endDate)}`;
    if (step === "content") return contentCandidates ? `${selectedContents.length}개 · ${draftPageRange?.estimatedPageCount ?? 0}p` : "불러오기 전";
    return preview ? `${preview.pageRange.estimatedPageCount}p · ${formatCurrency(preview.estimate.totalPrice)}` : "계산 전";
  };
  const filterCounts = buildBookContentFilterCounts(allContents, selectedContentKeys);
  const visibleContents = filterBookContents(allContents, contentFilter, selectedContentKeys);
  const selectedCandidateContentLabel = candidateContentTypes.map(bookContentTypeLabel).join(", ");
  const selectPeriodDateFromCalendar = (date: string) => {
    if (!periodRangeAnchor) {
      setPeriodRangeAnchor(date);
      onPeriodChange({ startDate: date, endDate: date });
      return;
    }

    const nextPeriod = date < periodRangeAnchor
      ? { startDate: date, endDate: periodRangeAnchor }
      : { startDate: periodRangeAnchor, endDate: date };
    setPeriodRangeAnchor(null);
    onPeriodChange(nextPeriod);
  };

  useEffect(() => {
    setPeriodRangeAnchor(null);
  }, [selectedRoomId]);

  return (
    <>
      <header className="page-header">
        <div>
          <h1>책 만들기</h1>
          <p>하나의 방을 선택한 뒤 상품과 기간을 정하고, 자동으로 불러온 기록을 커스텀합니다.</p>
        </div>
      </header>

      <section className="book-page book-wizard-page">
        <ol className="book-stepper" aria-label="책 만들기 진행 단계">
          {steps.map((step, index) => {
            const current = activeStep === step.key;
            const completed = isStepCompleted(step.key);
            const disabled = !canEnterStep(step.key);

            return (
              <li className={`${current ? "active" : ""} ${completed ? "completed" : ""}`} key={step.key}>
                <button type="button" onClick={() => onStepChange(step.key)} disabled={disabled} aria-current={current ? "step" : undefined}>
                  <span>{completed ? <CheckCircle2 size={15} /> : index + 1}</span>
                  <b>{step.label}</b>
                  <small>{stepSummary(step.key)}</small>
                </button>
              </li>
            );
          })}
        </ol>

        {activeStep === "room" ? (
          <section className="book-section book-wizard-panel" aria-labelledby="book-room-step">
            <div className="book-section-heading">
              <div>
                <span>1. 방 선택</span>
                <h2 id="book-room-step">책으로 만들 방을 선택하세요</h2>
              </div>
              <UsersRound size={24} />
            </div>

            <div className="book-room-grid" aria-busy={loading}>
              {rooms.map((room) => (
                <button className={`book-option-card ${selectedRoomId === room.id ? "selected" : ""}`} type="button" key={room.id} onClick={() => onSelectRoom(room.id)}>
                  <div className="book-room-card-main">
                    <span>{roomTypeLabel(room.type)}</span>
                    <strong>{room.name}</strong>
                  </div>
                  <small>구성원 {room.memberCount}명</small>
                  <small>책 후보 기록 {room.bookableRecordCount}개</small>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {activeStep === "product" ? (
          <section className="book-section book-wizard-panel" aria-labelledby="book-product-step">
            <div className="book-section-heading">
              <div>
                <span>2. 상품 선택</span>
                <h2 id="book-product-step">인쇄 상품을 선택하세요</h2>
              </div>
              <BookOpen size={24} />
            </div>

            <div className="book-product-grid">
              {products.map((product) => (
                <button className={`book-product-card selectable ${selectedProductUid === product.uid ? "selected" : ""}`} type="button" key={product.uid} onClick={() => onSelectProduct(product.uid)}>
                  <div className="book-product-card-title">
                    <BookOpen size={22} />
                    <h3>{product.displayName}</h3>
                  </div>
                  <dl className="book-spec-list compact">
                    <div>
                      <dt>판형</dt>
                      <dd>{product.widthMm} x {product.heightMm}mm</dd>
                    </div>
                    <div>
                      <dt>제본</dt>
                      <dd>{coverLabel(product.coverType)} · {product.bindingType}</dd>
                    </div>
                    <div>
                      <dt>페이지</dt>
                      <dd>{product.minPage}~{product.maxPage}p</dd>
                    </div>
                  </dl>
                </button>
              ))}
            </div>

          </section>
        ) : null}

        {activeStep === "period" ? (
          <section className="book-section book-wizard-panel" aria-labelledby="book-period-step">
            <div className="book-section-heading">
              <div>
                <span>3. 기간 선택</span>
                <h2 id="book-period-step">자동으로 불러올 기록 기간을 정하세요</h2>
              </div>
              <CalendarDays size={24} />
            </div>

            <div className="book-period-row">
              <label>
                시작일
                <input type="date" value={period.startDate} disabled={candidatesLoading} onChange={(event) => onPeriodChange({ ...period, startDate: event.target.value })} />
              </label>
              <label>
                종료일
                <input type="date" value={period.endDate} disabled={candidatesLoading} onChange={(event) => onPeriodChange({ ...period, endDate: event.target.value })} />
              </label>
            </div>

            <BookPeriodRangeCalendar
              calendar={periodCalendar}
              period={period}
              rangeAnchor={periodRangeAnchor}
              disabled={candidatesLoading}
              onDateSelect={selectPeriodDateFromCalendar}
            />

            <div className="book-candidate-type-picker" aria-label="불러올 콘텐츠 선택">
              <span>불러올 콘텐츠</span>
              <div>
                {bookCandidateContentTypeOptions.map((type) => {
                  const selected = candidateContentTypes.includes(type);

                  return (
                    <button
                      className={selected ? "selected" : ""}
                      type="button"
                      key={type}
                      onClick={() => onToggleCandidateContentType(type)}
                      disabled={candidatesLoading}
                      aria-pressed={selected}
                    >
                      <ActivityIcon type={bookContentTypeActivityKind(type)} />
                      <strong>{bookContentTypeLabel(type)}</strong>
                      <small>{selected ? "불러오기 포함" : "제외됨"}</small>
                    </button>
                  );
                })}
              </div>
              <p>{candidateContentTypes.length > 0 ? `${selectedCandidateContentLabel} 기록을 불러옵니다.` : "콘텐츠를 1개 이상 선택해야 기록을 불러올 수 있습니다."}</p>
            </div>

            <button className="primary-button book-load-candidates-button" type="button" onClick={onLoadCandidates} disabled={!canLoadCandidates || loading}>
              {loading ? "불러오는 중" : "기록 불러오기"}
            </button>

            {candidatesLoading ? <BookCandidateLoadingModal roomName={selectedRoom?.name ?? "선택한 방"} period={period} contentTypes={candidateContentTypes} /> : null}

          </section>
        ) : null}

        {activeStep === "content" ? (
          <section className="book-content-layout book-wizard-content-step" aria-labelledby="book-content-step">
            <div className="book-section book-wizard-panel">
              <div className="book-section-heading">
                <div>
                  <span>4. 콘텐츠 커스텀</span>
                  <h2 id="book-content-step">책에 담을 기록을 고르세요</h2>
                </div>
                <CheckCircle2 size={24} />
              </div>

              {!contentCandidates ? (
                <div className="book-empty-state">기간을 선택하고 기록을 불러오면 추억 게시글, 미션 인증, 편지가 자동으로 선택됩니다.</div>
              ) : (
                <BookContentLibrary
                  contents={visibleContents}
                  filterCounts={filterCounts}
                  activeFilter={contentFilter}
                  orderMode={contentOrderMode}
                  contentTypeOrder={contentTypeOrder}
                  selectedContentKeys={selectedContentKeys}
                  onFilterChange={onContentFilterChange}
                  onOrderModeChange={onContentOrderModeChange}
                  onMoveContentType={onMoveContentType}
                  onToggleContent={onToggleContent}
                  onOpenContentDetail={onOpenContentDetail}
                />
              )}
            </div>

            <aside className="book-summary-panel">
              <div className="book-section-heading compact">
                <div>
                  <span>선택 요약</span>
                  <h2>미리보기 입력</h2>
                </div>
              </div>

              <label className="book-input-field">
                책 제목
                <input value={title} maxLength={120} onChange={(event) => onTitleChange(event.target.value)} placeholder={selectedRoom ? `${selectedRoom.name} 기록집` : "방을 먼저 선택하세요"} />
              </label>
              <BookQuantityStepper quantity={quantity} onQuantityChange={onQuantityChange} />

              <BookSummaryMetrics summary={draftSummary} />

              {draftPageRange ? (
                <div className={`book-page-meter ${draftPageRange.status === "OVER_MAX" ? "danger" : ""}`}>
                  <div>
                    <strong>{draftPageRange.estimatedPageCount}p</strong>
                    <span>{draftPageRange.minPage}~{draftPageRange.maxPage}p</span>
                  </div>
                  <meter min={0} max={draftPageRange.maxPage} value={Math.min(draftPageRange.estimatedPageCount, draftPageRange.maxPage)} />
                  <p>{draftPageRange.message}</p>
                </div>
              ) : null}

              <BookCompositionOrderPanel
                selectedContents={selectedContents}
                orderMode={contentOrderMode}
                contentTypeOrder={contentTypeOrder}
              />

              <div className="book-wizard-actions stacked">
                <button className="primary-button" type="button" onClick={onCreatePreview} disabled={!canPreview || previewLoading}>
                  {previewLoading ? "계산 중" : "미리보기/견적 계산"}
                </button>
              </div>
            </aside>
          </section>
        ) : null}

        {activeStep === "preview" ? (
          <div className="book-wizard-preview-step">
            {preview ? <BookPreviewPanel preview={preview} onOpenOrderConfirm={onOpenOrderConfirm} /> : (
              <section className="book-section book-wizard-panel">
                <div className="book-empty-state">콘텐츠 선택 단계에서 미리보기와 견적을 먼저 계산해 주세요.</div>
              </section>
            )}
          </div>
        ) : null}

        {previewLoading ? (
          <BookPreviewLoadingModal
            roomName={selectedRoom?.name ?? "선택한 방"}
            productName={selectedProduct?.displayName ?? "선택한 상품"}
            title={title}
            quantity={quantity}
            selectedCount={selectedContents.length}
            estimatedPageCount={draftPageRange?.estimatedPageCount ?? 0}
          />
        ) : null}
      </section>
    </>
  );
}

function BookQuantityStepper({
  quantity,
  onQuantityChange,
}: {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}) {
  const updateQuantity = (nextQuantity: number) => {
    const normalizedQuantity = Number.isFinite(nextQuantity) ? Math.trunc(nextQuantity) : 1;
    onQuantityChange(clampNumber(normalizedQuantity, 1, 20));
  };

  return (
    <div className="book-input-field book-quantity-field">
      <span>수량</span>
      <div className="book-quantity-stepper">
        <button type="button" onClick={() => updateQuantity(quantity - 1)} disabled={quantity <= 1} aria-label="수량 줄이기">
          <Minus size={18} />
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={20}
          value={quantity}
          onChange={(event) => updateQuantity(Number(event.target.value))}
          aria-label="수량"
        />
        <button type="button" onClick={() => updateQuantity(quantity + 1)} disabled={quantity >= 20} aria-label="수량 늘리기">
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}

function BookCandidateLoadingModal({
  roomName,
  period,
  contentTypes,
}: {
  roomName: string;
  period: BookPeriod;
  contentTypes: BookContentType[];
}) {
  const contentTypeLabel = contentTypes.length > 0
    ? contentTypes.map(bookContentTypeLabel).join(", ")
    : "선택한 콘텐츠 없음";

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal book-candidate-loading-modal" role="dialog" aria-modal="true" aria-labelledby="book-candidate-loading-title">
        <span className="book-loading-spinner" aria-hidden="true" />
        <h2 id="book-candidate-loading-title">잠시만 기다려 주세요</h2>
        <dl>
          <div>
            <dt>선택한 방</dt>
            <dd>{roomName}</dd>
          </div>
          <div>
            <dt>선택한 날짜</dt>
            <dd>{formatDateLabel(period.startDate)} ~ {formatDateLabel(period.endDate)}</dd>
          </div>
          <div>
            <dt>선택한 콘텐츠</dt>
            <dd>{contentTypeLabel}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

function BookPreviewLoadingModal({
  roomName,
  productName,
  title,
  quantity,
  selectedCount,
  estimatedPageCount,
}: {
  roomName: string;
  productName: string;
  title: string;
  quantity: number;
  selectedCount: number;
  estimatedPageCount: number;
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal book-candidate-loading-modal" role="dialog" aria-modal="true" aria-labelledby="book-preview-loading-title">
        <span className="book-loading-spinner" aria-hidden="true" />
        <h2 id="book-preview-loading-title">잠시만 기다려 주세요</h2>
        <p className="book-loading-modal-description">템플릿 기반 책 미리보기와 예상 견적을 계산하고 있습니다.</p>
        <dl>
          <div>
            <dt>선택한 방</dt>
            <dd>{roomName}</dd>
          </div>
          <div>
            <dt>선택한 상품</dt>
            <dd>{productName}</dd>
          </div>
          <div>
            <dt>책 구성</dt>
            <dd>{title} · {selectedCount}개 · {estimatedPageCount}p · {quantity}권</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

function BookContentLibrary({
  contents,
  filterCounts,
  activeFilter,
  orderMode,
  contentTypeOrder,
  selectedContentKeys,
  onFilterChange,
  onOrderModeChange,
  onMoveContentType,
  onToggleContent,
  onOpenContentDetail,
}: {
  contents: BookContentCandidate[];
  filterCounts: Record<BookContentFilter, number>;
  activeFilter: BookContentFilter;
  orderMode: BookContentOrderMode;
  contentTypeOrder: BookContentType[];
  selectedContentKeys: Record<string, boolean>;
  onFilterChange: (filter: BookContentFilter) => void;
  onOrderModeChange: (mode: BookContentOrderMode) => void;
  onMoveContentType: (type: BookContentType, direction: "UP" | "DOWN") => void;
  onToggleContent: (content: BookContentCandidate) => void;
  onOpenContentDetail: (content: BookContentCandidate) => void;
}) {
  const orderControlsRef = useRef<HTMLDivElement | null>(null);
  const [typeOrderPopoverOpen, setTypeOrderPopoverOpen] = useState(false);
  const typeOrderPopoverId = "book-type-order-popover";

  useEffect(() => {
    if (!typeOrderPopoverOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && orderControlsRef.current?.contains(target)) return;
      setTypeOrderPopoverOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [typeOrderPopoverOpen]);

  useEffect(() => {
    if (orderMode !== "TYPE") {
      setTypeOrderPopoverOpen(false);
    }
  }, [orderMode]);

  return (
    <section className="book-content-library" aria-label="책 기록 라이브러리">
      <div className="book-content-toolbar">
        <div className="book-filter-tabs" role="tablist" aria-label="기록 필터">
          <div className="book-filter-row status">
            {bookContentStatusFilters.map((filter) => (
              <BookContentFilterTab
                key={filter}
                filter={filter}
                count={filterCounts[filter]}
                active={activeFilter === filter}
                onClick={() => onFilterChange(filter)}
              />
            ))}
          </div>
          <div className="book-filter-row type">
            {bookContentTypeFilters.map((filter) => (
              <BookContentFilterTab
                key={filter}
                filter={filter}
                count={filterCounts[filter]}
                active={activeFilter === filter}
                onClick={() => onFilterChange(filter)}
              />
            ))}
          </div>
        </div>

        <div className="book-order-controls" ref={orderControlsRef} aria-label="책 구성 순서">
          <span>책 구성 순서</span>
          <div className="segmented-control">
            <button
              className={orderMode === "DATE" ? "active" : ""}
              type="button"
              onClick={() => {
                onOrderModeChange("DATE");
                setTypeOrderPopoverOpen(false);
              }}
            >
              날짜 순
            </button>
            <button
              className={orderMode === "TYPE" ? "active" : ""}
              type="button"
              aria-controls={typeOrderPopoverId}
              aria-expanded={orderMode === "TYPE" && typeOrderPopoverOpen}
              aria-haspopup="true"
              onClick={() => {
                if (orderMode !== "TYPE") {
                  onOrderModeChange("TYPE");
                  setTypeOrderPopoverOpen(true);
                  return;
                }

                setTypeOrderPopoverOpen((open) => !open);
              }}
            >
              콘텐츠 순
            </button>
          </div>
          {orderMode === "TYPE" && typeOrderPopoverOpen ? (
            <div className="book-type-order-inline" id={typeOrderPopoverId} aria-label="콘텐츠 타입 순서 설정">
              <div className="book-type-order-list">
                {contentTypeOrder.map((type, index) => (
                  <div className="book-type-order-item" key={type}>
                    <strong>{bookContentTypeLabel(type)}</strong>
                    <div>
                      <button type="button" onClick={() => onMoveContentType(type, "UP")} disabled={index === 0} aria-label={`${bookContentTypeLabel(type)} 순서를 위로 이동`}>
                        <ArrowUp size={14} />
                      </button>
                      <button type="button" onClick={() => onMoveContentType(type, "DOWN")} disabled={index === contentTypeOrder.length - 1} aria-label={`${bookContentTypeLabel(type)} 순서를 아래로 이동`}>
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {contents.length === 0 ? (
        <div className="book-empty-state compact">표시할 기록이 없습니다.</div>
      ) : (
        <div className="book-content-list">
          {contents.map((content) => {
            const selected = Boolean(selectedContentKeys[bookContentKey(content)]);

            return (
              <article className={`book-content-row ${selected ? "selected" : ""}`} key={bookContentKey(content)}>
                <label className="book-content-checkbox" aria-label={`${content.title} 선택`}>
                  <input type="checkbox" checked={selected} onChange={() => onToggleContent(content)} />
                </label>
                <button className="book-content-detail-button" type="button" onClick={() => onOpenContentDetail(content)}>
                  <strong>{content.title}</strong>
                  <small>{content.sourceLabel} · {formatDateLabel(content.occurredDate)} · {content.authorName}</small>
                  <em>{content.description}</em>
                </button>
                <span className="book-page-allocation" title={bookPageAllocationTooltip()} aria-label={`예상 ${content.pageCount}페이지 할당. ${bookPageAllocationTooltip()}`}>
                  {content.pageCount}p 할당
                </span>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function BookContentFilterTab({
  filter,
  count,
  active,
  onClick,
}: {
  filter: BookContentFilter;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={active ? "active" : ""}
      type="button"
      role="tab"
      onClick={onClick}
      aria-selected={active}
    >
      <span>{bookContentFilterLabel(filter)}</span>
      <b>{count}</b>
    </button>
  );
}

function BookCompositionOrderPanel({
  selectedContents,
  orderMode,
  contentTypeOrder,
}: {
  selectedContents: BookContentCandidate[];
  orderMode: BookContentOrderMode;
  contentTypeOrder: BookContentType[];
}) {
  const [compositionModalOpen, setCompositionModalOpen] = useState(false);
  const orderSummary = orderMode === "TYPE"
    ? contentTypeOrder.map(bookContentTypeLabel).join(" -> ")
    : "오래된 기록 -> 최신 기록";

  return (
    <section className="book-composition-panel" aria-label="책에 들어갈 최종 구성 순서">
      <div>
        <span>책 구성 순서</span>
        <strong>{orderMode === "DATE" ? "날짜 순" : "콘텐츠 순"}</strong>
      </div>
      <p>{orderSummary}</p>
      {selectedContents.length === 0 ? (
        <div className="book-empty-state compact">선택한 기록이 없습니다.</div>
      ) : (
        <button className="book-composition-open-button" type="button" onClick={() => setCompositionModalOpen(true)}>
          전체 순서 보기
          <span>{selectedContents.length}개</span>
        </button>
      )}
      {compositionModalOpen ? (
        <BookCompositionOrderModal
          selectedContents={selectedContents}
          orderMode={orderMode}
          orderSummary={orderSummary}
          onClose={() => setCompositionModalOpen(false)}
        />
      ) : null}
    </section>
  );
}

function BookCompositionOrderModal({
  selectedContents,
  orderMode,
  orderSummary,
  onClose,
}: {
  selectedContents: BookContentCandidate[];
  orderMode: BookContentOrderMode;
  orderSummary: string;
  onClose: () => void;
}) {
  const titleId = "book-composition-order-modal-title";

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal book-composition-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="modal-title-row">
          <div>
            <span>{orderMode === "DATE" ? "날짜 순" : "콘텐츠 순"}</span>
            <h2 id={titleId}>책 구성 순서</h2>
            <p>{orderSummary}</p>
          </div>
          <button className="modal-icon-button" type="button" onClick={onClose} aria-label="책 구성 순서 닫기">
            <X size={20} />
          </button>
        </div>

        <div className="book-composition-modal-list">
          {selectedContents.length === 0 ? (
            <div className="book-empty-state compact">선택한 기록이 없습니다.</div>
          ) : (
            <ol>
              {selectedContents.map((content, index) => (
                <li key={bookContentKey(content)}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{content.title}</strong>
                    <small>{content.sourceLabel} · {formatDateLabel(content.occurredDate)} · {content.authorName} · {content.pageCount}p 할당</small>
                    <em>{content.description}</em>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="modal-actions">
          <button className="primary-button" type="button" onClick={onClose}>확인</button>
        </div>
      </section>
    </div>
  );
}
function BookContentDetailModal({
  detail,
  onClose,
}: {
  detail: BookContentDetailModalState;
  onClose: () => void;
}) {
  const content = detail.content;
  const titleId = `book-content-detail-${bookContentKey(content).replace(":", "-")}`;

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal book-content-detail-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="modal-title-row">
          <div>
            <span>{content.sourceLabel} · {content.pageCount}p 할당</span>
            <h2 id={titleId}>{content.title}</h2>
          </div>
          <button className="modal-icon-button" type="button" onClick={onClose} aria-label="상세 닫기">
            <X size={20} />
          </button>
        </div>

        {detail.loading ? <p className="empty-state">상세 내용을 불러오는 중입니다.</p> : null}

        {!detail.loading && content.type === "MEMORY" ? (
          <BookMemoryDetailContent content={content} detail={detail.memoryDetail} />
        ) : null}
        {!detail.loading && content.type === "MISSION" ? (
          <BookMissionDetailContent content={content} detail={detail.missionDetail} />
        ) : null}
        {!detail.loading && content.type === "LETTER" ? (
          <BookLetterDetailContent content={content} detail={detail.letterDetail} />
        ) : null}
        {!detail.loading && content.type === "CHAT" ? (
          <BookChatDetailContent content={content} messages={detail.chatMessages ?? []} />
        ) : null}

        <div className="modal-actions">
          <button className="primary-button" type="button" onClick={onClose}>확인</button>
        </div>
      </section>
    </div>
  );
}

function BookMemoryDetailContent({ content, detail }: { content: BookContentCandidate; detail?: MemoryPostDetail }) {
  const comments = detail?.comments ?? [];

  return (
    <div className="book-content-detail-body">
      <MemoryImage imageUrl={detail?.representativeImageUrl ?? null} title={content.title} large />
      <div className="book-detail-meta-grid">
        <div>
          <span>작성자</span>
          <strong>{detail?.authorName ?? content.authorName}</strong>
        </div>
        <div>
          <span>날짜</span>
          <strong>{formatDateLabel(detail?.occurredDate ?? content.occurredDate)}</strong>
        </div>
        <div>
          <span>사진</span>
          <strong>{detail?.imageCount ?? content.imageCount}장</strong>
        </div>
        <div>
          <span>댓글</span>
          <strong>{detail?.commentCount ?? content.commentCount}개</strong>
        </div>
      </div>
      <p className="book-detail-text">{detail?.body ?? content.description}</p>
      <BookDetailCommentList comments={comments.map((comment) => ({
        id: comment.id,
        authorName: comment.authorName,
        body: comment.body,
        createdAt: comment.createdAt,
      }))} />
    </div>
  );
}

function BookMissionDetailContent({ content, detail }: { content: BookContentCandidate; detail?: MissionSummary }) {
  const submission = detail?.latestSubmission ?? fallbackMissionDetailFromBookContent(0, content).latestSubmission!;

  return (
    <div className="book-content-detail-body">
      <div className="book-detail-meta-grid">
        <div>
          <span>미션 상태</span>
          <strong>{detail ? missionStatusLabel(detail.status) : "인증 기록"}</strong>
        </div>
        <div>
          <span>인증자</span>
          <strong>{submission.submitterName}</strong>
        </div>
        <div>
          <span>인증일</span>
          <strong>{formatDateLabel(submission.occurredDate)}</strong>
        </div>
        <div>
          <span>동의</span>
          <strong>{submission.approvedCount}/{submission.requiredApprovalCount}</strong>
        </div>
      </div>
      {submission.imageUrl ? <MissionProofImage imageUrl={submission.imageUrl} title={content.title} /> : null}
      <p className="book-detail-text">{submission.body}</p>
      {detail?.description ? <p className="book-detail-muted">{detail.description}</p> : null}
      <BookDetailCommentList comments={(detail?.comments ?? []).map((comment) => ({
        id: comment.id,
        authorName: comment.authorName,
        body: comment.body,
        createdAt: comment.createdAt,
      }))} />
    </div>
  );
}

function BookLetterDetailContent({ content, detail }: { content: BookContentCandidate; detail?: LetterDetail }) {
  return (
    <div className="book-content-detail-body">
      <div className="letter-paper book-detail-letter-paper">
        <div className="letter-paper-meta">
          <span>보낸 사람</span>
          <strong>{detail?.senderName ?? content.authorName}</strong>
        </div>
        <div className="letter-paper-meta">
          <span>받는 사람</span>
          <strong>{detail?.receiverName ?? "방 구성원"}</strong>
        </div>
        <p>{detail?.body ?? content.description}</p>
      </div>
      <div className="book-detail-info-row">
        <span>{formatDateLabel(detail?.occurredDate ?? content.occurredDate)}</span>
        {detail?.sentAt ? <span>{formatChatTime(detail.sentAt)}</span> : null}
        <span>{detail?.mine ? "보낸 편지" : "받은 편지"}</span>
      </div>
    </div>
  );
}

function BookChatDetailContent({ content, messages }: { content: BookContentCandidate; messages: ChatMessage[] }) {
  return (
    <div className="book-content-detail-body">
      <div className="book-detail-meta-grid">
        <div>
          <span>날짜</span>
          <strong>{formatDateLabel(content.occurredDate)}</strong>
        </div>
        <div>
          <span>메시지</span>
          <strong>{messages.length}개</strong>
        </div>
      </div>
      <div className="book-detail-chat-list">
        {messages.length === 0 ? <p className="empty-state">표시할 채팅이 없습니다.</p> : null}
        {messages.map((message) => (
          <div className={`chat-message-row ${message.mine ? "mine" : ""}`} key={message.id}>
            <div className="chat-message-meta">
              <strong>{message.senderName}</strong>
              <span>{formatChatTime(message.sentAt)}</span>
            </div>
            <p className="chat-message-bubble">{message.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookDetailCommentList({
  comments,
}: {
  comments: Array<{ id: number; authorName: string; body: string; createdAt: string }>;
}) {
  return (
    <section className="book-detail-comments">
      <h3>댓글 일부</h3>
      {comments.length === 0 ? <p className="empty-state compact">표시할 댓글이 없습니다.</p> : null}
      {comments.slice(0, 4).map((comment) => (
        <div className="book-detail-comment" key={comment.id}>
          <strong>{comment.authorName}</strong>
          <span>{formatChatTime(comment.createdAt)}</span>
          <p>{comment.body}</p>
        </div>
      ))}
    </section>
  );
}

function BookSummaryMetrics({ summary }: { summary: BookContentSummary }) {
  return (
    <div className="book-summary-metrics">
      <Metric label="추억" value={`${summary.memoryCount}개`} />
      <Metric label="미션" value={`${summary.missionCount}개`} />
      <Metric label="편지" value={`${summary.letterCount}개`} />
      <Metric label="채팅" value={`${summary.chatCount}일`} />
    </div>
  );
}

type BookTemplatePreviewSlide = {
  id: string;
  kind: "cover" | "toc" | "memory" | "mission" | "letter" | "chat";
  kicker: string;
  title: string;
  subtitle: string | null;
  description: string;
  pageRangeLabel: string;
  thumbnailLabel: string;
  contentType: BookContentType | null;
  occurredDate: string | null;
  authorName: string | null;
  imageCount: number;
  commentCount: number;
  content: BookContentCandidate | null;
  summaryItems: Array<{ label: string; value: string }>;
};

function buildBookTemplatePreviewSlides(preview: BookPreviewResponse): BookTemplatePreviewSlide[] {
  let nextPage = 3;
  const contentSlides = preview.contents.map((content, index) => {
    const startPage = nextPage;
    const endPage = nextPage + Math.max(content.pageCount, 1) - 1;
    nextPage = endPage + 1;

    return {
      id: `${content.type}-${content.sourceId}-${index}`,
      kind: bookTemplateSlideKind(content.type),
      kicker: bookContentTypeLabel(content.type),
      title: content.title,
      subtitle: content.sourceLabel,
      description: content.description,
      pageRangeLabel: formatBookPageRange(startPage, endPage),
      thumbnailLabel: formatBookThumbnailRange(startPage, endPage),
      contentType: content.type,
      occurredDate: content.occurredDate,
      authorName: content.authorName,
      imageCount: content.imageCount,
      commentCount: content.commentCount,
      content,
      summaryItems: [
        { label: "예상 지면", value: `${content.pageCount}p` },
        { label: "사진", value: `${content.imageCount}장` },
        { label: "댓글", value: `${content.commentCount}개` },
      ],
    } satisfies BookTemplatePreviewSlide;
  });

  return [
    {
      id: "cover",
      kind: "cover",
      kicker: preview.product.displayName,
      title: preview.title,
      subtitle: preview.roomName,
      description: `${formatDateLabel(preview.period.startDate)}부터 ${formatDateLabel(preview.period.endDate)}까지의 기록을 한 권의 책으로 구성합니다.`,
      pageRangeLabel: "표지",
      thumbnailLabel: "커버",
      contentType: null,
      occurredDate: null,
      authorName: null,
      imageCount: 0,
      commentCount: 0,
      content: null,
      summaryItems: [
        { label: "상품", value: preview.product.displayName },
        { label: "방", value: preview.roomName },
        { label: "예상", value: `${preview.pageRange.estimatedPageCount}p` },
      ],
    },
    {
      id: "toc",
      kind: "toc",
      kicker: "책 구성 요약",
      title: "담은 기록",
      subtitle: `${preview.contents.length}개`,
      description: "선택한 기록이 아래 구성 순서대로 템플릿 페이지에 배치됩니다.",
      pageRangeLabel: "목차",
      thumbnailLabel: "목차",
      contentType: null,
      occurredDate: null,
      authorName: null,
      imageCount: 0,
      commentCount: 0,
      content: null,
      summaryItems: [
        { label: "추억", value: `${preview.summary.memoryCount}개` },
        { label: "미션", value: `${preview.summary.missionCount}개` },
        { label: "편지", value: `${preview.summary.letterCount}개` },
        { label: "채팅", value: `${preview.summary.chatCount}일` },
      ],
    },
    ...contentSlides,
  ];
}

function bookTemplateSlideKind(type: BookContentType): BookTemplatePreviewSlide["kind"] {
  if (type === "MEMORY") return "memory";
  if (type === "MISSION") return "mission";
  if (type === "LETTER") return "letter";
  return "chat";
}

function formatBookPageRange(startPage: number, endPage: number): string {
  return startPage === endPage ? `${startPage}p 예상` : `${startPage}-${endPage}p 예상`;
}

function formatBookThumbnailRange(startPage: number, endPage: number): string {
  return startPage === endPage ? `${startPage}` : `${startPage}-${endPage}`;
}

function BookTemplateVisual({ slide, compact = false }: { slide: BookTemplatePreviewSlide; compact?: boolean }) {
  if (slide.kind === "cover") {
    return (
      <div className={`book-template-visual cover ${compact ? "compact" : ""}`} aria-hidden="true">
        <BookOpen size={compact ? 18 : 42} />
        <span>{compact ? "" : "TEMPLATE"}</span>
      </div>
    );
  }

  if (slide.kind === "toc") {
    return (
      <div className={`book-template-visual toc ${compact ? "compact" : ""}`} aria-hidden="true">
        <List size={compact ? 18 : 38} />
        <span>{compact ? "" : "INDEX"}</span>
      </div>
    );
  }

  return (
    <div className={`book-template-visual ${slide.kind} ${compact ? "compact" : ""}`} aria-hidden="true">
      {slide.contentType ? <ActivityIcon type={bookContentTypeActivityKind(slide.contentType)} /> : null}
      {!compact ? (
        <>
          <span>{slide.imageCount > 0 ? `사진 ${slide.imageCount}장` : bookContentTypeLabel(slide.contentType ?? "MEMORY")}</span>
          <small>{slide.commentCount > 0 ? `댓글 ${slide.commentCount}개` : "템플릿 배치"}</small>
        </>
      ) : null}
    </div>
  );
}

const printOrderProgressStatuses: PrintOrderStatus[] = [
  "PAID",
  "PDF_READY",
  "CONFIRMED",
  "IN_PRODUCTION",
  "PRODUCTION_COMPLETE",
  "SHIPPED",
  "DELIVERED",
];

function buildPrintOrderPreview(order: PrintOrderDetail): BookPreviewResponse {
  const contents = [...order.contents]
    .sort((first, second) => first.sortOrder - second.sortOrder)
    .map((content) => ({
      type: content.type,
      sourceId: content.sourceId,
      title: content.title,
      description: content.snapshot?.description ?? `${bookContentTypeLabel(content.type)} 기록을 템플릿 페이지에 배치합니다.`,
      occurredDate: content.occurredDate,
      authorName: content.snapshot?.authorName ?? order.memberName,
      imageCount: content.snapshot?.imageCount ?? 0,
      commentCount: content.snapshot?.commentCount ?? 0,
      pageCount: content.pageCount,
      selectedByDefault: true,
      sourceLabel: content.snapshot?.sourceLabel ?? `${bookContentTypeLabel(content.type)} · ${formatDateLabel(content.occurredDate)}`,
    }));
  const summary = buildPrintOrderContentSummary(contents);
  const additionalPageCount = Math.max(order.estimatedPageCount - order.product.includedPageCount, 0);

  return {
    previewId: order.id,
    creationType: order.creationType,
    roomId: order.roomId,
    roomName: order.roomName,
    product: order.product,
    title: order.title,
    period: order.period,
    contents,
    summary,
    pageRange: {
      minPage: order.product.minPage,
      maxPage: order.product.maxPage,
      estimatedPageCount: order.estimatedPageCount,
      status: "AVAILABLE",
      message: "주문 당시 저장된 템플릿 구성입니다.",
    },
    estimate: {
      basePrice: order.basePrice,
      includedPageCount: order.product.includedPageCount,
      additionalPageCount,
      additionalPagePrice: order.additionalPagePrice,
      shippingPrice: order.shippingPrice,
      quantity: order.quantity,
      subtotalPrice: Math.max(order.totalPrice - order.shippingPrice, 0),
      totalPrice: order.totalPrice,
    },
    pages: [],
    warnings: [],
  };
}

function buildPrintOrderContentSummary(contents: BookContentCandidate[]): BookContentSummary {
  return contents.reduce<BookContentSummary>((summary, content) => {
    if (content.type === "MEMORY") summary.memoryCount += 1;
    if (content.type === "MISSION") summary.missionCount += 1;
    if (content.type === "LETTER") summary.letterCount += 1;
    if (content.type === "CHAT") summary.chatCount += 1;
    summary.estimatedPageCount += content.pageCount;
    return summary;
  }, {
    memoryCount: 0,
    missionCount: 0,
    letterCount: 0,
    chatCount: 0,
    estimatedPageCount: 0,
  });
}

function completedPrintOrderStatusSet(order: PrintOrderDetail): Set<PrintOrderStatus> {
  return new Set(order.statusHistories.map((history) => history.nextStatus));
}

function printOrderProgressIndex(order: PrintOrderDetail): number {
  const completedStatuses = completedPrintOrderStatusSet(order);
  const currentIndex = printOrderProgressStatuses.indexOf(order.status);
  if (currentIndex >= 0) return currentIndex;

  for (let index = printOrderProgressStatuses.length - 1; index >= 0; index -= 1) {
    if (completedStatuses.has(printOrderProgressStatuses[index])) return index;
  }

  return 0;
}

function OrderStatusProgress({ order }: { order: PrintOrderDetail }) {
  const completedStatuses = completedPrintOrderStatusSet(order);
  const progressIndex = printOrderProgressIndex(order);
  const progressPercent = printOrderProgressStatuses.length <= 1
    ? 0
    : (progressIndex / (printOrderProgressStatuses.length - 1)) * 100;

  return (
    <section className="order-status-progress-section" aria-labelledby="order-status-progress-title">
      <div className="order-detail-section-heading">
        <h3 id="order-status-progress-title">진행 상태</h3>
        <span>{order.statusLabel}</span>
      </div>
      <div className={`order-status-progress ${printOrderStatusTone(order.status)}`}>
        <div className="order-status-progress-track" aria-hidden="true">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
        {printOrderProgressStatuses.map((status, index) => {
          const completed = index <= progressIndex || completedStatuses.has(status);
          const current = status === order.status;

          return (
            <div className={`order-status-step ${completed ? "completed" : ""} ${current ? "current" : ""}`} key={status}>
              <span>{completed ? <CheckCircle2 size={18} /> : index + 1}</span>
              <strong>{printOrderStatusLabel(status)}</strong>
            </div>
          );
        })}
      </div>
      {order.status === "CANCELLED_REFUND" || order.status === "ERROR" ? (
        <p className="order-status-terminal-note">{order.statusLabel} 상태로 종료된 주문입니다.</p>
      ) : null}
    </section>
  );
}

function OrderStatusEventList({ histories }: { histories: PrintOrderStatusHistory[] }) {
  return (
    <section className="order-status-events" aria-labelledby="order-status-events-title">
      <div className="order-detail-section-heading">
        <h3 id="order-status-events-title">상태 이력</h3>
      </div>
      <div className="order-status-event-list">
        {histories.map((history) => (
          <div key={history.id}>
            <time>{formatDateTimeLabel(history.changedAt)}</time>
            <strong>{history.nextStatusLabel}</strong>
            {history.memo ? <span>{history.memo}</span> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

const orderSortOptions: Array<{ value: OrderSortKey; label: string }> = [
  { value: "REQUESTED_DESC", label: "주문일 최신순" },
  { value: "REQUESTED_ASC", label: "주문일 오래된순" },
  { value: "UPDATED_DESC", label: "최근 변경순" },
  { value: "PRICE_DESC", label: "금액 높은순" },
  { value: "PRICE_ASC", label: "금액 낮은순" },
];

const orderLimitOptions = [10, 20, 50];

const customerOrderActionFilter: OrderActionFilter = {
  label: "취소 가능만",
  predicate: (order) => canCancelPrintOrder(order.status),
};

const operatorOrderActionFilter: OrderActionFilter = {
  label: "처리 가능만",
  predicate: (order) => Boolean(nextPrintOrderStatus(order.status)),
};

function defaultOrderTableFilters(status: PrintOrderStatus | "ALL" = "ALL"): OrderTableFilters {
  return {
    startDate: "",
    endDate: "",
    query: "",
    status,
    sort: "REQUESTED_DESC",
    limit: 20,
    onlyCancelable: false,
  };
}

function useOrderTableState(
  orders: PrintOrderSummary[],
  initialStatus: PrintOrderStatus | "ALL" = "ALL",
  actionFilter: OrderActionFilter = customerOrderActionFilter,
) {
  const [filters, setFilters] = useState<OrderTableFilters>(() => defaultOrderTableFilters(initialStatus));
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const filteredOrders = useMemo(() => filterAndSortPrintOrders(orders, filters, actionFilter.predicate), [orders, filters, actionFilter]);
  const visibleOrders = useMemo(() => filteredOrders.slice(0, filters.limit), [filteredOrders, filters.limit]);
  const selectedOrders = useMemo(() => filteredOrders.filter((order) => selectedIds.includes(order.id)), [filteredOrders, selectedIds]);

  useEffect(() => {
    setSelectedIds((current) => current.filter((orderId) => orders.some((order) => order.id === orderId)));
  }, [orders]);

  const updateFilter = <K extends keyof OrderTableFilters>(key: K, value: OrderTableFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };
  const resetFilters = (status: PrintOrderStatus | "ALL" = initialStatus) => {
    setFilters(defaultOrderTableFilters(status));
    setSelectedIds([]);
  };
  const toggleOrder = (orderId: number) => {
    setSelectedIds((current) => current.includes(orderId)
      ? current.filter((id) => id !== orderId)
      : [...current, orderId]);
  };
  const toggleVisibleOrders = () => {
    const visibleIds = visibleOrders.map((order) => order.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((orderId) => selectedIds.includes(orderId));
    setSelectedIds((current) => allVisibleSelected
      ? current.filter((orderId) => !visibleIds.includes(orderId))
      : Array.from(new Set([...current, ...visibleIds])));
  };

  return {
    filters,
    actionFilterLabel: actionFilter.label,
    setFilters,
    updateFilter,
    resetFilters,
    selectedIds,
    setSelectedIds,
    selectedOrders,
    filteredOrders,
    visibleOrders,
    toggleOrder,
    toggleVisibleOrders,
  };
}

function filterAndSortPrintOrders(
  orders: PrintOrderSummary[],
  filters: OrderTableFilters,
  actionFilterPredicate: (order: PrintOrderSummary) => boolean,
): PrintOrderSummary[] {
  const query = filters.query.trim().toLowerCase();
  const filtered = orders.filter((order) => {
    const requestedDate = order.requestedAt.slice(0, 10);
    if (filters.startDate && requestedDate < filters.startDate) return false;
    if (filters.endDate && requestedDate > filters.endDate) return false;
    if (filters.status !== "ALL" && order.status !== filters.status) return false;
    if (filters.onlyCancelable && !actionFilterPredicate(order)) return false;
    if (!query) return true;

    return [
      order.orderNo,
      order.title,
      order.memberName,
      order.roomName,
      order.product.displayName,
      order.statusLabel,
    ].some((value) => value.toLowerCase().includes(query));
  });

  return [...filtered].sort((first, second) => {
    if (filters.sort === "REQUESTED_ASC") return first.requestedAt.localeCompare(second.requestedAt);
    if (filters.sort === "UPDATED_DESC") return second.updatedAt.localeCompare(first.updatedAt);
    if (filters.sort === "PRICE_DESC") return second.totalPrice - first.totalPrice;
    if (filters.sort === "PRICE_ASC") return first.totalPrice - second.totalPrice;
    return second.requestedAt.localeCompare(first.requestedAt);
  });
}

function OrderTableToolbar({
  filters,
  actionFilterLabel,
  showActionFilter = true,
  resultCount,
  selectedCount,
  allCsvDisabled,
  filteredCsvDisabled,
  onFilterChange,
  onReset,
  onDownloadAll,
  onDownloadFiltered,
  onDownloadSelected,
}: {
  filters: OrderTableFilters;
  actionFilterLabel: string;
  showActionFilter?: boolean;
  resultCount: number;
  selectedCount: number;
  allCsvDisabled: boolean;
  filteredCsvDisabled: boolean;
  onFilterChange: <K extends keyof OrderTableFilters>(key: K, value: OrderTableFilters[K]) => void;
  onReset: () => void;
  onDownloadAll: () => void;
  onDownloadFiltered: () => void;
  onDownloadSelected: () => void;
}) {
  return (
    <div className="order-table-toolbar">
      <div className="order-table-csv-row">
        <button type="button" onClick={onDownloadAll} disabled={allCsvDisabled}>
          <Download size={16} />
          전체 데이터 CSV
        </button>
        <button type="button" onClick={onDownloadFiltered} disabled={filteredCsvDisabled}>
          <Download size={16} />
          필터링 데이터 CSV
        </button>
        <button type="button" onClick={onDownloadSelected} disabled={selectedCount === 0}>
          <Download size={16} />
          선택한 데이터 CSV
        </button>
      </div>

      <div className="order-table-filter-grid">
        <label>
          주문일 시작
          <input type="date" value={filters.startDate} onChange={(event) => onFilterChange("startDate", event.target.value)} />
        </label>
        <label>
          주문일 종료
          <input type="date" value={filters.endDate} onChange={(event) => onFilterChange("endDate", event.target.value)} />
        </label>
        <label>
          정렬
          <select value={filters.sort} onChange={(event) => onFilterChange("sort", event.target.value as OrderSortKey)}>
            {orderSortOptions.map((option) => (
              <option value={option.value} key={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label>
          표시 개수
          <select value={filters.limit} onChange={(event) => onFilterChange("limit", Number(event.target.value))}>
            {orderLimitOptions.map((limit) => (
              <option value={limit} key={limit}>{limit}건씩</option>
            ))}
          </select>
        </label>
        <label className="wide">
          검색
          <span className="order-search-field">
            <Search size={16} />
            <input
              type="search"
              value={filters.query}
              onChange={(event) => onFilterChange("query", event.target.value)}
              placeholder="제목, 주문번호, 주문자, 방, 상품 검색"
            />
          </span>
        </label>
        <label>
          상태
          <select value={filters.status} onChange={(event) => onFilterChange("status", event.target.value as PrintOrderStatus | "ALL")}>
            <option value="ALL">전체 상태</option>
            {printOrderStatusOptions.map((status) => (
              <option value={status} key={status}>{printOrderStatusLabel(status)}</option>
            ))}
          </select>
        </label>
        {showActionFilter ? (
          <label className="order-toggle-field">
            <input
              type="checkbox"
              checked={filters.onlyCancelable}
              onChange={(event) => onFilterChange("onlyCancelable", event.target.checked)}
            />
            {actionFilterLabel}
          </label>
        ) : null}
        <button className="outline-button order-filter-reset-button" type="button" onClick={onReset}>
          필터 초기화
        </button>
      </div>

      <div className="order-table-result-row">
        <span>{resultCount}건 조회</span>
        {selectedCount > 0 ? <strong>{selectedCount}건 선택됨</strong> : null}
      </div>
    </div>
  );
}

function PrintOrderDataTable({
  orders,
  selectedOrderId,
  selectedIds,
  loading,
  emptyMessage,
  onToggleOrder,
  onToggleVisibleOrders,
  onOpenOrder,
}: {
  orders: PrintOrderSummary[];
  selectedOrderId: number | null;
  selectedIds: number[];
  loading: boolean;
  emptyMessage: string;
  onToggleOrder: (orderId: number) => void;
  onToggleVisibleOrders: () => void;
  onOpenOrder: (orderId: number) => void;
}) {
  const allVisibleSelected = orders.length > 0 && orders.every((order) => selectedIds.includes(order.id));

  if (loading) {
    return <div className="book-empty-state compact">주문을 불러오는 중입니다.</div>;
  }

  if (orders.length === 0) {
    return <div className="book-empty-state compact">{emptyMessage}</div>;
  }

  return (
    <div className="order-table-scroll" tabIndex={0} aria-label="주문 테이블 가로 스크롤 영역">
      <table className="order-data-table">
        <thead>
          <tr>
            <th scope="col">
              <input type="checkbox" checked={allVisibleSelected} onChange={onToggleVisibleOrders} aria-label="현재 화면 주문 전체 선택" />
            </th>
            <th scope="col">주문일시</th>
            <th scope="col">최근 변경</th>
            <th scope="col">주문번호</th>
            <th scope="col">상태</th>
            <th scope="col">주문자</th>
            <th scope="col">방</th>
            <th scope="col">상품/페이지</th>
            <th scope="col">수량</th>
            <th scope="col">금액</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              className={selectedOrderId === order.id ? "selected" : ""}
              key={order.id}
              onClick={(event) => {
                if (isInteractiveTarget(event.target)) return;
                onOpenOrder(order.id);
              }}
            >
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(order.id)}
                  onChange={() => onToggleOrder(order.id)}
                  aria-label={`${order.orderNo} 선택`}
                />
              </td>
              <td>{formatDateTimeLabel(order.requestedAt)}</td>
              <td>{formatDateTimeLabel(order.updatedAt)}</td>
              <td><strong>{order.orderNo}</strong></td>
              <td><span className={`book-order-status-badge ${printOrderStatusTone(order.status)}`}>{order.statusLabel}</span></td>
              <td>{order.memberName}</td>
              <td>{order.roomName}</td>
              <td>{order.product.displayName} · {order.estimatedPageCount}p</td>
              <td>{order.quantity}권</td>
              <td><b>{formatCurrency(order.totalPrice)}</b></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function downloadPrintOrdersCsv(filename: string, orders: PrintOrderSummary[]) {
  const headers = ["주문일시", "최근 변경", "주문번호", "상태", "주문자", "방", "상품", "페이지", "수량", "금액"];
  const rows = orders.map((order) => [
    formatDateTimeLabel(order.requestedAt),
    formatDateTimeLabel(order.updatedAt),
    order.orderNo,
    order.statusLabel,
    order.memberName,
    order.roomName,
    order.product.displayName,
    `${order.estimatedPageCount}p`,
    `${order.quantity}권`,
    `${order.totalPrice}`,
  ]);
  const csv = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function escapeCsvCell(value: string): string {
  const escaped = value.replace(/"/g, "\"\"");
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

function BookTemplatePreviewViewer({
  preview,
  className = "",
}: {
  preview: BookPreviewResponse;
  className?: string;
}) {
  const slides = useMemo(() => buildBookTemplatePreviewSlides(preview), [preview]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const activeSlide = slides[activeSlideIndex] ?? slides[0];
  const canMovePrevious = activeSlideIndex > 0;
  const canMoveNext = activeSlideIndex < slides.length - 1;
  const moveSlide = (direction: "PREVIOUS" | "NEXT") => {
    setActiveSlideIndex((current) => {
      const next = direction === "PREVIOUS" ? current - 1 : current + 1;

      return clampNumber(next, 0, slides.length - 1);
    });
  };

  return (
    <div className={`book-preview-viewer ${className}`}>
      <div className="book-preview-viewer-top">
        <div>
          <strong>{activeSlide.title}</strong>
          <span>{activeSlide.kicker}</span>
        </div>
        <em>{activeSlide.pageRangeLabel} · {activeSlideIndex + 1}/{slides.length}</em>
      </div>

      <div className="book-preview-stage">
        <button className="book-preview-nav previous" type="button" onClick={() => moveSlide("PREVIOUS")} disabled={!canMovePrevious} aria-label="이전 미리보기 페이지">
          <ChevronLeft size={28} />
        </button>

        <article className={`book-template-page ${activeSlide.kind}`}>
          <div className="book-template-page-inner">
            <span className="book-template-kicker">{activeSlide.kicker}</span>
            <h3>{activeSlide.title}</h3>
            {activeSlide.subtitle ? <strong>{activeSlide.subtitle}</strong> : null}
            <p>{activeSlide.description}</p>
            {activeSlide.content ? (
              <div className="book-template-content">
                <BookTemplateVisual slide={activeSlide} />
                <div>
                  {activeSlide.occurredDate ? <small>{formatDateLabel(activeSlide.occurredDate)}</small> : null}
                  {activeSlide.authorName ? <small>{activeSlide.authorName}</small> : null}
                  {activeSlide.contentType ? <small>{bookContentTypeLabel(activeSlide.contentType)}</small> : null}
                </div>
              </div>
            ) : null}
            {activeSlide.summaryItems.length > 0 ? (
              <div className="book-template-summary-grid">
                {activeSlide.summaryItems.map((item) => (
                  <div key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </article>

        <button className="book-preview-nav next" type="button" onClick={() => moveSlide("NEXT")} disabled={!canMoveNext} aria-label="다음 미리보기 페이지">
          <ChevronRight size={28} />
        </button>
      </div>

      <div className="book-preview-thumbnails" aria-label="템플릿 미리보기 페이지 목록">
        {slides.map((slide, index) => (
          <button
            className={index === activeSlideIndex ? "active" : ""}
            type="button"
            key={slide.id}
            onClick={() => setActiveSlideIndex(index)}
            aria-current={index === activeSlideIndex ? "true" : undefined}
          >
            <span className={`book-preview-thumb ${slide.kind}`}>
              <BookTemplateVisual slide={slide} compact />
            </span>
            <small>{slide.thumbnailLabel}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function BookPreviewPanel({
  preview,
  onOpenOrderConfirm,
}: {
  preview: BookPreviewResponse;
  onOpenOrderConfirm: () => void;
}) {
  return (
    <section className="book-section book-preview-section" aria-labelledby="book-preview-title">
      <div className="book-section-heading">
        <div>
          <span>5. 미리보기</span>
          <h2 id="book-preview-title">템플릿 책 미리보기와 예상 견적</h2>
          <p>기록 선택에서 넘긴 데이터를 템플릿 페이지에 배치한 미리보기입니다. 실제 인쇄용 PDF와 여백/재단은 다를 수 있습니다.</p>
        </div>
        <BookImage size={24} />
      </div>

      <div className="book-preview-layout">
        <BookTemplatePreviewViewer preview={preview} />

        <aside className="book-estimate-panel">
          <h3>{preview.product.displayName}</h3>
          <dl>
            <div>
              <dt>예상 페이지</dt>
              <dd>{preview.pageRange.estimatedPageCount}p</dd>
            </div>
            <div>
              <dt>기본가</dt>
              <dd>{formatCurrency(preview.estimate.basePrice)}</dd>
            </div>
            <div>
              <dt>추가 페이지</dt>
              <dd>{formatCurrency(preview.estimate.additionalPagePrice)}</dd>
            </div>
            <div>
              <dt>배송비</dt>
              <dd>{formatCurrency(preview.estimate.shippingPrice)}</dd>
            </div>
            <div>
              <dt>수량</dt>
              <dd>{preview.estimate.quantity}권</dd>
            </div>
            <div className="total">
              <dt>예상 총액</dt>
              <dd>{formatCurrency(preview.estimate.totalPrice)}</dd>
            </div>
          </dl>
          {preview.warnings.length > 0 ? (
            <ul className="book-warning-list">
              {preview.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}
          <button className="primary-button full-width" type="button" onClick={onOpenOrderConfirm}>
            주문 요청하기
          </button>
        </aside>
      </div>
    </section>
  );
}

function BookOrdersView({
  mode,
  orders,
  selectedOrder,
  loading,
  detailLoading,
  actionLoading,
  onOpenOrder,
  onOpenCancel,
  onCloseOrderDetail,
}: {
  mode: "status" | "history";
  orders: PrintOrderSummary[];
  selectedOrder: PrintOrderDetail | null;
  loading: boolean;
  detailLoading: boolean;
  actionLoading: boolean;
  onOpenOrder: (orderId: number) => void;
  onOpenCancel?: () => void;
  onCloseOrderDetail: () => void;
}) {
  const isStatusMode = mode === "status";
  const table = useOrderTableState(orders);
  const csvPrefix = isStatusMode ? "book-status-orders" : "book-history-orders";

  return (
    <>
      <header className="page-header">
        <div>
          <h1>{isStatusMode ? "주문 상태" : "주문 내역"}</h1>
          <p>{isStatusMode ? "제작이 끝나기 전까지의 주문 진행 상황을 확인합니다." : "완료, 취소, 오류 처리된 주문을 모아서 확인합니다."}</p>
        </div>
      </header>

      <section className="book-page book-orders-page" aria-busy={loading || detailLoading}>
        <div className="book-order-list-panel order-table-panel">
          <div className="book-section-heading compact">
            <div>
              <span>{isStatusMode ? "진행 주문" : "지난 주문"}</span>
              <h2>{table.filteredOrders.length}건</h2>
            </div>
          </div>

          <OrderTableToolbar
            filters={table.filters}
            actionFilterLabel={table.actionFilterLabel}
            showActionFilter={false}
            resultCount={table.filteredOrders.length}
            selectedCount={table.selectedOrders.length}
            allCsvDisabled={orders.length === 0}
            filteredCsvDisabled={table.filteredOrders.length === 0}
            onFilterChange={table.updateFilter}
            onReset={() => table.resetFilters()}
            onDownloadAll={() => downloadPrintOrdersCsv(`${csvPrefix}-all.csv`, orders)}
            onDownloadFiltered={() => downloadPrintOrdersCsv(`${csvPrefix}-filtered.csv`, table.filteredOrders)}
            onDownloadSelected={() => downloadPrintOrdersCsv(`${csvPrefix}-selected.csv`, table.selectedOrders)}
          />

          <PrintOrderDataTable
            orders={table.visibleOrders}
            selectedOrderId={selectedOrder?.id ?? null}
            selectedIds={table.selectedIds}
            loading={loading}
            emptyMessage={isStatusMode ? "조건에 맞는 진행 주문이 없습니다." : "조건에 맞는 지난 주문이 없습니다."}
            onToggleOrder={table.toggleOrder}
            onToggleVisibleOrders={table.toggleVisibleOrders}
            onOpenOrder={onOpenOrder}
          />
        </div>
      </section>

      {detailLoading || selectedOrder ? (
        <PrintOrderDetailModal
          order={selectedOrder}
          detailLoading={detailLoading}
          actionLoading={actionLoading}
          onOpenCancel={isStatusMode ? onOpenCancel : undefined}
          onClose={onCloseOrderDetail}
        />
      ) : null}
    </>
  );
}

function BookOrderConfirmModal({
  preview,
  creating,
  onCreateOrder,
  onClose,
}: {
  preview: BookPreviewResponse;
  creating: boolean;
  onCreateOrder: () => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal book-order-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="book-order-confirm-title">
        <div className="modal-title-row">
          <div>
            <h2 id="book-order-confirm-title">주문 요청 확인</h2>
            <p>미리보기와 견적 스냅샷을 주문으로 저장합니다.</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="닫기" disabled={creating}>
            <X size={18} />
          </button>
        </div>

        <dl className="book-order-confirm-list">
          <div>
            <dt>상품</dt>
            <dd>{preview.product.displayName}</dd>
          </div>
          <div>
            <dt>방</dt>
            <dd>{preview.roomName}</dd>
          </div>
          <div>
            <dt>기간</dt>
            <dd>{formatDateLabel(preview.period.startDate)} ~ {formatDateLabel(preview.period.endDate)}</dd>
          </div>
          <div>
            <dt>콘텐츠</dt>
            <dd>{preview.contents.length}개 · {preview.pageRange.estimatedPageCount}p</dd>
          </div>
          <div className="total">
            <dt>예상 총액</dt>
            <dd>{formatCurrency(preview.estimate.totalPrice)}</dd>
          </div>
        </dl>

        <div className="modal-actions">
          <button className="outline-button" type="button" onClick={onClose} disabled={creating}>
            취소
          </button>
          <button className="primary-button" type="button" onClick={onCreateOrder} disabled={creating}>
            {creating ? "주문 요청 중" : "주문 요청 생성"}
          </button>
        </div>
      </section>
    </div>
  );
}

function BookOrderCancelModal({
  order,
  loading,
  onCancelOrder,
  onClose,
}: {
  order: PrintOrderDetail;
  loading: boolean;
  onCancelOrder: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal book-order-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="book-order-cancel-title">
        <div className="modal-title-row">
          <div>
            <h2 id="book-order-cancel-title">주문 취소</h2>
            <p>{order.orderNo} 주문을 취소 처리합니다.</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="닫기" disabled={loading}>
            <X size={18} />
          </button>
        </div>

        <dl className="book-order-confirm-list">
          <div>
            <dt>상품</dt>
            <dd>{order.product.displayName}</dd>
          </div>
          <div>
            <dt>현재 상태</dt>
            <dd>{order.statusLabel}</dd>
          </div>
          <div className="total">
            <dt>주문 금액</dt>
            <dd>{formatCurrency(order.totalPrice)}</dd>
          </div>
        </dl>

        <label className="book-order-cancel-field">
          취소 사유
          <textarea
            rows={4}
            maxLength={255}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="예: 제작 요청 전 다시 구성하고 싶습니다."
          />
        </label>

        <div className="modal-actions">
          <button className="outline-button" type="button" onClick={onClose} disabled={loading}>
            닫기
          </button>
          <button className="primary-button" type="button" onClick={() => onCancelOrder(reason)} disabled={loading}>
            {loading ? "취소 처리 중" : "취소 처리"}
          </button>
        </div>
      </section>
    </div>
  );
}

function SettingsView({
  profile,
  initials,
  onOpenProfileEdit,
  onLogout,
}: {
  profile: MemberProfile | null;
  initials: string;
  onOpenProfileEdit: () => void;
  onLogout: () => void;
}) {
  const [openQaTitle, setOpenQaTitle] = useState<string | null>("해당 서비스는 회원가입이 없나요?");
  const qaItems = [
    {
      title: "해당 서비스는 회원가입이 없나요?",
      help: '네, 해당 서비스는 "과제 안내문"의 "실행 직후 로그인 없이도 서비스를 바로 확인할 수 있는 서비스"의 조건을 충족 시키기 위해, 사전에 미리 세팅 된 4개의 유저들을 선택하여 로그인할 수 있게 기획되었습니다.',
    },
    {
      title: "방에서 유저의 권한에 따라 접근 가능한 기능이 다른가요?",
      help: "네, 방장에게만 친구 초대, 방 정보 수정, 방 삭제 등의 기능이 지원되며, 멤버의 경우는 위 기능들이 지원되지 않습니다.",
    },
    {
      title: "추억 게시판은 어떠한 기능인가요?",
      help: "추억 게시판은 멤버들끼리 함께한 추억을 사진과 글을 통해 기록하며, 채팅형 댓글을 통해 멤버들과 추억을 기록할 수 있는 게시판입니다.",
    },
    {
      title: "미션 인증은 어떠한 기능인가요?",
      help: "미션 인증은 각 방의 Type 별로 사전 세팅된 20개의 기본 미션에 커스텀 미션(사용자가 추가 가능)이 추가된 기능입니다. 미션에 맞는 사진과 글을 업로드 하고 채팅형 댓글을 통해 멤버들과 미션을 인증할 수 있는 게시판입니다.",
    },
    {
      title: "편지는 어떠한 기능인가요?",
      help: "편지는 방 구성원 중 한명에게만 편지를 전달할 수 있는 기능입니다. 이는 방 내 다른 멤버들이 조회가 불가능합니다.",
    },
    {
      title: "방의 타입은 무엇이 있나요?",
      help: "방의 타입은 커플/가족/학급 및 동아리가 있습니다. 이는 다양한 연령대의 유저들의 일상을 기록하기 위함입니다.",
    },
  ];

  return (
    <>
      <header className="page-header">
        <div>
          <h1>설정</h1>
        </div>
      </header>

      <section className="settings-layout">
        <article className="profile-panel settings-profile-panel">
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

          <div className="settings-profile-actions">
            <button className="primary-button full-width" type="button" onClick={onOpenProfileEdit}>
              프로필 수정
            </button>
            <button className="outline-button settings-logout-button" type="button" onClick={onLogout}>
              <LogOut size={17} />
              로그아웃
            </button>
          </div>
        </article>

        <section className="settings-stack">
          <article className="settings-card settings-help-card">
            <div className="panel-heading">
              <div>
                <span>도움말</span>
                <h2>Q&A</h2>
              </div>
              <CircleHelp size={24} />
            </div>

            <div className="settings-accordion-list" aria-label="도움말 목록">
              {qaItems.map((item) => (
                <button
                  className={`settings-accordion-item ${openQaTitle === item.title ? "open" : ""}`}
                  key={item.title}
                  type="button"
                  aria-expanded={openQaTitle === item.title}
                  onClick={() => setOpenQaTitle((current) => (current === item.title ? null : item.title))}
                >
                  <span className="settings-accordion-question">
                    <strong>{item.title}</strong>
                    <ChevronDown size={18} />
                  </span>
                  <span className="settings-accordion-answer">{item.help}</span>
                </button>
              ))}
            </div>
          </article>
        </section>
      </section>
    </>
  );
}

function ProfileEditModal({
  profile,
  profileForm,
  onProfileFormChange,
  onSave,
  onClose,
}: {
  profile: MemberProfile | null;
  profileForm: ProfileForm;
  onProfileFormChange: (form: ProfileForm) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const [profileImageError, setProfileImageError] = useState<string | null>(null);
  const uploadInputId = "profile-image-upload";
  const previewInitial = profileForm.displayName.trim().slice(0, 1) || profile?.displayName.slice(0, 1) || "나";

  function updateProfileImage(file: File) {
    setProfileImageError(null);

    const hasAllowedType = profileImageAllowedTypes.includes(file.type);
    const hasAllowedExtension = /\.(jpe?g|png|gif|webp)$/i.test(file.name);

    if (!hasAllowedType && !hasAllowedExtension) {
      setProfileImageError("jpg, png, gif, webp 형식의 이미지만 선택할 수 있습니다.");
      return;
    }

    if (file.size > profileImageMaxBytes) {
      setProfileImageError("프로필 이미지는 5MB 이하 파일만 선택할 수 있습니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setProfileImageError("이미지를 읽는 중 문제가 발생했습니다.");
        return;
      }

      onProfileFormChange({ ...profileForm, profileImageUrl: reader.result });
    };
    reader.onerror = () => setProfileImageError("이미지를 읽는 중 문제가 발생했습니다.");
    reader.readAsDataURL(file);
  }

  function handleImageDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      updateProfileImage(file);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal profile-edit-modal" role="dialog" aria-modal="true" aria-labelledby="profile-edit-title">
        <div className="modal-title-row">
          <div>
            <div className="heading-help-row">
              <h2 id="profile-edit-title">프로필 수정</h2>
              <HelpButton title="프로필 수정" message="이름과 프로필 이미지만 수정할 수 있습니다. 아이디, 이메일, 전화번호는 초대와 식별에 사용하므로 수정하지 않습니다." />
            </div>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </div>
        <label className="field">
          이름
          <input
            value={profileForm.displayName}
            onChange={(event) => onProfileFormChange({ ...profileForm, displayName: event.target.value })}
            placeholder="이름"
          />
        </label>

        <div
          className={`profile-upload-dropzone ${profileForm.profileImageUrl ? "has-image" : ""}`}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleImageDrop}
        >
          <input
            id={uploadInputId}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                updateProfileImage(file);
              }
              event.currentTarget.value = "";
            }}
          />
          <div className="profile-upload-preview" aria-label="프로필 이미지 미리보기">
            {profileForm.profileImageUrl ? <img src={profileForm.profileImageUrl} alt="" /> : <span>{previewInitial}</span>}
          </div>
          <div>
            <strong>프로필 이미지</strong>
            <span>사진을 끌어놓거나 파일을 선택하세요.</span>
            <small>jpg, png, gif, webp · 5MB 이하</small>
          </div>
          <label className="outline-button upload-pick-button" htmlFor={uploadInputId}>
            파일 선택
          </label>
        </div>
        {profileImageError ? <p className="profile-form-error">{profileImageError}</p> : null}

        <dl className="profile-readonly-grid" aria-label="수정할 수 없는 회원 식별 정보">
          <div>
            <dt>아이디</dt>
            <dd>{profile?.username ?? "-"}</dd>
          </div>
          <div>
            <dt>이메일</dt>
            <dd>{profile?.email ?? "-"}</dd>
          </div>
          <div>
            <dt>전화번호</dt>
            <dd>{profile?.phoneNumber ?? "-"}</dd>
          </div>
        </dl>
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

function LogoutModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="logout-title">
        <h2 id="logout-title">로그아웃할까요?</h2>
        <p>현재 체험 사용자를 종료하고 사용자 선택 화면으로 돌아간다.</p>
        <div className="modal-actions">
          <button className="outline-button" type="button" onClick={onClose}>
            취소
          </button>
          <button className="primary-button" type="button" onClick={onConfirm}>
            로그아웃
          </button>
        </div>
      </section>
    </div>
  );
}

function InviteeSelectionModal({
  roomName,
  keyword,
  candidates,
  invitingMemberId,
  onInvite,
  onClose,
}: {
  roomName: string;
  keyword: string;
  candidates: InviteeSearchResult[];
  invitingMemberId: number | null;
  onInvite: (inviteeMemberId: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal invitee-selection-modal" role="dialog" aria-modal="true" aria-labelledby="invitee-selection-title">
        <div className="modal-title-row">
          <div>
            <h2 id="invitee-selection-title">초대할 회원 선택</h2>
            <p>
              {roomName}에 초대할 대상을 선택한다. 검색어: <strong>{keyword}</strong>
            </p>
          </div>
          <button className="icon-button" type="button" aria-label="닫기" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="invitee-selection-list">
          {candidates.map((invitee) => (
            <div className="invitee-card" key={invitee.id}>
              <div className="invitee-avatar" aria-hidden="true">
                {invitee.profileImageUrl ? <img src={resolveImageSource(invitee.profileImageUrl)} alt="" /> : invitee.displayName.slice(0, 1)}
              </div>
              <div className="invitee-info">
                <strong>{invitee.displayName}</strong>
                <span>아이디 {invitee.username}</span>
                <p>
                  {invitee.maskedEmail} · {invitee.maskedPhoneNumber}
                </p>
              </div>
              <button
                className="primary-button small-button"
                type="button"
                onClick={() => onInvite(invitee.id)}
                disabled={invitingMemberId === invitee.id}
              >
                {invitingMemberId === invitee.id ? "초대 중" : "초대"}
              </button>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button className="outline-button" type="button" onClick={onClose}>
            닫기
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

function MemoryEditModal({
  post,
  form,
  loading,
  imageUploading,
  onFormChange,
  onImageUpload,
  onImageClear,
  onSave,
  onClose,
}: {
  post: MemoryPostDetail;
  form: MemoryPostForm;
  loading: boolean;
  imageUploading: boolean;
  onFormChange: (form: MemoryPostForm) => void;
  onImageUpload: (file: File) => void;
  onImageClear: () => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const uploadInputId = `memory-edit-image-upload-${post.id}`;

  function handleImageDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      onImageUpload(file);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal memory-edit-modal" role="dialog" aria-modal="true" aria-labelledby="memory-edit-title">
        <div className="modal-title-row">
          <div>
            <h2 id="memory-edit-title">추억 수정</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </div>
        <div className="memory-form memory-edit-form">
          <label>
            제목
            <input
              value={form.title}
              onChange={(event) => onFormChange({ ...form, title: event.target.value })}
              placeholder="추억 제목"
            />
          </label>
          <label>
            날짜
            <input
              type="date"
              value={form.occurredDate}
              onChange={(event) => onFormChange({ ...form, occurredDate: event.target.value })}
            />
          </label>
          <div
            className={`memory-upload-dropzone memory-form-wide ${form.representativeImageUrl ? "has-image" : ""}`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleImageDrop}
          >
            <input
              id={uploadInputId}
              type="file"
              accept="image/*"
              disabled={imageUploading || loading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  onImageUpload(file);
                }
                event.currentTarget.value = "";
              }}
            />
            <UploadCloud size={28} />
            <div>
              <strong>{imageUploading ? "이미지 업로드 중" : "대표 사진 변경"}</strong>
              <span>사진을 끌어놓거나 파일을 선택한다.</span>
            </div>
            <label className="outline-button upload-pick-button" htmlFor={uploadInputId}>
              파일 선택
            </label>
          </div>
          {form.representativeImageUrl ? (
            <div className="memory-upload-preview memory-form-wide">
              <MemoryImage imageUrl={form.representativeImageUrl} title={form.representativeImageName || "대표 사진"} />
              <div>
                <strong>{form.representativeImageName || "대표 사진"}</strong>
                <span>수정 후 대표 사진으로 사용한다.</span>
              </div>
              <button className="icon-button" type="button" onClick={onImageClear} aria-label="선택 이미지 제거">
                <X size={18} />
              </button>
            </div>
          ) : null}
          <label className="memory-form-wide">
            내용
            <textarea
              value={form.body}
              onChange={(event) => onFormChange({ ...form, body: event.target.value })}
              placeholder="추억 내용을 입력해 주세요."
              rows={5}
            />
          </label>
        </div>
        <div className="modal-actions">
          <button className="outline-button" type="button" onClick={onClose} disabled={loading}>
            취소
          </button>
          <button className="primary-button" type="button" onClick={onSave} disabled={loading || imageUploading}>
            {loading ? "수정 중" : "수정 완료"}
          </button>
        </div>
      </section>
    </div>
  );
}

function MemoryDeleteModal({
  post,
  loading,
  onDelete,
  onClose,
}: {
  post: MemoryPostDetail;
  loading: boolean;
  onDelete: () => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="alertdialog" aria-modal="true" aria-labelledby="memory-delete-title">
        <div className="modal-title-row">
          <div>
            <h2 id="memory-delete-title">추억을 삭제할까요?</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </div>
        <div className="delete-warning">
          <strong>{post.title}</strong>
          <span>삭제 후에는 이번 MVP 화면에서 다시 복구할 수 없다.</span>
        </div>
        <div className="modal-actions">
          <button className="outline-button" type="button" onClick={onClose} disabled={loading}>
            취소
          </button>
          <button className="danger-button" type="button" onClick={onDelete} disabled={loading}>
            {loading ? "삭제 중" : "삭제"}
          </button>
        </div>
      </section>
    </div>
  );
}

function RoomSettingsModal({
  mode,
  room,
  editForm,
  loading,
  onModeChange,
  onEditFormChange,
  onSave,
  onDelete,
  onClose,
}: {
  mode: RoomSettingsMode;
  room: RoomDetail | null;
  editForm: { name: string; description: string };
  loading: boolean;
  onModeChange: (mode: RoomSettingsMode) => void;
  onEditFormChange: (form: { name: string; description: string }) => void;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const canManage = room?.canManage ?? false;

  if (!room) {
    return (
      <div className="modal-backdrop" role="presentation">
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="room-settings-loading-title">
          <h2 id="room-settings-loading-title">방 설정</h2>
          <p>방 정보를 불러오는 중입니다.</p>
          <div className="modal-actions">
            <button className="outline-button" type="button" onClick={onClose}>
              닫기
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (mode === "info") {
    return (
      <div className="modal-backdrop" role="presentation">
        <section className="modal room-settings-modal" role="dialog" aria-modal="true" aria-labelledby="room-info-title">
          <div className="modal-title-row">
            <div>
              <h2 id="room-info-title">방 정보 조회</h2>
            </div>
            <button className="icon-button" type="button" aria-label="닫기" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
          <dl className="room-detail-list">
            <div>
              <dt>방 이름</dt>
              <dd>{room.name}</dd>
            </div>
            <div>
              <dt>방 설명</dt>
              <dd>{room.description ?? "설명 없음"}</dd>
            </div>
            <div>
              <dt>방 타입</dt>
              <dd>{roomTypeLabel(room.type)}</dd>
            </div>
            <div>
              <dt>내 역할</dt>
              <dd>{room.role === "OWNER" ? "방장" : "멤버"}</dd>
            </div>
            <div>
              <dt>멤버</dt>
              <dd>{room.memberCount}명</dd>
            </div>
          </dl>
          <div className="modal-actions">
            <button className="outline-button" type="button" onClick={() => onModeChange("menu")}>
              이전
            </button>
            <button className="primary-button" type="button" onClick={onClose}>
              확인
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (mode === "edit") {
    return (
      <div className="modal-backdrop" role="presentation">
        <section className="modal room-settings-modal" role="dialog" aria-modal="true" aria-labelledby="room-edit-title">
          <div className="modal-title-row">
            <div>
              <h2 id="room-edit-title">방 정보 수정</h2>
            </div>
            <button className="icon-button" type="button" aria-label="닫기" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
          <label className="field">
            방 이름
            <input
              value={editForm.name}
              onChange={(event) => onEditFormChange({ ...editForm, name: event.target.value })}
              disabled={!canManage || loading}
              placeholder="방 이름"
            />
          </label>
          <label className="field">
            방 설명
            <textarea
              value={editForm.description}
              onChange={(event) => onEditFormChange({ ...editForm, description: event.target.value })}
              disabled={!canManage || loading}
              placeholder="방 설명"
              rows={4}
            />
          </label>
          {!canManage ? <p className="modal-help-text">멤버는 방 정보를 수정할 수 없습니다.</p> : null}
          <div className="modal-actions">
            <button className="outline-button" type="button" onClick={() => onModeChange("menu")} disabled={loading}>
              이전
            </button>
            <button className="primary-button" type="button" onClick={onSave} disabled={!canManage || loading || !editForm.name.trim()}>
              {loading ? "저장 중" : "저장"}
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (mode === "delete") {
    return (
      <div className="modal-backdrop" role="presentation">
        <section className="modal room-settings-modal" role="alertdialog" aria-modal="true" aria-labelledby="room-delete-title">
          <div className="modal-title-row">
            <div>
              <h2 id="room-delete-title">방 삭제</h2>
            </div>
            <button className="icon-button" type="button" aria-label="닫기" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
          <div className="delete-warning">
            <strong>{room.name}</strong>
            <span>이 방을 삭제하려면 방장 권한이 필요하다.</span>
          </div>
          <div className="modal-actions">
            <button className="outline-button" type="button" onClick={() => onModeChange("menu")} disabled={loading}>
              이전
            </button>
            <button className="danger-button" type="button" onClick={onDelete} disabled={!canManage || loading}>
              {loading ? "삭제 중" : "삭제"}
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal room-settings-modal" role="dialog" aria-modal="true" aria-labelledby="room-settings-title">
        <div className="modal-title-row">
          <div>
            <h2 id="room-settings-title">방 설정</h2>
          </div>
          <button className="icon-button" type="button" aria-label="닫기" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="room-settings-actions">
          <button type="button" onClick={() => onModeChange("info")}>
            <BookOpen size={22} />
            <span>
              <strong>방 정보 조회</strong>
            </span>
          </button>
          <button type="button" onClick={() => onModeChange("edit")} disabled={!canManage}>
            <FileText size={22} />
            <span>
              <strong>방 정보 수정</strong>
            </span>
          </button>
          <button className="danger-action" type="button" onClick={() => onModeChange("delete")} disabled={!canManage}>
            <ShieldAlert size={22} />
            <span>
              <strong>방 삭제</strong>
            </span>
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
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={`toggle-field ${disabled ? "is-disabled" : ""}`}>
      <span className="toggle-copy">
        <strong>{label}</strong>
        {description ? <small>{description}</small> : null}
      </span>
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

function isBookArchiveView(view: AppView): view is BookArchiveView {
  return view === "bookProducts" || view === "bookCreate" || view === "bookStatus" || view === "bookHistory";
}

function bookContentKey(content: Pick<BookContentCandidate, "type" | "sourceId">): string {
  return `${content.type}:${content.sourceId}`;
}

function initialBookSelection(response: BookContentCandidatesResponse): Record<string, boolean> {
  const selection: Record<string, boolean> = {};
  response.defaultContents.forEach((content) => {
    selection[bookContentKey(content)] = true;
  });
  response.additionalContents.forEach((content) => {
    selection[bookContentKey(content)] = false;
  });

  return selection;
}

function filterBookContentCandidatesResponse(
  response: BookContentCandidatesResponse,
  contentTypes: BookContentType[],
): BookContentCandidatesResponse {
  if (contentTypes.length === bookCandidateContentTypeOptions.length) {
    return response;
  }

  const selectedTypes = new Set(contentTypes);
  const defaultContents = response.defaultContents.filter((content) => selectedTypes.has(content.type));
  const additionalContents = response.additionalContents.filter((content) => selectedTypes.has(content.type));
  const pageRange = buildBookPageRange(response.product, defaultContents) ?? response.pageRange;

  return {
    ...response,
    defaultContents,
    additionalContents,
    summary: buildBookContentSummary(defaultContents, pageRange.estimatedPageCount),
    pageRange,
  };
}

function sortBookContents(
  contents: BookContentCandidate[],
  orderMode: BookContentOrderMode,
  contentTypeOrder: BookContentType[],
): BookContentCandidate[] {
  const typeRank = (type: BookContentType) => {
    const index = contentTypeOrder.indexOf(type);
    return index === -1 ? defaultBookContentTypeOrder.indexOf(type) : index;
  };

  return [...contents].sort((first, second) => {
    if (orderMode === "TYPE") {
      const typeCompare = typeRank(first.type) - typeRank(second.type);
      if (typeCompare !== 0) return typeCompare;
      const dateCompare = first.occurredDate.localeCompare(second.occurredDate);
      if (dateCompare !== 0) return dateCompare;
      return first.sourceId - second.sourceId;
    }

    const dateCompare = first.occurredDate.localeCompare(second.occurredDate);
    if (dateCompare !== 0) return dateCompare;
    return defaultBookContentTypeOrder.indexOf(first.type) - defaultBookContentTypeOrder.indexOf(second.type) || first.sourceId - second.sourceId;
  });
}

function filterBookContents(
  contents: BookContentCandidate[],
  filter: BookContentFilter,
  selectedContentKeys: Record<string, boolean>,
): BookContentCandidate[] {
  if (filter === "ALL") return contents;
  if (filter === "SELECTED") return contents.filter((content) => selectedContentKeys[bookContentKey(content)]);
  if (filter === "UNSELECTED") return contents.filter((content) => !selectedContentKeys[bookContentKey(content)]);
  return contents.filter((content) => content.type === filter);
}

function buildBookContentFilterCounts(
  contents: BookContentCandidate[],
  selectedContentKeys: Record<string, boolean>,
): Record<BookContentFilter, number> {
  return {
    ALL: contents.length,
    MEMORY: contents.filter((content) => content.type === "MEMORY").length,
    MISSION: contents.filter((content) => content.type === "MISSION").length,
    LETTER: contents.filter((content) => content.type === "LETTER").length,
    CHAT: contents.filter((content) => content.type === "CHAT").length,
    SELECTED: contents.filter((content) => selectedContentKeys[bookContentKey(content)]).length,
    UNSELECTED: contents.filter((content) => !selectedContentKeys[bookContentKey(content)]).length,
  };
}

function bookContentFilterLabel(filter: BookContentFilter): string {
  if (filter === "ALL") return "전체";
  if (filter === "SELECTED") return "선택됨";
  if (filter === "UNSELECTED") return "미선택";
  if (filter === "MEMORY") return "추억";
  if (filter === "MISSION") return "미션";
  if (filter === "LETTER") return "편지";
  return "채팅";
}

function bookPageAllocationTooltip(): string {
  return [
    "편지: 기본 2p",
    "미션 인증: 기본 2p, 댓글이 많으면 추가",
    "추억 게시글: 기본 2p, 사진/댓글 수에 따라 추가",
    "채팅 묶음: 메시지 수 기준으로 1p+",
  ].join("\n");
}

function findMissionByBookContent(missionList: MissionListResponse, content: BookContentCandidate): MissionSummary | null {
  return missionList.missions.find((mission) => mission.latestSubmission?.id === content.sourceId || mission.id === content.sourceId) ?? null;
}

function fallbackMemoryDetailFromBookContent(roomId: number, content: BookContentCandidate): MemoryPostDetail {
  return {
    id: content.sourceId,
    roomId,
    authorMemberId: 0,
    authorName: content.authorName,
    title: content.title,
    body: content.description,
    representativeImageUrl: content.imageCount > 0 ? `https://picsum.photos/seed/book-memory-${content.sourceId}/900/620` : null,
    imageCount: content.imageCount,
    commentCount: content.commentCount,
    occurredDate: content.occurredDate,
    createdAt: `${content.occurredDate}T12:00:00+09:00`,
    mine: false,
    comments: [],
  };
}

function fallbackMissionDetailFromBookContent(roomId: number, content: BookContentCandidate): MissionSummary {
  const requiredApprovalCount = 1;

  return {
    id: content.sourceId,
    roomId,
    title: content.title,
    description: "책 만들기 후보로 불러온 미션 인증 기록입니다.",
    status: "WAITING_APPROVAL",
    createdByMemberId: 0,
    createdByName: content.authorName,
    custom: false,
    completedAt: null,
    latestSubmission: {
      id: content.sourceId,
      missionId: content.sourceId,
      submitterMemberId: 0,
      submitterName: content.authorName,
      body: content.description,
      imageUrl: content.imageCount > 0 ? `https://picsum.photos/seed/book-mission-${content.sourceId}/900/620` : "",
      occurredDate: content.occurredDate,
      submittedAt: `${content.occurredDate}T12:00:00+09:00`,
      mine: false,
      approvedCount: 0,
      totalMemberCount: 1,
      requiredApprovalCount,
      approvalRate: 0,
      myDecision: null,
      canApprove: false,
      completed: false,
    },
    comments: [],
  };
}

function fallbackLetterDetailFromBookContent(roomId: number, content: BookContentCandidate): LetterDetail {
  const [routeText, bodyText] = content.description.split(" · ");
  const [senderName, receiverName] = routeText?.includes("->")
    ? routeText.split("->").map((value) => value.trim())
    : [content.authorName, "방 구성원"];

  return {
    id: content.sourceId,
    roomId,
    title: content.title,
    body: bodyText || content.description,
    senderMemberId: 0,
    senderName: senderName || content.authorName,
    receiverMemberId: 0,
    receiverName: receiverName || "방 구성원",
    sentAt: `${content.occurredDate}T12:00:00+09:00`,
    occurredDate: content.occurredDate,
    readAt: null,
    read: true,
    mine: false,
  };
}

function fallbackChatMessagesFromBookContent(roomId: number, content: BookContentCandidate): ChatMessage[] {
  return [
    {
      id: content.sourceId,
      roomId,
      senderMemberId: 0,
      senderName: content.authorName,
      senderType: "MEMBER",
      body: content.description,
      sentAt: `${content.occurredDate}T12:00:00+09:00`,
      occurredDate: content.occurredDate,
      mine: false,
    },
  ];
}

function buildBookContentSummary(contents: BookContentCandidate[], estimatedPageCount: number): BookContentSummary {
  return {
    memoryCount: contents.filter((content) => content.type === "MEMORY").length,
    missionCount: contents.filter((content) => content.type === "MISSION").length,
    letterCount: contents.filter((content) => content.type === "LETTER").length,
    chatCount: contents.filter((content) => content.type === "CHAT").length,
    estimatedPageCount,
  };
}

function buildBookPageRange(product: BookProduct | null, contents: BookContentCandidate[]): BookPageRange | null {
  if (!product) return null;
  if (contents.length === 0) {
    return {
      minPage: product.minPage,
      maxPage: product.maxPage,
      estimatedPageCount: 0,
      status: "AVAILABLE",
      message: "책에 담을 기록을 선택해 주세요.",
    };
  }

  const rawPageCount = 4 + contents.reduce((sum, content) => sum + content.pageCount, 0);
  if (rawPageCount > product.maxPage) {
    return {
      minPage: product.minPage,
      maxPage: product.maxPage,
      estimatedPageCount: rawPageCount,
      status: "OVER_MAX",
      message: `선택한 콘텐츠가 ${product.maxPage}페이지를 넘어 다음 단계로 진행할 수 없습니다.`,
    };
  }

  if (rawPageCount < product.minPage) {
    return {
      minPage: product.minPage,
      maxPage: product.maxPage,
      estimatedPageCount: product.minPage,
      status: "AVAILABLE",
      message: "선택 콘텐츠가 최소 페이지보다 적어 템플릿 기본 페이지로 보정됩니다.",
    };
  }

  return {
    minPage: product.minPage,
    maxPage: product.maxPage,
    estimatedPageCount: rawPageCount,
    status: "AVAILABLE",
    message: "선택한 콘텐츠가 상품 페이지 범위 안에 있습니다.",
  };
}

function demoBookProducts(): BookProduct[] {
  return [
    {
      uid: "PHOTOBOOK_A4_SC",
      displayName: "A4 소프트커버 포토북",
      sizeName: "A4",
      widthMm: 210,
      heightMm: 297,
      coverType: "SOFTCOVER",
      bindingType: "무선제본",
      paperDescription: "사진 중심 템플릿에 적합한 큰 판형",
      minPage: 24,
      maxPage: 130,
      basePrice: 32000,
      includedPageCount: 40,
      additionalPagePrice: 300,
      shippingPrice: 3000,
      creationType: "TEMPLATE",
      note: "큰 사진과 긴 기록을 넉넉하게 보여주는 소프트커버 상품",
    },
    {
      uid: "PHOTOBOOK_A5_SC",
      displayName: "A5 소프트커버 포토북",
      sizeName: "A5",
      widthMm: 148,
      heightMm: 210,
      coverType: "SOFTCOVER",
      bindingType: "무선제본",
      paperDescription: "텍스트와 사진이 섞인 일상 기록에 적합한 휴대형 판형",
      minPage: 50,
      maxPage: 200,
      basePrice: 28000,
      includedPageCount: 50,
      additionalPagePrice: 220,
      shippingPrice: 3000,
      creationType: "TEMPLATE",
      note: "추억 게시글, 미션, 편지를 길게 담기 좋은 소프트커버 상품",
    },
    {
      uid: "SQUAREBOOK_HC",
      displayName: "고화질 스퀘어북 (하드커버)",
      sizeName: "Square",
      widthMm: 204,
      heightMm: 204,
      coverType: "HARDCOVER",
      bindingType: "양장제본",
      paperDescription: "대표 사진과 기념일 기록을 강조하는 정사각 판형",
      minPage: 24,
      maxPage: 130,
      basePrice: 46000,
      includedPageCount: 40,
      additionalPagePrice: 420,
      shippingPrice: 3000,
      creationType: "TEMPLATE",
      note: "기념 선물용 완성도를 강조한 하드커버 상품",
    },
  ];
}

function demoBookRoomsForCreate(memberId: number): BookCreateRoom[] {
  return demoRoomsForMember(memberId).map((room) => ({
    id: room.id,
    name: room.name,
    type: room.type,
    memberCount: room.memberCount,
    bookableRecordCount: demoMemoryPosts(room.id).length
      + demoMissionList(room.id).missions.filter((mission) => mission.latestSubmission).length
      + demoLetters(room.id, "RECEIVED").length
      + demoLetters(room.id, "SENT").length,
  }));
}

function buildDemoBookContentCandidates(
  roomId: number,
  productUid: string,
  period: BookPeriod,
  memberId: number,
  contentTypes: BookContentType[] = bookCandidateContentTypeOptions,
): BookContentCandidatesResponse {
  const room = demoRoomsForMember(memberId).find((candidate) => candidate.id === roomId) ?? demoRooms[0];
  const product = demoBookProducts().find((candidate) => candidate.uid === productUid) ?? demoBookProducts()[0];
  const selectedTypes = new Set(contentTypes);
  const memories = demoMemoryPosts(room.id).map((post): BookContentCandidate => ({
    type: "MEMORY",
    sourceId: post.id,
    title: post.title,
    description: post.bodyPreview,
    occurredDate: post.occurredDate,
    authorName: post.authorName,
    imageCount: post.imageCount,
    commentCount: post.commentCount,
    pageCount: estimateDemoBookContentPage("MEMORY", post.imageCount, post.commentCount),
    selectedByDefault: inBookPeriod(post.occurredDate, period),
    sourceLabel: "추억 게시글",
  }));
  const missions = demoMissionList(room.id).missions
    .filter((mission) => mission.latestSubmission)
    .map((mission): BookContentCandidate => {
      const submission = mission.latestSubmission!;
      return {
        type: "MISSION",
        sourceId: submission.id,
        title: mission.title,
        description: submission.body,
        occurredDate: submission.occurredDate,
        authorName: submission.submitterName,
        imageCount: submission.imageUrl ? 1 : 0,
        commentCount: mission.comments.length,
        pageCount: estimateDemoBookContentPage("MISSION", submission.imageUrl ? 1 : 0, mission.comments.length),
        selectedByDefault: inBookPeriod(submission.occurredDate, period),
        sourceLabel: "미션 인증",
      };
    });
  const letters = [...demoLetters(room.id, "RECEIVED"), ...demoLetters(room.id, "SENT")].map((letter): BookContentCandidate => ({
    type: "LETTER",
    sourceId: letter.id,
    title: letter.title,
    description: `${letter.counterpartName} · ${letter.bodyPreview}`,
    occurredDate: letter.occurredDate,
    authorName: letter.counterpartName,
    imageCount: 0,
    commentCount: 0,
    pageCount: estimateDemoBookContentPage("LETTER", 0, 0),
    selectedByDefault: inBookPeriod(letter.occurredDate, period),
    sourceLabel: "편지",
  }));
  const chatDays = groupChatMessagesByDate(demoChatMessages(room.id)).map((chatDay): BookContentCandidate => ({
    type: "CHAT",
    sourceId: Number(chatDay.date.replace(/-/g, "")),
    title: `${chatDay.date} 채팅 묶음`,
    description: `선택한 날짜의 채팅 ${chatDay.messages.length}개를 책 구성에 포함합니다.`,
    occurredDate: chatDay.date,
    authorName: "방 구성원",
    imageCount: 0,
    commentCount: chatDay.messages.length,
    pageCount: estimateDemoBookContentPage("CHAT", 0, chatDay.messages.length),
    selectedByDefault: false,
    sourceLabel: "채팅",
  }));
  const nonChatContents = [...memories, ...missions, ...letters];
  const typeMatchedNonChatContents = nonChatContents.filter((content) => selectedTypes.has(content.type));
  const typeMatchedChatDays = chatDays.filter((content) => selectedTypes.has(content.type));
  const defaultContents = typeMatchedNonChatContents.filter((content) => inBookPeriod(content.occurredDate, period)).sort(bookContentSort);
  const additionalContents = [
    ...typeMatchedNonChatContents.filter((content) => !inBookPeriod(content.occurredDate, period)),
    ...typeMatchedChatDays.filter((content) => inBookPeriod(content.occurredDate, period)),
  ].sort((first, second) => second.occurredDate.localeCompare(first.occurredDate));
  const pageRange = buildBookPageRange(product, defaultContents) ?? {
    minPage: product.minPage,
    maxPage: product.maxPage,
    estimatedPageCount: 0,
    status: "AVAILABLE" as const,
    message: "책에 담을 기록을 선택해 주세요.",
  };

  return {
    roomId: room.id,
    roomName: room.name,
    product,
    period,
    defaultContents,
    additionalContents,
    summary: buildBookContentSummary(defaultContents, pageRange.estimatedPageCount),
    pageRange,
  };
}

function estimateDemoBookContentPage(type: BookContentType, imageCount: number, commentCount: number): number {
  if (type === "MEMORY") return 2 + Math.ceil(Math.max(imageCount - 1, 0) / 3) + (commentCount >= 6 ? 1 : 0);
  if (type === "MISSION") return 2 + (commentCount >= 5 ? 1 : 0);
  if (type === "LETTER") return 2;
  return Math.max(1, Math.ceil(commentCount / 14));
}

function inBookPeriod(date: string, period: BookPeriod): boolean {
  return date >= period.startDate && date <= period.endDate;
}

function bookContentSort(first: BookContentCandidate, second: BookContentCandidate): number {
  const dateCompare = first.occurredDate.localeCompare(second.occurredDate);
  if (dateCompare !== 0) return dateCompare;
  return bookContentTypeOrder(first.type) - bookContentTypeOrder(second.type) || first.sourceId - second.sourceId;
}

function bookContentTypeOrder(type: BookContentType): number {
  if (type === "MEMORY") return 1;
  if (type === "MISSION") return 2;
  if (type === "LETTER") return 3;
  return 4;
}

function bookContentTypeLabel(type: BookContentType): string {
  if (type === "MEMORY") return "추억 게시글";
  if (type === "MISSION") return "미션 인증";
  if (type === "LETTER") return "편지";
  return "채팅";
}

function bookContentTypeActivityKind(type: BookContentType): "memory" | "mission" | "letter" | "chat" {
  if (type === "MEMORY") return "memory";
  if (type === "MISSION") return "mission";
  if (type === "LETTER") return "letter";
  return "chat";
}

function orderDetailToSummary(order: PrintOrderDetail): PrintOrderSummary {
  return {
    id: order.id,
    orderNo: order.orderNo,
    memberId: order.memberId,
    memberName: order.memberName,
    roomId: order.roomId,
    roomName: order.roomName,
    product: order.product,
    title: order.title,
    quantity: order.quantity,
    estimatedPageCount: order.estimatedPageCount,
    totalPrice: order.totalPrice,
    status: order.status,
    statusLabel: order.statusLabel,
    requestedAt: order.requestedAt,
    updatedAt: order.updatedAt,
  };
}

function printOrderStatusTone(status: PrintOrderStatus): string {
  if (status === "PAID" || status === "PDF_READY" || status === "CONFIRMED") return "ready";
  if (status === "IN_PRODUCTION" || status === "PRODUCTION_COMPLETE" || status === "SHIPPED") return "working";
  if (status === "DELIVERED") return "done";
  if (status === "CANCELLED_REFUND") return "cancelled";
  return "error";
}

function canCancelPrintOrder(status: PrintOrderStatus): boolean {
  return status === "PAID" || status === "PDF_READY";
}

const printOrderStatusOptions: PrintOrderStatus[] = [
  "PAID",
  "PDF_READY",
  "CONFIRMED",
  "IN_PRODUCTION",
  "PRODUCTION_COMPLETE",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED_REFUND",
  "ERROR",
];

function printOrderStatusLabel(status: PrintOrderStatus): string {
  if (status === "PAID") return "주문 요청";
  if (status === "PDF_READY") return "제작 파일 준비";
  if (status === "CONFIRMED") return "주문 확정";
  if (status === "IN_PRODUCTION") return "제작 중";
  if (status === "PRODUCTION_COMPLETE") return "제작 완료";
  if (status === "SHIPPED") return "배송 중";
  if (status === "DELIVERED") return "배송 완료";
  if (status === "CANCELLED_REFUND") return "취소/환불";
  return "오류";
}

function nextPrintOrderStatus(status: PrintOrderStatus): PrintOrderStatus | null {
  if (status === "PAID") return "PDF_READY";
  if (status === "PDF_READY") return "CONFIRMED";
  if (status === "CONFIRMED") return "IN_PRODUCTION";
  if (status === "IN_PRODUCTION") return "PRODUCTION_COMPLETE";
  if (status === "PRODUCTION_COMPLETE") return "SHIPPED";
  if (status === "SHIPPED") return "DELIVERED";
  return null;
}

function coverLabel(coverType: string): string {
  if (coverType === "HARDCOVER") return "하드커버";
  if (coverType === "SOFTCOVER") return "소프트커버";
  return coverType;
}

function formatCurrency(value: number): string {
  return `${value.toLocaleString("ko-KR")}원`;
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function initialLetterForm(): LetterForm {
  return {
    receiverMemberId: "",
    title: "",
    body: "",
  };
}

function letterBoxTitle(box: LetterBox): string {
  return box === "SENT" ? "보낸 편지" : "받은 편지";
}

function demoLetterRecipients(roomId: number): LetterRecipient[] {
  if (roomId === 1) {
    return [{ memberId: 2, displayName: "여자친구" }];
  }

  if (roomId === 2) {
    return [
      { memberId: 3, displayName: "아버지" },
      { memberId: 5, displayName: "어머니" },
      { memberId: 6, displayName: "형" },
      { memberId: 7, displayName: "누나" },
      { memberId: 8, displayName: "남동생" },
      { memberId: 9, displayName: "여동생" },
    ];
  }

  return [
    { memberId: 4, displayName: "지훈" },
    { memberId: 10, displayName: "서연" },
    { memberId: 11, displayName: "도윤" },
    { memberId: 12, displayName: "하준" },
    { memberId: 13, displayName: "수아" },
  ];
}

function demoLetters(roomId: number, box: LetterBox): LetterSummary[] {
  const room = demoRooms.find((candidate) => candidate.id === roomId) ?? demoRooms[0];
  const recipients = demoLetterRecipients(room.id);
  const counterpart = recipients[0] ?? { memberId: 2, displayName: "여자친구" };
  const baseId = 99000 + room.id * 100 + (box === "SENT" ? 50 : 0);

  if (box === "SENT") {
    return [
      {
        id: baseId + 1,
        roomId: room.id,
        box,
        title: "오늘 기록 고마웠어",
        bodyPreview: "오늘 남긴 사진이 좋아서 편지로도 마음을 남겨둔다.",
        counterpartMemberId: counterpart.memberId,
        counterpartName: counterpart.displayName,
        sentAt: `${todayDateKey()}T20:12:00+09:00`,
        occurredDate: todayDateKey(),
        read: true,
      },
      {
        id: baseId + 2,
        roomId: room.id,
        box,
        title: "나중에 책에 같이 넣자",
        bodyPreview: "이번 달 기록 중 마음에 드는 장면을 같이 골라보자.",
        counterpartMemberId: counterpart.memberId,
        counterpartName: counterpart.displayName,
        sentAt: `${offsetDateKey(-2)}T19:30:00+09:00`,
        occurredDate: offsetDateKey(-2),
        read: false,
      },
    ];
  }

  return [
    {
      id: baseId + 1,
      roomId: room.id,
      box,
      title: "오늘 하루도 잘 남겨보자",
      bodyPreview: "오늘 있었던 일 중 책에 넣고 싶은 장면을 같이 남겨보자.",
      counterpartMemberId: counterpart.memberId,
      counterpartName: counterpart.displayName,
      sentAt: `${todayDateKey()}T09:20:00+09:00`,
      occurredDate: todayDateKey(),
      read: false,
    },
    {
      id: baseId + 2,
      roomId: room.id,
      box,
      title: "사진 고마워",
      bodyPreview: "네가 올린 사진을 보니까 그날 분위기가 다시 생각났어.",
      counterpartMemberId: counterpart.memberId,
      counterpartName: counterpart.displayName,
      sentAt: `${offsetDateKey(-1)}T21:05:00+09:00`,
      occurredDate: offsetDateKey(-1),
      read: true,
    },
    {
      id: baseId + 3,
      roomId: room.id,
      box,
      title: "다음 기록 약속",
      bodyPreview: "이번 주말에는 미션 인증이랑 추억 게시판을 같이 채워보자.",
      counterpartMemberId: counterpart.memberId,
      counterpartName: counterpart.displayName,
      sentAt: `${offsetDateKey(-5)}T18:42:00+09:00`,
      occurredDate: offsetDateKey(-5),
      read: true,
    },
  ];
}

function demoLetterDetail(roomId: number, letterId: number, box: LetterBox): LetterDetail {
  const summary = demoLetters(roomId, box).find((letter) => letter.id === letterId) ?? demoLetters(roomId, box)[0];
  const isSent = box === "SENT";

  return {
    id: summary.id,
    roomId: summary.roomId,
    title: summary.title,
    body: `${summary.bodyPreview}\n\n서로의 기록이 쌓이면 나중에 다시 펼쳐볼 수 있는 한 장면이 될 것 같아.`,
    senderMemberId: isSent ? 1 : summary.counterpartMemberId,
    senderName: isSent ? "류성열" : summary.counterpartName,
    receiverMemberId: isSent ? summary.counterpartMemberId : 1,
    receiverName: isSent ? summary.counterpartName : "류성열",
    sentAt: summary.sentAt,
    occurredDate: summary.occurredDate,
    readAt: summary.read || !isSent ? `${summary.occurredDate}T22:00:00+09:00` : null,
    read: true,
    mine: isSent,
  };
}

function initialMemoryPostForm(): MemoryPostForm {
  return {
    title: "",
    body: "",
    representativeImageUrl: "",
    representativeImageName: "",
    occurredDate: todayDateKey(),
  };
}

function initialMissionForm(): MissionForm {
  return {
    title: "",
    description: "",
  };
}

function initialMissionSubmissionForm(missionId: number | null = null): MissionSubmissionForm {
  return {
    missionId,
    body: "",
    imageUrl: "",
    imageName: "",
    occurredDate: todayDateKey(),
  };
}

function missionStatusLabel(status: MissionStatus): string {
  if (status === "COMPLETED") return "완료";
  if (status === "WAITING_APPROVAL") return "승인 대기";
  return "진행 중";
}

function missionProgressRate(roomType: RoomSummary["type"], approvedCount: number, totalMemberCount: number): number {
  if (totalMemberCount <= 0) return 0;

  if (roomType === "COUPLE") {
    return Math.min(100, Math.round(((approvedCount + 1) / totalMemberCount) * 100));
  }

  const requiredApprovalCount = Math.max(1, Math.floor(totalMemberCount / 2) + 1);
  return Math.min(100, Math.round((approvedCount / requiredApprovalCount) * 100));
}

function requiredMissionApprovals(roomType: RoomSummary["type"], totalMemberCount: number): number {
  if (roomType === "COUPLE") {
    return 1;
  }

  return Math.max(1, Math.floor(totalMemberCount / 2) + 1);
}

function replaceMissionSummary(current: MissionListResponse | null, updatedMission: MissionSummary): MissionListResponse | null {
  if (!current) return current;

  return {
    ...current,
    missions: current.missions.map((mission) => (mission.id === updatedMission.id ? updatedMission : mission)),
  };
}

function demoMissionList(roomId: number): MissionListResponse {
  const room = demoRooms.find((candidate) => candidate.id === roomId) ?? demoRooms[0];
  const missionTitles =
    room.type === "COUPLE"
      ? ["오늘의 산책 사진", "함께 먹은 음식", "카페 또는 디저트 인증", "같은 색 아이템"]
      : room.type === "FAMILY"
        ? ["가족 식탁 사진", "가족 산책길", "가족 앨범 한 장", "장보기 장바구니"]
        : ["단체 출석 인증", "회의 보드 사진", "발표 자료 화면", "실습 결과물"];

  const missions = missionTitles.map((title, index) => {
    const status: MissionStatus = index === 0 ? "WAITING_APPROVAL" : index === 1 ? "COMPLETED" : "IN_PROGRESS";
    const submission: MissionSubmission | null = index <= 1
      ? {
          id: 9500 + room.id * 10 + index,
          missionId: 9000 + room.id * 100 + index,
          submitterMemberId: room.id === 1 ? 2 : room.id === 2 ? 3 : 4,
          submitterName: room.id === 1 ? "여자친구" : room.id === 2 ? "아버지" : "지훈",
          body: "사진으로 인증한 기록입니다.",
          imageUrl: `https://picsum.photos/seed/demo-mission-${room.id}-${index}/900/640`,
          occurredDate: offsetDateKey(-index),
          submittedAt: `${offsetDateKey(-index)}T10:00:00+09:00`,
          mine: false,
          approvedCount: status === "COMPLETED" ? 1 : 0,
          totalMemberCount: room.memberCount,
          requiredApprovalCount: room.type === "COUPLE" ? 1 : Math.max(1, Math.floor(room.memberCount / 2) + 1),
          approvalRate: missionProgressRate(room.type, status === "COMPLETED" ? 1 : 0, room.memberCount),
          myDecision: null,
          canApprove: status === "WAITING_APPROVAL",
          completed: status === "COMPLETED",
        }
      : null;

    return {
      id: 9000 + room.id * 100 + index,
      roomId: room.id,
      title,
      description: "사진을 첨부해 인증하는 기본 미션입니다.",
      status,
      createdByMemberId: 1,
      createdByName: "류성열",
      custom: false,
      completedAt: status === "COMPLETED" ? `${offsetDateKey(-1)}T12:00:00+09:00` : null,
      latestSubmission: submission,
      comments: [
        {
          id: 9700 + room.id * 10 + index,
          missionId: 9000 + room.id * 100 + index,
          authorMemberId: index % 2 === 0 ? 1 : 2,
          authorName: index % 2 === 0 ? "류성열" : "여자친구",
          body: index <= 1 ? "이 미션은 책에 담기 좋겠다." : "인증할 사진을 골라보자.",
          createdAt: `${offsetDateKey(-index)}T11:20:00+09:00`,
          mine: index % 2 === 0,
        },
      ],
    };
  });

  return {
    roomId: room.id,
    roomName: room.name,
    roomType: room.type,
    completionRule: room.type === "COUPLE" ? "상대 동의 시 완료" : "방장 승인 또는 과반 동의 시 완료",
    missions,
  };
}

function demoMemoryPosts(roomId: number): MemoryPostSummary[] {
  const room = demoRooms.find((candidate) => candidate.id === roomId) ?? demoRooms[0];
  const authorName = room.id === 1 ? "여자친구" : room.id === 2 ? "아버지" : "지훈";

  return [
    {
      id: 8701 + room.id,
      roomId: room.id,
      authorMemberId: room.id === 1 ? 2 : 3,
      authorName,
      title: `${room.name} 대표 사진`,
      bodyPreview: "오늘 남긴 사진과 짧은 글을 추억 게시판 카드로 확인한다.",
      representativeImageUrl: `https://picsum.photos/seed/record-room-demo-${room.id}/720/480`,
      imageCount: 1,
      commentCount: 2,
      occurredDate: todayDateKey(),
      createdAt: `${todayDateKey()}T09:30:00+09:00`,
      mine: false,
    },
    {
      id: 8801 + room.id,
      roomId: room.id,
      authorMemberId: 1,
      authorName: "류성열",
      title: "책에 담고 싶은 순간",
      bodyPreview: "나중에 인쇄할 때 다시 고를 수 있도록 후보 기록으로 남긴다.",
      representativeImageUrl: `https://picsum.photos/seed/record-room-demo-${room.id}-second/720/480`,
      imageCount: 1,
      commentCount: 1,
      occurredDate: offsetDateKey(-1),
      createdAt: `${offsetDateKey(-1)}T20:10:00+09:00`,
      mine: true,
    },
  ];
}

function demoMemoryDetail(roomId: number, memoryId: number): MemoryPostDetail {
  const summary = demoMemoryPosts(roomId).find((post) => post.id === memoryId) ?? demoMemoryPosts(roomId)[0];

  return {
    ...summary,
    body: `${summary.bodyPreview} 이 화면은 서버 응답이 없을 때도 사용 흐름을 확인할 수 있게 제공하는 데모 상세 내용입니다.`,
    comments: [
      {
        id: summary.id + 1000,
        memoryPostId: summary.id,
        authorMemberId: summary.mine ? 2 : 1,
        authorName: summary.mine ? "여자친구" : "류성열",
        body: "이 추억은 나중에 다시 보면 좋겠다.",
        createdAt: `${summary.occurredDate}T21:10:00+09:00`,
        mine: !summary.mine,
      },
      {
        id: summary.id + 1001,
        memoryPostId: summary.id,
        authorMemberId: summary.authorMemberId,
        authorName: summary.authorName,
        body: "대표 이미지도 같이 저장해둘게.",
        createdAt: `${summary.occurredDate}T21:18:00+09:00`,
        mine: summary.mine,
      },
    ],
  };
}

function memoryDetailToSummary(detail: MemoryPostDetail): MemoryPostSummary {
  return {
    id: detail.id,
    roomId: detail.roomId,
    authorMemberId: detail.authorMemberId,
    authorName: detail.authorName,
    title: detail.title,
    bodyPreview: detail.body.length <= 80 ? detail.body : `${detail.body.slice(0, 80)}...`,
    representativeImageUrl: detail.representativeImageUrl,
    imageCount: detail.imageCount,
    commentCount: detail.commentCount,
    occurredDate: detail.occurredDate,
    createdAt: detail.createdAt,
    mine: detail.mine,
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
      senderName: room.id === 1 ? "여자친구" : room.id === 2 ? "아버지" : "지훈",
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
      senderName: room.id === 1 ? "여자친구" : room.id === 2 ? "아버지" : "지훈",
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

function isHomeNotification(notification: NotificationItem): boolean {
  return notification.type !== "CHAT" && notification.target.type !== "CHAT";
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

function formatDateTimeLabel(dateTime: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateTime));
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

function buildBookPeriodCalendar(calendar: CalendarResponse | null, roomId: number | null): CalendarResponse {
  const source = calendar ?? demoCalendar;
  if (!roomId) {
    return source;
  }

  const days = source.days
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

  if (days.length === 0 && calendar) {
    return filterDemoCalendar(roomId);
  }

  return {
    month: source.month,
    selectedDate: days[0]?.date ?? null,
    days,
  };
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

async function waitAtLeast(startedAt: number, minimumMs: number): Promise<void> {
  const remainingMs = minimumMs - (Date.now() - startedAt);
  if (remainingMs <= 0) return;

  await new Promise<void>((resolve) => window.setTimeout(resolve, remainingMs));
}

async function apiFormDataRequest<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    headers: buildMemberHeader(),
    body: formData,
  });

  const payload = (await response.json()) as T | ApiError;
  if (!response.ok) {
    throw new Error((payload as ApiError).message ?? `HTTP ${response.status}`);
  }

  return payload as T;
}

async function apiRequest<T>(path: string, options: { method: string; body?: unknown }): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method,
    headers: {
      ...buildMemberHeader(),
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

function resolveImageSource(imageUrl: string): string {
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://") || imageUrl.startsWith("data:")) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/")) {
    return `${apiOrigin}${imageUrl}`;
  }

  return imageUrl;
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : "요청을 처리할 수 없습니다.";
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
