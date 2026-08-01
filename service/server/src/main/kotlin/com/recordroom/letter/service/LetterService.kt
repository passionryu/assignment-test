package com.recordroom.letter.service

import com.recordroom.calendar.model.LetterEntity
import com.recordroom.common.ApiException
import com.recordroom.letter.model.LetterDetailResponse
import com.recordroom.letter.model.LettersResponse
import com.recordroom.letter.model.SendLetterRequest
import com.recordroom.letter.model.SendLetterResponse
import com.recordroom.letter.repository.LetterRepository
import com.recordroom.member.service.MemberService
import com.recordroom.notification.model.NotificationEntity
import com.recordroom.notification.repository.NotificationRepository
import com.recordroom.room.model.RoomEntity
import com.recordroom.room.repository.RoomRepository
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime
import java.time.ZoneId

@Service
@Transactional(readOnly = true)
class LetterService(
    private val memberService: MemberService,
    private val roomRepository: RoomRepository,
    private val letterRepository: LetterRepository,
    private val notificationRepository: NotificationRepository,
) {
    private val log = LoggerFactory.getLogger(LetterService::class.java)
    private val seoulZone = ZoneId.of("Asia/Seoul")

    fun getLetters(memberId: Long, roomId: Long, rawBox: String?): LettersResponse {
        memberService.getProfile(memberId)

        val room = readRoomJoinedByMember(memberId, roomId, "GET /api/rooms/$roomId/letters")
        val box = normalizeBox(memberId, roomId, rawBox)

        return LettersResponse(
            roomId = room.id,
            roomName = room.name,
            box = box,
            recipients = letterRepository.findRecipients(roomId, memberId),
            items = letterRepository.findLetters(roomId, memberId, box),
        )
    }

    @Transactional
    fun sendLetter(memberId: Long, roomId: Long, request: SendLetterRequest): SendLetterResponse {
        val sender = memberService.getProfile(memberId)

        val room = readRoomJoinedByMember(memberId, roomId, "POST /api/rooms/$roomId/letters")
        val receiverMemberId = validateReceiver(memberId, roomId, request.receiverMemberId)
        val title = validateTitle(memberId, roomId, "POST /api/rooms/$roomId/letters", request.title)
        val body = validateBody(memberId, roomId, "POST /api/rooms/$roomId/letters", request.body)
        val now = OffsetDateTime.now(seoulZone)

        val savedLetter = letterRepository.save(
            LetterEntity(
                roomId = roomId,
                senderMemberId = memberId,
                receiverMemberId = receiverMemberId,
                title = title,
                body = body,
                occurredDate = request.occurredDate ?: now.toLocalDate(),
                sentAt = now,
            ),
        )

        notificationRepository.save(
            NotificationEntity(
                receiverMemberId = receiverMemberId,
                roomId = roomId,
                actorMemberId = memberId,
                type = "LETTER",
                title = "새 편지",
                message = "${sender.displayName}님이 편지를 보냈습니다.",
                targetType = "LETTER",
                targetId = savedLetter.id,
                occurredDate = savedLetter.occurredDate,
                createdAt = now,
            ),
        )

        return SendLetterResponse(
            letter = readLetterDetail(memberId, room, savedLetter.id, "LetterService.sendLetter"),
        )
    }

    @Transactional
    fun getLetterDetail(memberId: Long, roomId: Long, letterId: Long): LetterDetailResponse {
        memberService.getProfile(memberId)

        val room = readRoomJoinedByMember(memberId, roomId, "GET /api/rooms/$roomId/letters/$letterId")
        val letter = letterRepository.findAccessibleLetter(roomId, letterId, memberId)
            ?: letterNotFound(memberId, roomId, letterId, "GET /api/rooms/$roomId/letters/$letterId")

        if (letter.receiverMemberId == memberId && letter.readAt == null) {
            letter.readAt = OffsetDateTime.now(seoulZone)
            letterRepository.save(letter)
        }

        return readLetterDetail(memberId, room, letterId, "GET /api/rooms/$roomId/letters/$letterId")
    }

    private fun readRoomJoinedByMember(memberId: Long, roomId: Long, what: String): RoomEntity {
        val room = roomRepository.findActiveRoom(roomId) ?: run {
            log.warn(
                "[편지] 방 조회 실패. who=memberId:{}, what={}, requestData=roomId:{}, reason=room_not_found",
                memberId,
                what,
                roomId,
            )
            throw ApiException(HttpStatus.NOT_FOUND, "ROOM_NOT_FOUND", "방을 찾을 수 없습니다.")
        }

        if (roomRepository.findActiveRoomMember(roomId, memberId) == null) {
            log.warn(
                "[편지] 방 접근 권한 검증 실패. who=memberId:{}, what={}, requestData=roomId:{}, reason=member_not_joined_room",
                memberId,
                what,
                roomId,
            )
            throw ApiException(HttpStatus.FORBIDDEN, "ROOM_ACCESS_DENIED", "참여 중인 방의 편지만 볼 수 있습니다.")
        }

        return room
    }

    private fun readLetterDetail(memberId: Long, room: RoomEntity, letterId: Long, what: String): LetterDetailResponse =
        letterRepository.findLetterDetail(room.id, letterId, memberId)
            ?: letterNotFound(memberId, room.id, letterId, what)

    private fun normalizeBox(memberId: Long, roomId: Long, rawBox: String?): String {
        val box = rawBox?.trim()?.uppercase().orEmpty().ifBlank { LetterRepository.BOX_RECEIVED }
        if (box == LetterRepository.BOX_RECEIVED || box == LetterRepository.BOX_SENT) {
            return box
        }

        badRequest(memberId, roomId, "GET /api/rooms/$roomId/letters", "box:$rawBox", "편지함은 RECEIVED 또는 SENT만 사용할 수 있습니다.", "LETTER_BOX_INVALID")
    }

    private fun validateReceiver(memberId: Long, roomId: Long, rawReceiverMemberId: Long?): Long {
        val receiverMemberId = rawReceiverMemberId
            ?: badRequest(
                memberId,
                roomId,
                "POST /api/rooms/$roomId/letters",
                "receiverMemberId:null",
                "수신자를 선택해 주세요.",
                "LETTER_RECEIVER_REQUIRED",
            )

        if (receiverMemberId == memberId) {
            badRequest(
                memberId,
                roomId,
                "POST /api/rooms/$roomId/letters",
                "receiverMemberId:$receiverMemberId",
                "본인에게는 편지를 보낼 수 없습니다.",
                "LETTER_SELF_RECEIVER_NOT_ALLOWED",
            )
        }

        if (roomRepository.findActiveRoomMember(roomId, receiverMemberId) == null) {
            log.warn(
                "[편지] 수신자 권한 검증 실패. who=memberId:{}, what=POST /api/rooms/{}/letters, requestData=roomId:{},receiverMemberId:{}, reason=receiver_not_joined_room",
                memberId,
                roomId,
                roomId,
                receiverMemberId,
            )
            throw ApiException(HttpStatus.BAD_REQUEST, "LETTER_RECEIVER_NOT_IN_ROOM", "같은 방의 구성원에게만 편지를 보낼 수 있습니다.")
        }

        return receiverMemberId
    }

    private fun validateTitle(memberId: Long, roomId: Long, what: String, rawTitle: String?): String {
        val title = rawTitle?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: badRequest(memberId, roomId, what, "title:null", "편지 제목을 입력해 주세요.", "LETTER_TITLE_REQUIRED")

        if (title.length > MAX_TITLE_LENGTH) {
            badRequest(memberId, roomId, what, "title:length:${title.length}", "편지 제목은 120자 이하로 입력해 주세요.", "LETTER_TITLE_TOO_LONG")
        }

        return title
    }

    private fun validateBody(memberId: Long, roomId: Long, what: String, rawBody: String?): String {
        val body = rawBody?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: badRequest(memberId, roomId, what, "body:null", "편지 내용을 입력해 주세요.", "LETTER_BODY_REQUIRED")

        if (body.length > MAX_BODY_LENGTH) {
            badRequest(memberId, roomId, what, "body:length:${body.length}", "편지 내용은 5000자 이하로 입력해 주세요.", "LETTER_BODY_TOO_LONG")
        }

        return body
    }

    private fun letterNotFound(memberId: Long, roomId: Long, letterId: Long, what: String): Nothing {
        log.warn(
            "[편지] 편지 조회 실패. who=memberId:{}, what={}, requestData=roomId:{},letterId:{}, reason=letter_not_found",
            memberId,
            what,
            roomId,
            letterId,
        )
        throw ApiException(HttpStatus.NOT_FOUND, "LETTER_NOT_FOUND", "편지를 찾을 수 없습니다.")
    }

    private fun badRequest(memberId: Long, roomId: Long, what: String, requestData: String, message: String, code: String): Nothing {
        log.warn(
            "[편지] 요청 값 검증 실패. who=memberId:{}, what={}, requestData=roomId:{},{}, reason={}",
            memberId,
            what,
            roomId,
            requestData,
            code,
        )
        throw ApiException(HttpStatus.BAD_REQUEST, code, message)
    }

    companion object {
        private const val MAX_TITLE_LENGTH = 120
        private const val MAX_BODY_LENGTH = 5000
    }
}
