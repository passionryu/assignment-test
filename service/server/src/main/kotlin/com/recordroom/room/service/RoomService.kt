package com.recordroom.room.service

import com.recordroom.common.ApiException
import com.recordroom.member.model.MemberEntity
import com.recordroom.member.repository.MemberRepository
import com.recordroom.member.service.MemberService
import com.recordroom.notification.repository.NotificationRepository
import com.recordroom.room.model.CreateRoomInvitationRequest
import com.recordroom.room.model.CreateRoomInvitationResponse
import com.recordroom.room.model.CreateRoomRequest
import com.recordroom.room.model.CreateRoomResponse
import com.recordroom.room.model.DeleteRoomResponse
import com.recordroom.room.model.PendingRoomInvitationsResponse
import com.recordroom.room.model.RespondRoomInvitationResponse
import com.recordroom.room.model.RoomDetailResponse
import com.recordroom.room.model.RoomEntity
import com.recordroom.room.model.RoomInvitationEntity
import com.recordroom.room.model.RoomInviteeSearchResponse
import com.recordroom.room.model.RoomInviteeSearchResultResponse
import com.recordroom.room.model.RoomMemberEntity
import com.recordroom.room.model.RoomsResponse
import com.recordroom.room.model.UpdateRoomRequest
import com.recordroom.room.repository.RoomRepository
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime

@Service
@Transactional(readOnly = true)
class RoomService(
    private val memberService: MemberService,
    private val memberRepository: MemberRepository,
    private val notificationRepository: NotificationRepository,
    private val roomRepository: RoomRepository,
) {
    private val log = LoggerFactory.getLogger(RoomService::class.java)

    fun getRoomsForSidebar(memberId: Long): RoomsResponse {
        memberService.getProfile(memberId)

        val joinedRooms = roomRepository.findRoomsJoinedByMember(memberId)
        val joinedRoomIds = joinedRooms.map { it.id }
        val unreadChatCounts = notificationRepository.countUnreadNotificationsByRoomAndTypes(
            memberId = memberId,
            roomIds = joinedRoomIds,
            types = setOf(NotificationRepository.CHAT_NOTIFICATION_TYPE),
        )
        val unreadMemoryCounts = notificationRepository.countUnreadNotificationsByRoomAndTypes(
            memberId = memberId,
            roomIds = joinedRoomIds,
            types = setOf(NotificationRepository.MEMORY_NOTIFICATION_TYPE),
        )
        val unreadLetterCounts = notificationRepository.countUnreadNotificationsByRoomAndTypes(
            memberId = memberId,
            roomIds = joinedRoomIds,
            types = setOf(NotificationRepository.LETTER_NOTIFICATION_TYPE),
        )
        val pendingMissionCounts = notificationRepository.countUnreadNotificationsByRoomAndTypes(
            memberId = memberId,
            roomIds = joinedRoomIds,
            types = NotificationRepository.MISSION_NOTIFICATION_TYPES,
        )

        val pendingInvitationCount = roomRepository.countPendingInvitationsForMember(memberId)

        return RoomsResponse(
            rooms = joinedRooms.map { room ->
                room.copy(
                    unreadChatCount = unreadChatCounts[room.id] ?: 0,
                    unreadMemoryCount = unreadMemoryCounts[room.id] ?: 0,
                    unreadLetterCount = unreadLetterCounts[room.id] ?: 0,
                    pendingMissionCount = pendingMissionCounts[room.id] ?: 0,
                )
            },
            pendingInvitationCount = pendingInvitationCount,
        )
    }

    fun getRoomDetail(memberId: Long, roomId: Long): RoomDetailResponse {
        memberService.getProfile(memberId)

        val room = roomRepository.findActiveRoom(roomId) ?: roomNotFound(memberId, roomId, "RoomService.getRoomDetail")

        val membership = roomRepository.findActiveRoomMember(roomId, memberId)
            ?: memberNotJoinedRoom(memberId, roomId, "RoomService.getRoomDetail")

        val memberCount = roomRepository.countActiveRoomMembers(roomId)

        return room.toDetailResponse(
            role = membership.role,
            memberCount = memberCount,
        )
    }

    @Transactional
    fun createRoom(memberId: Long, request: CreateRoomRequest): CreateRoomResponse {
        memberService.getProfile(memberId)

        val roomName = validateRoomName(memberId, request.name)
        val roomType = validateRoomType(memberId, request.type)
        val description = request.description?.trim()?.takeIf { it.isNotEmpty() }
        val now = OffsetDateTime.now()

        val room = roomRepository.saveRoom(
            RoomEntity(
                name = roomName,
                description = description,
                type = roomType,
                ownerMemberId = memberId,
                createdAt = now,
                updatedAt = now,
            ),
        )

        roomRepository.saveRoomMember(
            RoomMemberEntity(
                roomId = room.id,
                memberId = memberId,
                role = "OWNER",
                joinedAt = now,
            ),
        )

        return CreateRoomResponse(
            id = room.id,
            name = room.name,
            type = room.type,
            role = "OWNER",
        )
    }

    @Transactional
    fun updateRoom(memberId: Long, roomId: Long, request: UpdateRoomRequest): RoomDetailResponse {
        memberService.getProfile(memberId)

        val room = roomRepository.findActiveRoom(roomId) ?: roomNotFound(memberId, roomId, "RoomService.updateRoom")

        val membership = roomRepository.findActiveRoomMember(roomId, memberId)
            ?: memberNotJoinedRoom(memberId, roomId, "RoomService.updateRoom")

        validateMemberCanManageRoom(memberId, roomId, membership.role, "RoomService.updateRoom")

        val roomName = validateRoomName(memberId, "PATCH /api/rooms/$roomId", request.name)
        val description = validateRoomDescription(memberId, roomId, request.description)

        room.name = roomName
        room.description = description
        room.updatedAt = OffsetDateTime.now()

        val savedRoom = roomRepository.saveRoom(room)
        val memberCount = roomRepository.countActiveRoomMembers(roomId)

        return savedRoom.toDetailResponse(
            role = membership.role,
            memberCount = memberCount,
        )
    }

    @Transactional
    fun deleteRoom(memberId: Long, roomId: Long): DeleteRoomResponse {
        memberService.getProfile(memberId)

        val room = roomRepository.findActiveRoom(roomId) ?: roomNotFound(memberId, roomId, "RoomService.deleteRoom")

        val membership = roomRepository.findActiveRoomMember(roomId, memberId)
            ?: memberNotJoinedRoom(memberId, roomId, "RoomService.deleteRoom")

        validateMemberCanManageRoom(memberId, roomId, membership.role, "RoomService.deleteRoom")

        val now = OffsetDateTime.now()
        room.archivedAt = now
        room.updatedAt = now
        roomRepository.saveRoom(room)

        return DeleteRoomResponse(id = room.id, deleted = true)
    }

    fun searchInvitationCandidates(memberId: Long, roomId: Long, rawKeyword: String?): RoomInviteeSearchResponse {
        memberService.getProfile(memberId)

        roomRepository.findActiveRoom(roomId) ?: roomNotFound(memberId, roomId, "RoomService.searchInvitationCandidates")

        val inviterMembership = roomRepository.findActiveRoomMember(roomId, memberId)
            ?: memberNotJoinedRoom(memberId, roomId, "RoomService.searchInvitationCandidates")

        validateMemberCanInvite(memberId, roomId, inviterMembership.role, "RoomService.searchInvitationCandidates")

        val keyword = validateInviteeSearchKeyword(memberId, roomId, rawKeyword)
        val candidates = memberRepository.searchActiveMembersForInvitation(keyword)
            .filterNot { it.id == memberId }
            .map { it.toInviteeSearchResultResponse() }

        return RoomInviteeSearchResponse(
            keyword = keyword,
            results = candidates,
        )
    }

    @Transactional
    fun createInvitation(
        memberId: Long,
        roomId: Long,
        request: CreateRoomInvitationRequest,
    ): CreateRoomInvitationResponse {
        memberService.getProfile(memberId)

        roomRepository.findActiveRoom(roomId) ?: roomNotFound(memberId, roomId, "RoomService.createInvitation")

        val inviterMembership = roomRepository.findActiveRoomMember(roomId, memberId)
            ?: memberNotJoinedRoom(memberId, roomId, "RoomService.createInvitation")

        validateMemberCanInvite(memberId, roomId, inviterMembership.role, "RoomService.createInvitation")

        val invitationTarget = resolveInvitationTarget(memberId, roomId, request)
        val invitee = invitationTarget.member

        validateInviteeIsNotSelf(memberId, roomId, invitee.id)
        validateInviteeIsNotJoined(memberId, roomId, invitee.id)

        val now = OffsetDateTime.now()
        validateDuplicatePendingInvitation(memberId, roomId, invitee, invitationTarget.contact, now)

        val invitation = roomRepository.saveRoomInvitation(
            RoomInvitationEntity(
                roomId = roomId,
                inviterMemberId = memberId,
                inviteeEmail = invitationTarget.contact.email,
                inviteePhoneNumber = invitationTarget.contact.phoneNumber,
                inviteeMemberId = invitee.id,
                status = "PENDING",
                createdAt = now,
                expiresAt = now.plusDays(INVITATION_EXPIRATION_DAYS),
            ),
        )

        return CreateRoomInvitationResponse(
            id = invitation.id,
            status = invitation.status,
            expiresAt = invitation.expiresAt.toString(),
        )
    }

    fun getPendingInvitations(memberId: Long): PendingRoomInvitationsResponse {
        memberService.getProfile(memberId)

        return PendingRoomInvitationsResponse(
            items = roomRepository.findPendingInvitationsReceivedByMember(memberId),
        )
    }

    @Transactional
    fun acceptInvitation(memberId: Long, invitationId: Long): RespondRoomInvitationResponse {
        val receiver = memberRepository.findActiveMember(memberId) ?: memberNotFound(memberId)
        val invitation = roomRepository.findPendingInvitation(invitationId)
            ?: invitationNotFound(memberId, invitationId)

        validateInvitationCanBeRespondedByMember(receiver, invitation)

        if (!roomRepository.existsActiveRoomMember(invitation.roomId, memberId)) {
            roomRepository.saveRoomMember(
                RoomMemberEntity(
                    roomId = invitation.roomId,
                    memberId = memberId,
                    role = "MEMBER",
                    joinedAt = OffsetDateTime.now(),
                ),
            )
        }

        invitation.status = "ACCEPTED"
        invitation.respondedAt = OffsetDateTime.now()
        roomRepository.saveRoomInvitation(invitation)

        return RespondRoomInvitationResponse(
            id = invitation.id,
            roomId = invitation.roomId,
            status = invitation.status,
        )
    }

    @Transactional
    fun declineInvitation(memberId: Long, invitationId: Long): RespondRoomInvitationResponse {
        val receiver = memberRepository.findActiveMember(memberId) ?: memberNotFound(memberId)
        val invitation = roomRepository.findPendingInvitation(invitationId)
            ?: invitationNotFound(memberId, invitationId)

        validateInvitationCanBeRespondedByMember(receiver, invitation)

        invitation.status = "DECLINED"
        invitation.respondedAt = OffsetDateTime.now()
        roomRepository.saveRoomInvitation(invitation)

        return RespondRoomInvitationResponse(
            id = invitation.id,
            roomId = invitation.roomId,
            status = invitation.status,
        )
    }

    private fun validateRoomName(memberId: Long, rawName: String?): String =
        validateRoomName(memberId, "POST /api/rooms", rawName)

    private fun validateRoomName(memberId: Long, what: String, rawName: String?): String {
        val name = rawName?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: badRequest(memberId, what, "name:null", "방 이름을 입력해 주세요.", "ROOM_NAME_REQUIRED")

        if (name.length > MAX_ROOM_NAME_LENGTH) {
            badRequest(memberId, what, "name:length:${name.length}", "방 이름은 80자 이하로 입력해 주세요.", "ROOM_NAME_TOO_LONG")
        }

        return name
    }

    private fun validateRoomDescription(memberId: Long, roomId: Long, rawDescription: String?): String? {
        val description = rawDescription?.trim()?.takeIf { it.isNotEmpty() }

        if ((description?.length ?: 0) > MAX_ROOM_DESCRIPTION_LENGTH) {
            badRequest(
                memberId = memberId,
                what = "PATCH /api/rooms/$roomId",
                requestData = "description:length:${description?.length}",
                message = "방 설명은 255자 이하로 입력해 주세요.",
                code = "ROOM_DESCRIPTION_TOO_LONG",
            )
        }

        return description
    }

    private fun validateRoomType(memberId: Long, rawType: String?): String {
        val type = rawType?.trim()?.uppercase()
            ?: badRequest(memberId, "POST /api/rooms", "type:null", "방 타입을 선택해 주세요.", "ROOM_TYPE_REQUIRED")

        if (type !in SUPPORTED_ROOM_TYPES) {
            badRequest(memberId, "POST /api/rooms", "type:$type", "지원하지 않는 방 타입입니다.", "ROOM_TYPE_NOT_SUPPORTED")
        }

        return type
    }

    private fun validateMemberCanInvite(memberId: Long, roomId: Long, role: String, what: String) {
        if (role != "OWNER") {
            log.warn(
                "[방 초대] 초대 권한 검증 실패. who=memberId:{}, what={}, requestData=roomId:{}, reason=owner_required",
                memberId,
                what,
                roomId,
            )
            throw ApiException(HttpStatus.FORBIDDEN, "ROOM_OWNER_REQUIRED", "방장만 초대할 수 있습니다.")
        }
    }

    private fun validateMemberCanManageRoom(memberId: Long, roomId: Long, role: String, what: String) {
        if (role != "OWNER") {
            log.warn(
                "[방 관리] 방 관리 권한 검증 실패. who=memberId:{}, what={}, requestData=roomId:{}, reason=owner_required",
                memberId,
                what,
                roomId,
            )
            throw ApiException(HttpStatus.FORBIDDEN, "ROOM_OWNER_REQUIRED", "방장만 방 정보를 수정하거나 삭제할 수 있습니다.")
        }
    }

    private fun resolveInvitationContact(
        memberId: Long,
        roomId: Long,
        request: CreateRoomInvitationRequest,
    ): InvitationContact {
        val email = request.email?.trim()?.lowercase()?.takeIf { it.isNotEmpty() }
        val phoneNumber = request.phoneNumber?.trim()?.takeIf { it.isNotEmpty() }

        if (email == null && phoneNumber == null) {
            badRequest(memberId, "POST /api/rooms/$roomId/invitations", "email:null,phoneNumber:null", "이메일 또는 전화번호를 입력해 주세요.", "INVITEE_CONTACT_REQUIRED")
        }
        if (email != null && phoneNumber != null) {
            badRequest(memberId, "POST /api/rooms/$roomId/invitations", "email:${maskEmail(email)},phone:${maskPhone(phoneNumber)}", "이메일과 전화번호 중 하나만 입력해 주세요.", "INVITEE_CONTACT_ONLY_ONE_ALLOWED")
        }
        if (email != null && !EMAIL_PATTERN.matches(email)) {
            badRequest(memberId, "POST /api/rooms/$roomId/invitations", "email:${maskEmail(email)}", "이메일 형식이 올바르지 않습니다.", "INVITEE_EMAIL_INVALID")
        }

        return InvitationContact(email = email, phoneNumber = phoneNumber)
    }

    private fun validateInviteeSearchKeyword(memberId: Long, roomId: Long, rawKeyword: String?): String {
        val keyword = rawKeyword?.trim()?.takeIf { it.isNotEmpty() }
            ?: badRequest(memberId, "GET /api/rooms/$roomId/invitation-candidates", "keyword:null", "검색어를 입력해 주세요.", "INVITEE_SEARCH_KEYWORD_REQUIRED")

        if (keyword.length > MAX_INVITEE_SEARCH_KEYWORD_LENGTH) {
            badRequest(
                memberId = memberId,
                what = "GET /api/rooms/$roomId/invitation-candidates",
                requestData = "keyword:length:${keyword.length}",
                message = "검색어는 50자 이하로 입력해 주세요.",
                code = "INVITEE_SEARCH_KEYWORD_TOO_LONG",
            )
        }

        return keyword
    }

    private fun resolveInvitationTarget(
        memberId: Long,
        roomId: Long,
        request: CreateRoomInvitationRequest,
    ): InvitationTarget {
        request.memberId?.let { inviteeMemberId ->
            val invitee = memberRepository.findActiveMember(inviteeMemberId)
                ?: inviteeNotFoundByMemberId(memberId, roomId, inviteeMemberId)

            return InvitationTarget(
                member = invitee,
                contact = InvitationContact(email = invitee.email, phoneNumber = invitee.phoneNumber),
            )
        }

        val invitationContact = resolveInvitationContact(memberId, roomId, request)
        val invitee = findInviteeMember(memberId, roomId, invitationContact)

        return InvitationTarget(
            member = invitee,
            contact = invitationContact,
        )
    }

    private fun findInviteeMember(memberId: Long, roomId: Long, contact: InvitationContact): MemberEntity =
        when {
            contact.email != null -> memberRepository.findActiveMemberByEmail(contact.email)
            contact.phoneNumber != null -> memberRepository.findActiveMemberByPhoneNumber(contact.phoneNumber)
            else -> null
        } ?: run {
            log.warn(
                "[방 초대] 초대 대상 회원 조회 실패. who=memberId:{}, what=RoomService.createInvitation, requestData=roomId:{},email:{},phone:{}, reason=invitee_not_found",
                memberId,
                roomId,
                contact.email?.let(::maskEmail),
                contact.phoneNumber?.let(::maskPhone),
            )
            throw ApiException(HttpStatus.NOT_FOUND, "INVITEE_NOT_FOUND", "초대할 회원을 찾을 수 없습니다.")
        }

    private fun inviteeNotFoundByMemberId(memberId: Long, roomId: Long, inviteeMemberId: Long): Nothing {
        log.warn(
            "[방 초대] 초대 대상 회원 조회 실패. who=memberId:{}, what=RoomService.createInvitation, requestData=roomId:{},inviteeMemberId:{}, reason=invitee_not_found",
            memberId,
            roomId,
            inviteeMemberId,
        )
        throw ApiException(HttpStatus.NOT_FOUND, "INVITEE_NOT_FOUND", "초대할 회원을 찾을 수 없습니다.")
    }

    private fun validateInviteeIsNotSelf(memberId: Long, roomId: Long, inviteeMemberId: Long) {
        if (memberId == inviteeMemberId) {
            badRequest(memberId, "POST /api/rooms/$roomId/invitations", "inviteeMemberId:self", "자기 자신은 초대할 수 없습니다.", "INVITEE_SELF_NOT_ALLOWED")
        }
    }

    private fun validateInviteeIsNotJoined(memberId: Long, roomId: Long, inviteeMemberId: Long) {
        if (roomRepository.existsActiveRoomMember(roomId, inviteeMemberId)) {
            log.warn(
                "[방 초대] 이미 참여 중인 회원 초대 실패. who=memberId:{}, what=RoomService.createInvitation, requestData=roomId:{},inviteeMemberId:{}, reason=already_joined",
                memberId,
                roomId,
                inviteeMemberId,
            )
            throw ApiException(HttpStatus.CONFLICT, "INVITEE_ALREADY_JOINED", "이미 참여 중인 회원입니다.")
        }
    }

    private fun validateDuplicatePendingInvitation(
        memberId: Long,
        roomId: Long,
        invitee: MemberEntity,
        contact: InvitationContact,
        now: OffsetDateTime,
    ) {
        if (roomRepository.existsPendingInvitationForMember(roomId, invitee.id, contact.email, contact.phoneNumber, now)) {
            log.warn(
                "[방 초대] 중복 초대 생성 실패. who=memberId:{}, what=RoomService.createInvitation, requestData=roomId:{},inviteeMemberId:{}, reason=pending_invitation_exists",
                memberId,
                roomId,
                invitee.id,
            )
            throw ApiException(HttpStatus.CONFLICT, "PENDING_INVITATION_EXISTS", "이미 대기 중인 초대가 있습니다.")
        }
    }

    private fun validateInvitationCanBeRespondedByMember(receiver: MemberEntity, invitation: RoomInvitationEntity) {
        if (invitation.expiresAt.isBefore(OffsetDateTime.now())) {
            throw ApiException(HttpStatus.BAD_REQUEST, "INVITATION_EXPIRED", "만료된 초대입니다.")
        }

        val matched = invitation.inviteeMemberId == receiver.id ||
            invitation.inviteeEmail == receiver.email ||
            invitation.inviteePhoneNumber == receiver.phoneNumber

        if (!matched) {
            log.warn(
                "[방 초대 응답] 초대 수신자 검증 실패. who=memberId:{}, what=RoomService.respondInvitation, requestData=invitationId:{}, reason=receiver_mismatch",
                receiver.id,
                invitation.id,
            )
            throw ApiException(HttpStatus.FORBIDDEN, "INVITATION_RECEIVER_MISMATCH", "응답할 수 없는 초대입니다.")
        }
    }

    private fun RoomEntity.toDetailResponse(role: String, memberCount: Int): RoomDetailResponse =
        RoomDetailResponse(
            id = id,
            name = name,
            description = description,
            type = type,
            role = role,
            memberCount = memberCount,
            canManage = role == "OWNER",
        )

    private fun MemberEntity.toInviteeSearchResultResponse(): RoomInviteeSearchResultResponse =
        RoomInviteeSearchResultResponse(
            id = id,
            displayName = displayName,
            username = username,
            maskedEmail = maskEmail(email),
            maskedPhoneNumber = maskPhone(phoneNumber),
            profileImageUrl = profileImageUrl,
        )

    private fun roomNotFound(memberId: Long, roomId: Long, what: String): Nothing {
        log.warn(
            "[방 조회] 방 조회 실패. who=memberId:{}, what={}, requestData=roomId:{}, reason=room_not_found",
            memberId,
            what,
            roomId,
        )
        throw ApiException(HttpStatus.NOT_FOUND, "ROOM_NOT_FOUND", "방을 찾을 수 없습니다.")
    }

    private fun memberNotJoinedRoom(memberId: Long, roomId: Long, what: String): Nothing {
        log.warn(
            "[방 참여] 방 참여 여부 검증 실패. who=memberId:{}, what={}, requestData=roomId:{}, reason=member_not_joined",
            memberId,
            what,
            roomId,
        )
        throw ApiException(HttpStatus.FORBIDDEN, "ROOM_MEMBER_REQUIRED", "참여 중인 방에서만 사용할 수 있습니다.")
    }

    private fun invitationNotFound(memberId: Long, invitationId: Long): Nothing {
        log.warn(
            "[방 초대 응답] 초대 조회 실패. who=memberId:{}, what=RoomService.respondInvitation, requestData=invitationId:{}, reason=invitation_not_found",
            memberId,
            invitationId,
        )
        throw ApiException(HttpStatus.NOT_FOUND, "INVITATION_NOT_FOUND", "초대를 찾을 수 없습니다.")
    }

    private fun memberNotFound(memberId: Long): Nothing {
        log.warn(
            "[회원 조회] 회원 조회 실패. who=memberId:{}, what=RoomService.respondInvitation, requestData=memberId:{}, reason=member_not_found",
            memberId,
            memberId,
        )
        throw ApiException(HttpStatus.NOT_FOUND, "MEMBER_NOT_FOUND", "회원을 찾을 수 없습니다.")
    }

    private fun badRequest(memberId: Long, what: String, requestData: String, message: String, code: String): Nothing {
        log.warn(
            "[방 요청] 요청 값 검증 실패. who=memberId:{}, what={}, requestData={}, reason={}",
            memberId,
            what,
            requestData,
            code,
        )
        throw ApiException(HttpStatus.BAD_REQUEST, code, message)
    }

    private fun maskEmail(email: String): String {
        val parts = email.split("@")
        if (parts.size != 2) return "***"
        return "${parts[0].take(2)}***@${parts[1]}"
    }

    private fun maskPhone(phoneNumber: String): String =
        phoneNumber.take(3) + "-****-" + phoneNumber.takeLast(4)

    private data class InvitationContact(
        val email: String?,
        val phoneNumber: String?,
    )

    private data class InvitationTarget(
        val member: MemberEntity,
        val contact: InvitationContact,
    )

    companion object {
        private const val MAX_ROOM_NAME_LENGTH = 80
        private const val MAX_ROOM_DESCRIPTION_LENGTH = 255
        private const val MAX_INVITEE_SEARCH_KEYWORD_LENGTH = 50
        private const val INVITATION_EXPIRATION_DAYS = 7L
        private val SUPPORTED_ROOM_TYPES = setOf("COUPLE", "FAMILY", "GROUP")
        private val EMAIL_PATTERN = Regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")
    }
}
