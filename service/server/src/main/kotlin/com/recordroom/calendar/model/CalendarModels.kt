package com.recordroom.calendar.model

import java.time.LocalDate

data class CalendarResponse(
    val month: String,
    val selectedDate: LocalDate?,
    val days: List<CalendarDayResponse>,
)

data class CalendarDayResponse(
    val date: LocalDate,
    val totalCount: Int,
    val chatCount: Int,
    val memoryCount: Int,
    val missionCount: Int,
    val letterCount: Int,
    val rooms: List<CalendarRoomActivityResponse>,
)

data class CalendarRoomActivityResponse(
    val roomId: Long,
    val roomName: String,
    val totalCount: Int,
    val chatCount: Int,
    val memoryCount: Int,
    val missionCount: Int,
    val letterCount: Int,
)

data class CalendarActivityAggregate(
    val date: LocalDate,
    val roomId: Long,
    val roomName: String,
    val type: CalendarActivityType,
    val count: Int,
)

enum class CalendarActivityType {
    CHAT,
    MEMORY,
    MISSION,
    LETTER,
}
