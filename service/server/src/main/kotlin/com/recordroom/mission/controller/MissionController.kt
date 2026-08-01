package com.recordroom.mission.controller

import com.recordroom.member.service.CurrentMemberResolver
import com.recordroom.mission.model.CreateMissionCommentRequest
import com.recordroom.mission.model.CreateMissionRequest
import com.recordroom.mission.model.CreateMissionSubmissionRequest
import com.recordroom.mission.model.MissionApprovalResponse
import com.recordroom.mission.model.MissionCommentResponse
import com.recordroom.mission.model.MissionImageUploadResponse
import com.recordroom.mission.model.MissionListResponse
import com.recordroom.mission.model.MissionSummaryResponse
import com.recordroom.mission.service.MissionService
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/rooms/{roomId}")
class MissionController(
    private val currentMemberResolver: CurrentMemberResolver,
    private val missionService: MissionService,
) {
    @GetMapping("/missions")
    fun getMissions(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable roomId: Long,
    ): MissionListResponse =
        missionService.getMissions(
            memberId = currentMemberResolver.resolve(rawMemberId),
            roomId = roomId,
        )

    @PostMapping("/missions")
    fun createMission(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable roomId: Long,
        @RequestBody request: CreateMissionRequest,
    ): MissionSummaryResponse =
        missionService.createMission(
            memberId = currentMemberResolver.resolve(rawMemberId),
            roomId = roomId,
            request = request,
        )

    @PostMapping("/missions/images", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun uploadImage(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable roomId: Long,
        @RequestPart("image") image: MultipartFile,
    ): MissionImageUploadResponse =
        missionService.uploadImage(
            memberId = currentMemberResolver.resolve(rawMemberId),
            roomId = roomId,
            image = image,
        )

    @PostMapping("/missions/{missionId}/submissions")
    fun submitMission(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable roomId: Long,
        @PathVariable missionId: Long,
        @RequestBody request: CreateMissionSubmissionRequest,
    ): MissionSummaryResponse =
        missionService.submitMission(
            memberId = currentMemberResolver.resolve(rawMemberId),
            roomId = roomId,
            missionId = missionId,
            request = request,
        )

    @PostMapping("/missions/{missionId}/comments")
    fun createComment(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable roomId: Long,
        @PathVariable missionId: Long,
        @RequestBody request: CreateMissionCommentRequest,
    ): MissionCommentResponse =
        missionService.createComment(
            memberId = currentMemberResolver.resolve(rawMemberId),
            roomId = roomId,
            missionId = missionId,
            request = request,
        )

    @PostMapping("/mission-submissions/{submissionId}/approve")
    fun approveSubmission(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable roomId: Long,
        @PathVariable submissionId: Long,
    ): MissionApprovalResponse =
        missionService.approveSubmission(
            memberId = currentMemberResolver.resolve(rawMemberId),
            roomId = roomId,
            submissionId = submissionId,
        )
}
