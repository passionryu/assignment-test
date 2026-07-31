package com.recordroom.common

import org.slf4j.MDC
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class ApiExceptionHandler {
    @ExceptionHandler(ApiException::class)
    fun handleApiException(exception: ApiException): ResponseEntity<ErrorResponse> =
        ResponseEntity
            .status(exception.status)
            .body(ErrorResponse(exception.code, exception.message, currentRequestId()))

    @ExceptionHandler(
        MethodArgumentNotValidException::class,
        HttpMessageNotReadableException::class,
        IllegalArgumentException::class,
    )
    fun handleBadRequest(exception: Exception): ResponseEntity<ErrorResponse> =
        ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse("VALIDATION_ERROR", "요청 값이 올바르지 않습니다.", currentRequestId()))

    @ExceptionHandler(Exception::class)
    fun handleUnexpected(exception: Exception): ResponseEntity<ErrorResponse> =
        ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponse("INTERNAL_SERVER_ERROR", "서버 처리 중 오류가 발생했습니다.", currentRequestId()))

    private fun currentRequestId(): String = MDC.get("requestId") ?: "none"
}

data class ErrorResponse(
    val code: String,
    val message: String,
    val requestId: String,
)
