package com.recordroom.mission.repository

import com.recordroom.mission.model.MissionApprovalEntity
import org.springframework.data.jpa.repository.JpaRepository

interface MissionApprovalJpaRepository : JpaRepository<MissionApprovalEntity, Long> {
    fun findByMissionSubmissionIdAndApproverMemberId(missionSubmissionId: Long, approverMemberId: Long): MissionApprovalEntity?
}
