package com.recordroom.calendar.service

import com.recordroom.calendar.model.CalendarActivityAggregate
import com.recordroom.calendar.model.CalendarActivityType
import com.recordroom.calendar.model.CalendarDayResponse
import com.recordroom.calendar.model.CalendarResponse
import com.recordroom.calendar.model.CalendarRoomActivityResponse
import com.recordroom.calendar.repository.CalendarRepository
import com.recordroom.member.service.MemberService
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.YearMonth
import java.time.ZoneId

@Service
class CalendarService(
    private val memberService: MemberService,
    private val calendarRepository: CalendarRepository,
) {
    fun getMonthlyActivities(memberId: Long, month: YearMonth, roomId: Long?): CalendarResponse {
        memberService.getProfile(memberId)

        val startDate = month.atDay(1)
        val endDateExclusive = month.plusMonths(1).atDay(1)
        val aggregates = listOf(
            calendarRepository.countChatActivities(memberId, startDate, endDateExclusive, roomId),
            calendarRepository.countMemoryActivities(memberId, startDate, endDateExclusive, roomId),
            calendarRepository.countMissionActivities(memberId, startDate, endDateExclusive, roomId),
            calendarRepository.countLetterActivities(memberId, startDate, endDateExclusive, roomId),
        ).flatten()

        val days = aggregates
            .groupBy { it.date }
            .map { (date, dateAggregates) -> toDayResponse(date, dateAggregates) }
            .sortedBy { it.date }

        return CalendarResponse(
            month = month.toString(),
            selectedDate = days.firstOrNull { it.date == LocalDate.now(ZoneId.of("Asia/Seoul")) }?.date ?: days.firstOrNull()?.date,
            days = days,
        )
    }

    private fun toDayResponse(date: LocalDate, aggregates: List<CalendarActivityAggregate>): CalendarDayResponse {
        val rooms = aggregates
            .groupBy { it.roomId }
            .map { (_, roomAggregates) -> toRoomResponse(roomAggregates) }
            .sortedBy { it.roomId }

        return CalendarDayResponse(
            date = date,
            totalCount = rooms.sumOf { it.totalCount },
            chatCount = rooms.sumOf { it.chatCount },
            memoryCount = rooms.sumOf { it.memoryCount },
            missionCount = rooms.sumOf { it.missionCount },
            letterCount = rooms.sumOf { it.letterCount },
            rooms = rooms,
        )
    }

    private fun toRoomResponse(aggregates: List<CalendarActivityAggregate>): CalendarRoomActivityResponse {
        val first = aggregates.first()

        fun count(type: CalendarActivityType): Int =
            aggregates.filter { it.type == type }.sumOf { it.count }

        val chatCount = count(CalendarActivityType.CHAT)
        val memoryCount = count(CalendarActivityType.MEMORY)
        val missionCount = count(CalendarActivityType.MISSION)
        val letterCount = count(CalendarActivityType.LETTER)

        return CalendarRoomActivityResponse(
            roomId = first.roomId,
            roomName = first.roomName,
            totalCount = chatCount + memoryCount + missionCount + letterCount,
            chatCount = chatCount,
            memoryCount = memoryCount,
            missionCount = missionCount,
            letterCount = letterCount,
        )
    }
}
