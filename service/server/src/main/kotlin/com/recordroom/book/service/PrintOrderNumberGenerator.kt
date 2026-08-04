package com.recordroom.book.service

import org.springframework.stereotype.Component
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter
import java.util.UUID

@Component
class PrintOrderNumberGenerator {
    // 외부 결제 없이도 주문을 식별할 수 있도록 로컬 주문 번호를 생성한다.
    fun generateOrderNo(now: OffsetDateTime = OffsetDateTime.now()): String {
        val datePart = now.toLocalDate().format(DateTimeFormatter.BASIC_ISO_DATE)
        val randomPart = UUID.randomUUID().toString().replace("-", "").take(10).uppercase()

        return "BO-$datePart-$randomPart"
    }
}
