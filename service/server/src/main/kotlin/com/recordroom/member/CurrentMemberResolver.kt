package com.recordroom.member

import com.recordroom.common.ApiException
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component

@Component
class CurrentMemberResolver {
    fun resolve(rawMemberId: String?): Long {
        val value = rawMemberId?.trim()
            ?: throw ApiException(HttpStatus.UNAUTHORIZED, "MEMBER_ID_REQUIRED", "회원 식별 헤더가 없습니다.")

        return value.toLongOrNull()
            ?.takeIf { it > 0 }
            ?: throw ApiException(HttpStatus.UNAUTHORIZED, "MEMBER_ID_INVALID", "회원 식별 헤더가 올바르지 않습니다.")
    }
}
