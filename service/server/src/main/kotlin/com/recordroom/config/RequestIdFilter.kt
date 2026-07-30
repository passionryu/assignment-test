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
        val requestId = request.getHeader(REQUEST_ID_HEADER)?.takeIf { it.isNotBlank() }
            ?: UUID.randomUUID().toString()
        val startedAt = System.currentTimeMillis()

        MDC.put("requestId", requestId)
        response.setHeader(REQUEST_ID_HEADER, requestId)

        try {
            filterChain.doFilter(request, response)
        } finally {
            val elapsedMs = System.currentTimeMillis() - startedAt
            log.info(
                "[HTTP 요청] 요청 처리 완료. who={}, what={} {}, requestData=status:{},elapsedMs:{}, reason=completed",
                request.getHeader("X-Member-Id")?.let { "memberId:$it" } ?: "anonymous",
                request.method,
                request.requestURI,
                response.status,
                elapsedMs,
            )
            MDC.remove("requestId")
        }
    }

    companion object {
        private const val REQUEST_ID_HEADER = "X-Request-Id"
    }
}
