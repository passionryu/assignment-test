package com.recordroom.calendar.controller

import com.recordroom.calendar.model.CalendarResponse
import com.recordroom.calendar.service.CalendarService
import com.recordroom.common.ApiException
import com.recordroom.member.service.CurrentMemberResolver
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.YearMonth
import java.time.ZoneId
import java.time.format.DateTimeParseException

@RestController
@RequestMapping("/api/calendar")
class CalendarController(
    private val currentMemberResolver: CurrentMemberResolver,
    private val calendarService: CalendarService,
) {
    @GetMapping
    fun getCalendar(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @RequestParam(required = false) month: String?,
        @RequestParam(required = false) roomId: Long?,
    ): CalendarResponse =
        calendarService.getMonthlyActivities(
            memberId = currentMemberResolver.resolve(rawMemberId),
            month = parseMonth(month),
            roomId = roomId,
        )

    private fun parseMonth(rawMonth: String?): YearMonth {
        if (rawMonth.isNullOrBlank()) {
            return YearMonth.now(ZoneId.of("Asia/Seoul"))
        }

        return try {
            YearMonth.parse(rawMonth)
        } catch (exception: DateTimeParseException) {
            throw ApiException(HttpStatus.BAD_REQUEST, "INVALID_MONTH", "month는 yyyy-MM 형식이어야 합니다.")
        }
    }
}
