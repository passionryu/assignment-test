package com.recordroom.mission.model

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.OffsetDateTime

@Entity
@Table(name = "mission_approvals")
class MissionApprovalEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    var id: Long = 0,

    @Column(name = "mission_submission_id", nullable = false)
    var missionSubmissionId: Long = 0,

    @Column(name = "approver_member_id", nullable = false)
    var approverMemberId: Long = 0,

    @Column(name = "decision", nullable = false, length = 20)
    var decision: String = "",

    @Column(name = "decided_at", nullable = false)
    var decidedAt: OffsetDateTime = OffsetDateTime.now(),
)
