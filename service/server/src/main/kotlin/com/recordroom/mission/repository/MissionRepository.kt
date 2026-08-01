package com.recordroom.mission.repository

import com.querydsl.jpa.impl.JPAQueryFactory
import com.recordroom.calendar.model.MissionEntity
import com.recordroom.calendar.model.MissionSubmissionEntity
import com.recordroom.calendar.model.QMissionEntity.missionEntity
import com.recordroom.calendar.model.QMissionSubmissionEntity.missionSubmissionEntity
import com.recordroom.mission.model.MissionApprovalEntity
import com.recordroom.mission.model.QMissionApprovalEntity.missionApprovalEntity
import org.springframework.stereotype.Repository

@Repository
class MissionRepository(
    private val queryFactory: JPAQueryFactory,
    private val missionJpaRepository: MissionJpaRepository,
    private val missionSubmissionJpaRepository: MissionSubmissionJpaRepository,
    private val missionApprovalJpaRepository: MissionApprovalJpaRepository,
) {
    // 선택 방의 미션 현황을 진행 상태와 최신 생성순 기준으로 보여주기 위해 조회한다.
    fun findMissionsByRoom(roomId: Long): List<MissionEntity> =
        queryFactory
            .selectFrom(missionEntity)
            .where(missionEntity.roomId.eq(roomId))
            .orderBy(missionEntity.id.asc())
            .fetch()

    // 미션 카드에는 가장 최근 인증 요청만 대표 상태로 보여주므로 최신 제출을 조회한다.
    fun findLatestSubmission(missionId: Long): MissionSubmissionEntity? =
        queryFactory
            .selectFrom(missionSubmissionEntity)
            .where(missionSubmissionEntity.missionId.eq(missionId))
            .orderBy(missionSubmissionEntity.submittedAt.desc(), missionSubmissionEntity.id.desc())
            .fetchFirst()

    // 인증 요청과 동의는 선택 미션의 방 소속을 검증해야 하므로 단건 미션을 조회한다.
    fun findMission(missionId: Long): MissionEntity? =
        missionJpaRepository.findById(missionId).orElse(null)

    // 동의 처리는 제출자와 대상 미션을 확인해야 하므로 단건 인증 요청을 조회한다.
    fun findSubmission(submissionId: Long): MissionSubmissionEntity? =
        missionSubmissionJpaRepository.findById(submissionId).orElse(null)

    // 동의율과 완료 조건을 계산하기 위해 승인된 동의 수만 집계한다.
    fun countApprovedApprovals(submissionId: Long): Int =
        queryFactory
            .select(missionApprovalEntity.id.count())
            .from(missionApprovalEntity)
            .where(
                missionApprovalEntity.missionSubmissionId.eq(submissionId),
                missionApprovalEntity.decision.eq("APPROVED"),
            )
            .fetchOne()
            ?.toInt() ?: 0

    // 한 사용자가 같은 인증 요청에 중복 동의하지 않도록 기존 결정을 조회한다.
    fun findApproval(submissionId: Long, approverMemberId: Long): MissionApprovalEntity? =
        missionApprovalJpaRepository.findByMissionSubmissionIdAndApproverMemberId(submissionId, approverMemberId)

    // 가족/학급 방은 방장 동의만으로도 완료될 수 있어 방장 승인 여부를 확인한다.
    fun existsOwnerApproval(submissionId: Long, ownerMemberId: Long): Boolean =
        queryFactory
            .selectOne()
            .from(missionApprovalEntity)
            .where(
                missionApprovalEntity.missionSubmissionId.eq(submissionId),
                missionApprovalEntity.approverMemberId.eq(ownerMemberId),
                missionApprovalEntity.decision.eq("APPROVED"),
            )
            .fetchFirst() != null

    // 사용자가 커스텀 미션을 추가하면 같은 방 미션 목록에 바로 반영한다.
    fun saveMission(mission: MissionEntity): MissionEntity =
        missionJpaRepository.save(mission)

    // 인증 요청은 사진과 기록 본문을 남겨 동의 흐름과 캘린더 기록에 반영한다.
    fun saveSubmission(submission: MissionSubmissionEntity): MissionSubmissionEntity =
        missionSubmissionJpaRepository.save(submission)

    // 같은 사용자의 재동의 요청은 기존 결정을 갱신해 중복 동의가 생기지 않게 한다.
    fun saveApproval(approval: MissionApprovalEntity): MissionApprovalEntity =
        missionApprovalJpaRepository.save(approval)
}
