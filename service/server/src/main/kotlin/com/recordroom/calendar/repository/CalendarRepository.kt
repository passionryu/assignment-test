package com.recordroom.calendar.repository

import com.querydsl.jpa.impl.JPAQueryFactory
import com.recordroom.calendar.model.CalendarActivityAggregate
import com.recordroom.calendar.model.CalendarActivityType
import com.recordroom.calendar.model.QChatMessageEntity.chatMessageEntity
import com.recordroom.calendar.model.QLetterEntity.letterEntity
import com.recordroom.calendar.model.QMemoryPostEntity.memoryPostEntity
import com.recordroom.calendar.model.QMissionEntity.missionEntity
import com.recordroom.calendar.model.QMissionSubmissionEntity.missionSubmissionEntity
import com.recordroom.room.model.QRoomEntity.roomEntity
import com.recordroom.room.model.QRoomMemberEntity
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
class CalendarRepository(
    private val queryFactory: JPAQueryFactory,
) {
    // 캘린더는 현재 회원이 참여 중인 방의 채팅 기록을 날짜별로 집계한다.
    fun countChatActivities(memberId: Long, startDate: LocalDate, endDateExclusive: LocalDate, roomId: Long?): List<CalendarActivityAggregate> {
        val roomMember = QRoomMemberEntity("calendarChatRoomMember")
        val count = chatMessageEntity.id.count()

        return queryFactory
            .select(chatMessageEntity.occurredDate, roomEntity.id, roomEntity.name, count)
            .from(chatMessageEntity)
            .join(roomEntity).on(roomEntity.id.eq(chatMessageEntity.roomId))
            .join(roomMember).on(
                roomMember.roomId.eq(chatMessageEntity.roomId),
                roomMember.memberId.eq(memberId),
                roomMember.leftAt.isNull,
            )
            .where(
                chatMessageEntity.deletedAt.isNull,
                chatMessageEntity.occurredDate.goe(startDate),
                chatMessageEntity.occurredDate.lt(endDateExclusive),
                roomId?.let { chatMessageEntity.roomId.eq(it) },
            )
            .groupBy(chatMessageEntity.occurredDate, roomEntity.id, roomEntity.name)
            .fetch()
            .map { row ->
                CalendarActivityAggregate(
                    date = row.get(chatMessageEntity.occurredDate) ?: startDate,
                    roomId = row.get(roomEntity.id) ?: 0L,
                    roomName = row.get(roomEntity.name) ?: "",
                    type = CalendarActivityType.CHAT,
                    count = row.get(count)?.toInt() ?: 0,
                )
            }
    }

    // 캘린더는 현재 회원이 볼 수 있는 추억 게시글을 날짜별로 집계한다.
    fun countMemoryActivities(memberId: Long, startDate: LocalDate, endDateExclusive: LocalDate, roomId: Long?): List<CalendarActivityAggregate> {
        val roomMember = QRoomMemberEntity("calendarMemoryRoomMember")
        val count = memoryPostEntity.id.count()

        return queryFactory
            .select(memoryPostEntity.occurredDate, roomEntity.id, roomEntity.name, count)
            .from(memoryPostEntity)
            .join(roomEntity).on(roomEntity.id.eq(memoryPostEntity.roomId))
            .join(roomMember).on(
                roomMember.roomId.eq(memoryPostEntity.roomId),
                roomMember.memberId.eq(memberId),
                roomMember.leftAt.isNull,
            )
            .where(
                memoryPostEntity.deletedAt.isNull,
                memoryPostEntity.occurredDate.goe(startDate),
                memoryPostEntity.occurredDate.lt(endDateExclusive),
                roomId?.let { memoryPostEntity.roomId.eq(it) },
            )
            .groupBy(memoryPostEntity.occurredDate, roomEntity.id, roomEntity.name)
            .fetch()
            .map { row ->
                CalendarActivityAggregate(
                    date = row.get(memoryPostEntity.occurredDate) ?: startDate,
                    roomId = row.get(roomEntity.id) ?: 0L,
                    roomName = row.get(roomEntity.name) ?: "",
                    type = CalendarActivityType.MEMORY,
                    count = row.get(count)?.toInt() ?: 0,
                )
            }
    }

    // 캘린더는 미션 인증 제출 기록을 미션이 속한 방 기준으로 집계한다.
    fun countMissionActivities(memberId: Long, startDate: LocalDate, endDateExclusive: LocalDate, roomId: Long?): List<CalendarActivityAggregate> {
        val roomMember = QRoomMemberEntity("calendarMissionRoomMember")
        val count = missionSubmissionEntity.id.count()

        return queryFactory
            .select(missionSubmissionEntity.occurredDate, roomEntity.id, roomEntity.name, count)
            .from(missionSubmissionEntity)
            .join(missionEntity).on(missionEntity.id.eq(missionSubmissionEntity.missionId))
            .join(roomEntity).on(roomEntity.id.eq(missionEntity.roomId))
            .join(roomMember).on(
                roomMember.roomId.eq(missionEntity.roomId),
                roomMember.memberId.eq(memberId),
                roomMember.leftAt.isNull,
            )
            .where(
                missionSubmissionEntity.occurredDate.goe(startDate),
                missionSubmissionEntity.occurredDate.lt(endDateExclusive),
                roomId?.let { missionEntity.roomId.eq(it) },
            )
            .groupBy(missionSubmissionEntity.occurredDate, roomEntity.id, roomEntity.name)
            .fetch()
            .map { row ->
                CalendarActivityAggregate(
                    date = row.get(missionSubmissionEntity.occurredDate) ?: startDate,
                    roomId = row.get(roomEntity.id) ?: 0L,
                    roomName = row.get(roomEntity.name) ?: "",
                    type = CalendarActivityType.MISSION,
                    count = row.get(count)?.toInt() ?: 0,
                )
            }
    }

    // 캘린더는 현재 회원이 속한 방에서 삭제되지 않은 편지를 날짜별로 집계한다.
    fun countLetterActivities(memberId: Long, startDate: LocalDate, endDateExclusive: LocalDate, roomId: Long?): List<CalendarActivityAggregate> {
        val roomMember = QRoomMemberEntity("calendarLetterRoomMember")
        val count = letterEntity.id.count()

        return queryFactory
            .select(letterEntity.occurredDate, roomEntity.id, roomEntity.name, count)
            .from(letterEntity)
            .join(roomEntity).on(roomEntity.id.eq(letterEntity.roomId))
            .join(roomMember).on(
                roomMember.roomId.eq(letterEntity.roomId),
                roomMember.memberId.eq(memberId),
                roomMember.leftAt.isNull,
            )
            .where(
                letterEntity.deletedBySenderAt.isNull,
                letterEntity.deletedByReceiverAt.isNull,
                letterEntity.occurredDate.goe(startDate),
                letterEntity.occurredDate.lt(endDateExclusive),
                roomId?.let { letterEntity.roomId.eq(it) },
            )
            .groupBy(letterEntity.occurredDate, roomEntity.id, roomEntity.name)
            .fetch()
            .map { row ->
                CalendarActivityAggregate(
                    date = row.get(letterEntity.occurredDate) ?: startDate,
                    roomId = row.get(roomEntity.id) ?: 0L,
                    roomName = row.get(roomEntity.name) ?: "",
                    type = CalendarActivityType.LETTER,
                    count = row.get(count)?.toInt() ?: 0,
                )
            }
    }
}
