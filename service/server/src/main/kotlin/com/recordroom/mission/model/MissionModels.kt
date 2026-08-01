package com.recordroom.mission.model

import java.time.LocalDate
import java.time.OffsetDateTime

data class MissionListResponse(
    val roomId: Long,
    val roomName: String,
    val roomType: String,
    val completionRule: String,
    val missions: List<MissionSummaryResponse>,
)

data class MissionSummaryResponse(
    val id: Long,
    val roomId: Long,
    val title: String,
    val description: String,
    val status: String,
    val createdByMemberId: Long,
    val createdByName: String,
    val custom: Boolean,
    val completedAt: OffsetDateTime?,
    val latestSubmission: MissionSubmissionResponse?,
)

data class MissionSubmissionResponse(
    val id: Long,
    val missionId: Long,
    val submitterMemberId: Long,
    val submitterName: String,
    val body: String,
    val imageUrl: String,
    val occurredDate: LocalDate,
    val submittedAt: OffsetDateTime,
    val mine: Boolean,
    val approvedCount: Int,
    val totalMemberCount: Int,
    val requiredApprovalCount: Int,
    val approvalRate: Int,
    val myDecision: String?,
    val canApprove: Boolean,
    val completed: Boolean,
)

data class CreateMissionRequest(
    val title: String?,
    val description: String?,
)

data class CreateMissionSubmissionRequest(
    val body: String?,
    val imageUrl: String?,
    val occurredDate: LocalDate?,
)

data class MissionApprovalResponse(
    val missionId: Long,
    val submissionId: Long,
    val status: String,
    val approvedCount: Int,
    val totalMemberCount: Int,
    val requiredApprovalCount: Int,
    val approvalRate: Int,
    val completed: Boolean,
)

data class MissionImageUploadResponse(
    val imageUrl: String,
    val originalFileName: String,
    val size: Long,
)
