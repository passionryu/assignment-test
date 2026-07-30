package com.recordroom.config

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.util.UUID

@Component
class RequestIdFilter : OncePerRequestFilter() {
    private val log = LoggerFactory.getLogger(RequestIdFilter::class.java)

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val requestId = normalizeRequestId(request.getHeader(REQUEST_ID_HEADER))
        val startedAt = System.currentTimeMillis()

        MDC.put("requestId", requestId)
        response.setHeader(REQUEST_ID_HEADER, requestId)

        try {
            filterChain.doFilter(request, response)
        } finally {
            val elapsedMs = System.currentTimeMillis() - startedAt
            log.info(
                "[HTTP 요청] 요청 처리 완료. who={}, what={} {}, requestData=status:{},elapsedMs:{}, reason=completed",
                normalizeMemberId(request.getHeader(MEMBER_ID_HEADER)),
                request.method,
                request.requestURI,
                response.status,
                elapsedMs,
            )
            MDC.remove("requestId")
        }
    }

    private fun normalizeRequestId(rawRequestId: String?): String {
        val value = rawRequestId?.trim()?.takeIf { it.isNotBlank() } ?: return UUID.randomUUID().toString()

        return when {
            runCatching { UUID.fromString(value) }.isSuccess -> value
            REQUEST_ID_PATTERN.matches(value) -> value
            else -> UUID.randomUUID().toString()
        }
    }

    private fun normalizeMemberId(rawMemberId: String?): String {
        val value = rawMemberId?.trim()?.takeIf { it.isNotBlank() } ?: return "anonymous"
        return value.toLongOrNull()?.takeIf { it > 0 }?.let { "memberId:$it" } ?: "invalid"
    }

    companion object {
        private const val REQUEST_ID_HEADER = "X-Request-Id"
        private const val MEMBER_ID_HEADER = "X-Member-Id"
        private val REQUEST_ID_PATTERN = Regex("^[A-Za-z0-9._:-]{1,64}$")
    }
}
