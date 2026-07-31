package com.recordroom.health

import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api")
class HealthController(
    private val jdbcTemplate: JdbcTemplate,
) {
    @GetMapping("/health")
    fun health(): HealthResponse {
        val databaseStatus = runCatching {
            jdbcTemplate.queryForObject("select 1", Int::class.java)
        }.fold(
            onSuccess = { "UP" },
            onFailure = { "DOWN" },
        )

        return HealthResponse(
            status = if (databaseStatus == "UP") "UP" else "DEGRADED",
            database = databaseStatus,
        )
    }
}

data class HealthResponse(
    val status: String,
    val database: String,
)
