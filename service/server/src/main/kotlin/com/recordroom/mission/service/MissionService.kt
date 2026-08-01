package com.recordroom.mission.service

import com.recordroom.calendar.model.MissionEntity
import com.recordroom.calendar.model.MissionSubmissionEntity
import com.recordroom.common.ApiException
import com.recordroom.member.repository.MemberRepository
import com.recordroom.member.service.MemberService
import com.recordroom.mission.model.CreateMissionCommentRequest
import com.recordroom.mission.model.CreateMissionRequest
import com.recordroom.mission.model.CreateMissionSubmissionRequest
import com.recordroom.mission.model.MissionApprovalEntity
import com.recordroom.mission.model.MissionApprovalResponse
import com.recordroom.mission.model.MissionCommentEntity
import com.recordroom.mission.model.MissionCommentResponse
import com.recordroom.mission.model.MissionImageUploadResponse
import com.recordroom.mission.model.MissionListResponse
import com.recordroom.mission.model.MissionSubmissionResponse
import com.recordroom.mission.model.MissionSummaryResponse
import com.recordroom.mission.repository.MissionRepository
import com.recordroom.room.model.RoomEntity
import com.recordroom.room.repository.RoomRepository
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.time.OffsetDateTime
import java.time.ZoneId
import kotlin.math.max
import kotlin.math.roundToInt

@Service
@Transactional(readOnly = true)
class MissionService(
    private val memberService: MemberService,
    private val memberRepository: MemberRepository,
    private val roomRepository: RoomRepository,
    private val missionRepository: MissionRepository,
    private val missionImageStorage: MissionImageStorage,
) {
    private val log = LoggerFactory.getLogger(MissionService::class.java)
    private val seoulZone = ZoneId.of("Asia/Seoul")

    fun getMissions(memberId: Long, roomId: Long): MissionListResponse {
        memberService.getProfile(memberId)

        val room = readRoomJoinedByMember(memberId, roomId, "GET /api/rooms/$roomId/missions")
        val totalMemberCount = roomRepository.countActiveRoomMembers(roomId)
        val missions = missionRepository.findMissionsByRoom(roomId)
            .map { mission -> mission.toSummaryResponse(memberId, room, totalMemberCount) }

        return MissionListResponse(
            roomId = room.id,
            roomName = room.name,
            roomType = room.type,
            completionRule = completionRuleLabel(room.type),
            missions = missions,
        )
    }

    @Transactional
    fun createMission(memberId: Long, roomId: Long, request: CreateMissionRequest): MissionSummaryResponse {
        memberService.getProfile(memberId)

        val room = readRoomJoinedByMember(memberId, roomId, "POST /api/rooms/$roomId/missions")
        val title = validateTitle(memberId, roomId, "POST /api/rooms/$roomId/missions", request.title)
        val description = validateDescription(memberId, roomId, "POST /api/rooms/$roomId/missions", request.description)
        val now = OffsetDateTime.now(seoulZone)

        val mission = missionRepository.saveMission(
            MissionEntity(
                roomId = roomId,
                title = title,
                description = description,
                status = STATUS_IN_PROGRESS,
                createdByMemberId = memberId,
                createdAt = now,
            ),
        )

        return mission.toSummaryResponse(memberId, room, roomRepository.countActiveRoomMembers(roomId))
    }

    fun uploadImage(memberId: Long, roomId: Long, image: MultipartFile): MissionImageUploadResponse {
        memberService.getProfile(memberId)

        readRoomJoinedByMember(memberId, roomId, "POST /api/rooms/$roomId/missions/images")

        return missionImageStorage.storeMissionProofImage(memberId, roomId, image)
    }

    @Transactional
    fun createComment(
        memberId: Long,
        roomId: Long,
        missionId: Long,
        request: CreateMissionCommentRequest,
    ): MissionCommentResponse {
        val profile = memberService.getProfile(memberId)

        readRoomJoinedByMember(memberId, roomId, "POST /api/rooms/$roomId/missions/$missionId/comments")
        readMissionInRoom(memberId, roomId, missionId, "POST /api/rooms/$roomId/missions/$missionId/comments")

        val body = validateCommentBody(memberId, roomId, missionId, request.body)
        val comment = missionRepository.saveComment(
            MissionCommentEntity(
                missionId = missionId,
                authorMemberId = memberId,
                body = body,
                createdAt = OffsetDateTime.now(seoulZone),
            ),
        )

        return MissionCommentResponse(
            id = comment.id,
            missionId = comment.missionId,
            authorMemberId = comment.authorMemberId,
            authorName = profile.displayName,
            body = comment.body,
            createdAt = comment.createdAt,
            mine = true,
        )
    }

    @Transactional
    fun submitMission(
        memberId: Long,
        roomId: Long,
        missionId: Long,
        request: CreateMissionSubmissionRequest,
    ): MissionSummaryResponse {
        memberService.getProfile(memberId)

        val room = readRoomJoinedByMember(memberId, roomId, "POST /api/rooms/$roomId/missions/$missionId/submissions")
        val mission = readMissionInRoom(memberId, roomId, missionId, "POST /api/rooms/$roomId/missions/$missionId/submissions")
        validateMissionCanReceiveSubmission(memberId, roomId, mission, "POST /api/rooms/$roomId/missions/$missionId/submissions")

        val body = validateSubmissionBody(memberId, roomId, missionId, request.body)
        val imageUrl = validateMissionImageUrl(memberId, roomId, missionId, request.imageUrl)
        val now = OffsetDateTime.now(seoulZone)

        mission.status = STATUS_WAITING_APPROVAL
        mission.completedAt = null
        missionRepository.saveMission(mission)

        missionRepository.saveSubmission(
            MissionSubmissionEntity(
                missionId = missionId,
                submitterMemberId = memberId,
                body = body,
                imageUrl = imageUrl,
                occurredDate = request.occurredDate ?: now.toLocalDate(),
                submittedAt = now,
            ),
        )

        return mission.toSummaryResponse(memberId, room, roomRepository.countActiveRoomMembers(roomId))
    }

    @Transactional
    fun approveSubmission(memberId: Long, roomId: Long, submissionId: Long): MissionApprovalResponse {
        memberService.getProfile(memberId)

        val room = readRoomJoinedByMember(memberId, roomId, "POST /api/rooms/$roomId/mission-submissions/$submissionId/approve")
        val submission = readSubmission(memberId, roomId, submissionId, "POST /api/rooms/$roomId/mission-submissions/$submissionId/approve")
        val mission = readMissionInRoom(memberId, roomId, submission.missionId, "POST /api/rooms/$roomId/mission-submissions/$submissionId/approve")
        validateMemberCanApproveSubmission(memberId, roomId, submission, mission)

        val now = OffsetDateTime.now(seoulZone)
        val approval = missionRepository.findApproval(submissionId, memberId)
            ?: MissionApprovalEntity(missionSubmissionId = submissionId, approverMemberId = memberId)
        approval.decision = DECISION_APPROVED
        approval.decidedAt = now
        missionRepository.saveApproval(approval)

        val totalMemberCount = roomRepository.countActiveRoomMembers(roomId)
        val approvedCount = missionRepository.countApprovedApprovals(submissionId)
        val completed = isSubmissionCompleted(room, totalMemberCount, approvedCount, submissionId)

        mission.status = if (completed) STATUS_COMPLETED else STATUS_WAITING_APPROVAL
        mission.completedAt = if (completed) now else null
        missionRepository.saveMission(mission)

        return MissionApprovalResponse(
            missionId = mission.id,
            submissionId = submissionId,
            status = mission.status,
            approvedCount = approvedCount,
            totalMemberCount = totalMemberCount,
            requiredApprovalCount = requiredApprovalCount(room.type, totalMemberCount),
            approvalRate = approvalRate(room.type, approvedCount, totalMemberCount),
            completed = completed,
        )
    }

    private fun MissionEntity.toSummaryResponse(memberId: Long, room: RoomEntity, totalMemberCount: Int): MissionSummaryResponse {
        val submission = missionRepository.findLatestSubmission(id)
        val latestSubmission = submission?.toSubmissionResponse(memberId, room, totalMemberCount, status)
        val effectiveStatus = if (latestSubmission?.completed == true) STATUS_COMPLETED else status
        val createdByName = memberRepository.findActiveMember(createdByMemberId)?.displayName ?: "알 수 없음"

        return MissionSummaryResponse(
            id = id,
            roomId = roomId,
            title = title,
            description = description,
            status = effectiveStatus,
            createdByMemberId = createdByMemberId,
            createdByName = createdByName,
            custom = !isPresetMissionId(id),
            completedAt = completedAt,
            latestSubmission = latestSubmission,
            comments = missionRepository.findComments(id, memberId),
        )
    }

    private fun MissionSubmissionEntity.toSubmissionResponse(
        memberId: Long,
        room: RoomEntity,
        totalMemberCount: Int,
        missionStatus: String,
    ): MissionSubmissionResponse {
        val approvedCount = missionRepository.countApprovedApprovals(id)
        val myDecision = missionRepository.findApproval(id, memberId)?.decision
        val submitterName = memberRepository.findActiveMember(submitterMemberId)?.displayName ?: "알 수 없음"
        val completed = missionStatus == STATUS_COMPLETED || isSubmissionCompleted(room, totalMemberCount, approvedCount, id)

        return MissionSubmissionResponse(
            id = id,
            missionId = missionId,
            submitterMemberId = submitterMemberId,
            submitterName = submitterName,
            body = body,
            imageUrl = imageUrl.orEmpty(),
            occurredDate = occurredDate,
            submittedAt = submittedAt,
            mine = submitterMemberId == memberId,
            approvedCount = approvedCount,
            totalMemberCount = totalMemberCount,
            requiredApprovalCount = requiredApprovalCount(room.type, totalMemberCount),
            approvalRate = approvalRate(room.type, approvedCount, totalMemberCount),
            myDecision = myDecision,
            canApprove = submitterMemberId != memberId && myDecision == null && !completed,
            completed = completed,
        )
    }

    private fun readRoomJoinedByMember(memberId: Long, roomId: Long, what: String): RoomEntity {
        val room = roomRepository.findActiveRoom(roomId) ?: run {
            log.warn(
                "[미션 인증] 방 조회 실패. who=memberId:{}, what={}, requestData=roomId:{}, reason=room_not_found",
                memberId,
                what,
                roomId,
            )
            throw ApiException(HttpStatus.NOT_FOUND, "ROOM_NOT_FOUND", "방을 찾을 수 없습니다.")
        }

        if (roomRepository.findActiveRoomMember(roomId, memberId) == null) {
            log.warn(
                "[미션 인증] 방 접근 권한 검증 실패. who=memberId:{}, what={}, requestData=roomId:{}, reason=member_not_joined_room",
                memberId,
                what,
                roomId,
            )
            throw ApiException(HttpStatus.FORBIDDEN, "ROOM_ACCESS_DENIED", "참여 중인 방의 미션만 볼 수 있습니다.")
        }

        return room
    }

    private fun readMissionInRoom(memberId: Long, roomId: Long, missionId: Long, what: String): MissionEntity {
        val mission = missionRepository.findMission(missionId)
        if (mission != null && mission.roomId == roomId) {
            return mission
        }

        log.warn(
            "[미션 인증] 미션 조회 실패. who=memberId:{}, what={}, requestData=roomId:{},missionId:{}, reason=mission_not_found",
            memberId,
            what,
            roomId,
            missionId,
        )
        throw ApiException(HttpStatus.NOT_FOUND, "MISSION_NOT_FOUND", "미션을 찾을 수 없습니다.")
    }

    private fun readSubmission(memberId: Long, roomId: Long, submissionId: Long, what: String): MissionSubmissionEntity {
        val submission = missionRepository.findSubmission(submissionId) ?: run {
            log.warn(
                "[미션 인증 동의] 인증 요청 조회 실패. who=memberId:{}, what={}, requestData=roomId:{},submissionId:{}, reason=mission_submission_not_found",
                memberId,
                what,
                roomId,
                submissionId,
            )
            throw ApiException(HttpStatus.NOT_FOUND, "MISSION_SUBMISSION_NOT_FOUND", "미션 인증 요청을 찾을 수 없습니다.")
        }

        return submission
    }

    private fun validateMissionCanReceiveSubmission(memberId: Long, roomId: Long, mission: MissionEntity, what: String) {
        if (mission.status != STATUS_COMPLETED) return

        log.warn(
            "[미션 인증 요청] 완료 미션 인증 요청 실패. who=memberId:{}, what={}, requestData=roomId:{},missionId:{},status:{}, reason=mission_already_completed",
            memberId,
            what,
            roomId,
            mission.id,
            mission.status,
        )
        throw ApiException(HttpStatus.CONFLICT, "MISSION_ALREADY_COMPLETED", "이미 완료된 미션입니다.")
    }

    private fun validateMemberCanApproveSubmission(
        memberId: Long,
        roomId: Long,
        submission: MissionSubmissionEntity,
        mission: MissionEntity,
    ) {
        if (submission.submitterMemberId == memberId) {
            log.warn(
                "[미션 인증 동의] 자기 인증 동의 실패. who=memberId:{}, what=MissionService.approveSubmission, requestData=roomId:{},missionId:{},submissionId:{}, reason=self_approval_not_allowed",
                memberId,
                roomId,
                mission.id,
                submission.id,
            )
            throw ApiException(HttpStatus.FORBIDDEN, "MISSION_SELF_APPROVAL_NOT_ALLOWED", "본인이 올린 인증에는 동의할 수 없습니다.")
        }

        if (mission.status == STATUS_COMPLETED) {
            log.warn(
                "[미션 인증 동의] 완료 미션 동의 실패. who=memberId:{}, what=MissionService.approveSubmission, requestData=roomId:{},missionId:{},submissionId:{}, reason=mission_already_completed",
                memberId,
                roomId,
                mission.id,
                submission.id,
            )
            throw ApiException(HttpStatus.CONFLICT, "MISSION_ALREADY_COMPLETED", "이미 완료된 미션입니다.")
        }
    }

    private fun validateTitle(memberId: Long, roomId: Long, what: String, rawTitle: String?): String {
        val title = rawTitle?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: badRequest(memberId, roomId, what, "title:null", "미션 제목을 입력해 주세요.", "MISSION_TITLE_REQUIRED")

        if (title.length > MAX_TITLE_LENGTH) {
            badRequest(memberId, roomId, what, "title:length:${title.length}", "미션 제목은 120자 이하로 입력해 주세요.", "MISSION_TITLE_TOO_LONG")
        }

        return title
    }

    private fun validateDescription(memberId: Long, roomId: Long, what: String, rawDescription: String?): String {
        val description = rawDescription?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: badRequest(memberId, roomId, what, "description:null", "미션 설명을 입력해 주세요.", "MISSION_DESCRIPTION_REQUIRED")

        if (description.length > MAX_DESCRIPTION_LENGTH) {
            badRequest(
                memberId,
                roomId,
                what,
                "description:length:${description.length}",
                "미션 설명은 500자 이하로 입력해 주세요.",
                "MISSION_DESCRIPTION_TOO_LONG",
            )
        }

        return description
    }

    private fun validateSubmissionBody(memberId: Long, roomId: Long, missionId: Long, rawBody: String?): String {
        val body = rawBody?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: badRequest(
                memberId,
                roomId,
                "POST /api/rooms/$roomId/missions/$missionId/submissions",
                "missionId:$missionId,body:null",
                "인증 내용을 입력해 주세요.",
                "MISSION_SUBMISSION_BODY_REQUIRED",
            )

        if (body.length > MAX_SUBMISSION_BODY_LENGTH) {
            badRequest(
                memberId,
                roomId,
                "POST /api/rooms/$roomId/missions/$missionId/submissions",
                "missionId:$missionId,body:length:${body.length}",
                "인증 내용은 1000자 이하로 입력해 주세요.",
                "MISSION_SUBMISSION_BODY_TOO_LONG",
            )
        }

        return body
    }

    private fun validateMissionImageUrl(memberId: Long, roomId: Long, missionId: Long, rawImageUrl: String?): String {
        val imageUrl = rawImageUrl?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: badRequest(
                memberId,
                roomId,
                "POST /api/rooms/$roomId/missions/$missionId/submissions",
                "missionId:$missionId,imageUrl:null",
                "미션 인증 사진을 등록해 주세요.",
                "MISSION_IMAGE_REQUIRED",
            )

        if (imageUrl.length > MAX_IMAGE_URL_LENGTH) {
            badRequest(
                memberId,
                roomId,
                "POST /api/rooms/$roomId/missions/$missionId/submissions",
                "missionId:$missionId,imageUrl:length:${imageUrl.length}",
                "이미지 URL은 500자 이하로 입력해 주세요.",
                "MISSION_IMAGE_URL_TOO_LONG",
            )
        }
        if (!imageUrl.startsWith("https://") && !imageUrl.startsWith("http://") && !imageUrl.startsWith("/")) {
            badRequest(
                memberId,
                roomId,
                "POST /api/rooms/$roomId/missions/$missionId/submissions",
                "missionId:$missionId,imageUrl:invalid_scheme",
                "이미지 URL 형식이 올바르지 않습니다.",
                "MISSION_IMAGE_URL_INVALID",
            )
        }

        return imageUrl
    }

    private fun validateCommentBody(memberId: Long, roomId: Long, missionId: Long, rawBody: String?): String {
        val body = rawBody?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: badRequest(
                memberId,
                roomId,
                "POST /api/rooms/$roomId/missions/$missionId/comments",
                "missionId:$missionId,body:null",
                "댓글을 입력해 주세요.",
                "MISSION_COMMENT_BODY_REQUIRED",
            )

        if (body.length > MAX_COMMENT_BODY_LENGTH) {
            badRequest(
                memberId,
                roomId,
                "POST /api/rooms/$roomId/missions/$missionId/comments",
                "missionId:$missionId,body:length:${body.length}",
                "댓글은 500자 이하로 입력해 주세요.",
                "MISSION_COMMENT_BODY_TOO_LONG",
            )
        }

        return body
    }

    private fun isSubmissionCompleted(room: RoomEntity, totalMemberCount: Int, approvedCount: Int, submissionId: Long): Boolean {
        if (room.type == "COUPLE") {
            return approvedCount >= 1
        }

        return missionRepository.existsOwnerApproval(submissionId, room.ownerMemberId) ||
            approvedCount >= requiredApprovalCount(room.type, totalMemberCount)
    }

    private fun requiredApprovalCount(roomType: String, totalMemberCount: Int): Int {
        if (roomType == "COUPLE") {
            return 1
        }

        return max(1, totalMemberCount / 2 + 1)
    }

    private fun approvalRate(roomType: String, approvedCount: Int, totalMemberCount: Int): Int {
        if (totalMemberCount <= 0) return 0

        val rate = if (roomType == "COUPLE") {
            ((approvedCount + 1).toDouble() / totalMemberCount.toDouble()) * 100
        } else {
            val requiredApprovalCount = requiredApprovalCount(roomType, totalMemberCount)
            if (requiredApprovalCount <= 0) 0.0 else (approvedCount.toDouble() / requiredApprovalCount.toDouble()) * 100
        }

        return rate.roundToInt().coerceIn(0, 100)
    }

    private fun completionRuleLabel(roomType: String): String =
        if (roomType == "COUPLE") "상대 동의 시 완료" else "방장 승인 또는 과반 동의 시 완료"

    private fun isPresetMissionId(missionId: Long): Boolean =
        missionId in 101L..120L || missionId in 201L..220L || missionId in 301L..320L

    private fun badRequest(memberId: Long, roomId: Long, what: String, requestData: String, message: String, code: String): Nothing {
        log.warn(
            "[미션 인증] 요청 값 검증 실패. who=memberId:{}, what={}, requestData=roomId:{},{}, reason={}",
            memberId,
            what,
            roomId,
            requestData,
            code,
        )
        throw ApiException(HttpStatus.BAD_REQUEST, code, message)
    }

    companion object {
        private const val STATUS_IN_PROGRESS = "IN_PROGRESS"
        private const val STATUS_WAITING_APPROVAL = "WAITING_APPROVAL"
        private const val STATUS_COMPLETED = "COMPLETED"
        private const val DECISION_APPROVED = "APPROVED"
        private const val MAX_TITLE_LENGTH = 120
        private const val MAX_DESCRIPTION_LENGTH = 500
        private const val MAX_SUBMISSION_BODY_LENGTH = 1000
        private const val MAX_IMAGE_URL_LENGTH = 500
        private const val MAX_COMMENT_BODY_LENGTH = 500
    }
}
