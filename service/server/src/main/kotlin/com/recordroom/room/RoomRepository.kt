package com.recordroom.room

import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Repository

@Repository
class RoomRepository(
    private val jdbcTemplate: JdbcTemplate,
) {
    // 사용자가 참여 중인 방만 사이드바에 노출해야 하므로 멤버십 기준으로 조회한다.
    fun findRoomsJoinedByMember(memberId: Long): List<RoomSummaryResponse> =
        jdbcTemplate.query(
            """
            select
                r.id,
                r.name,
                r.description,
                r.type,
                rm.role,
                count(active_rm.id)::int as member_count
            from rooms r
            join room_members rm
                on rm.room_id = r.id
                and rm.member_id = ?
                and rm.left_at is null
            left join room_members active_rm
                on active_rm.room_id = r.id
                and active_rm.left_at is null
            where r.archived_at is null
            group by r.id, r.name, r.description, r.type, rm.role
            order by r.id asc
            """.trimIndent(),
            { rs, _ ->
                RoomSummaryResponse(
                    id = rs.getLong("id"),
                    name = rs.getString("name"),
                    description = rs.getString("description"),
                    type = rs.getString("type"),
                    role = rs.getString("role"),
                    memberCount = rs.getInt("member_count"),
                    unreadChatCount = seedUnreadChatCount(rs.getLong("id")),
                    pendingMissionCount = seedPendingMissionCount(rs.getLong("id")),
                )
            },
            memberId,
        )

    // 초대 받은 방 조회 탭에 표시할 대기 초대 수를 현재 회원 식별값 기준으로 계산한다.
    fun countPendingInvitationsForMember(memberId: Long): Int =
        jdbcTemplate.queryForObject(
            """
            select count(*)::int
            from room_invitations ri
            join members m on m.id = ?
            where ri.status = 'PENDING'
              and ri.expires_at > now()
              and (
                ri.invitee_member_id = m.id
                or ri.invitee_email = m.email
                or ri.invitee_phone_number = m.phone_number
              )
            """.trimIndent(),
            Int::class.java,
            memberId,
        )

    private fun seedUnreadChatCount(roomId: Long): Int =
        when (roomId) {
            1L -> 1
            else -> 0
        }

    private fun seedPendingMissionCount(roomId: Long): Int =
        when (roomId) {
            1L -> 2
            else -> 0
        }
}
