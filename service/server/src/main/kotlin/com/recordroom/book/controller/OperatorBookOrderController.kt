package com.recordroom.book.controller

import com.recordroom.book.model.CancelPrintOrderRequest
import com.recordroom.book.model.PrintOrderActionResponse
import com.recordroom.book.model.PrintOrderDetailResponse
import com.recordroom.book.model.PrintOrderStatus
import com.recordroom.book.model.PrintOrderStatusChangeRequest
import com.recordroom.book.model.PrintOrdersResponse
import com.recordroom.book.service.BookOrderService
import com.recordroom.member.service.CurrentMemberResolver
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/operator/book-orders")
class OperatorBookOrderController(
    private val currentMemberResolver: CurrentMemberResolver,
    private val bookOrderService: BookOrderService,
) {
    @GetMapping
    fun getOrders(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @RequestParam(required = false) status: PrintOrderStatus?,
    ): PrintOrdersResponse =
        bookOrderService.getOperatorOrders(
            operatorMemberId = currentMemberResolver.resolve(rawMemberId),
            status = status,
        )

    @GetMapping("/{orderId}")
    fun getOrderDetail(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable orderId: Long,
    ): PrintOrderDetailResponse =
        bookOrderService.getOperatorOrderDetail(
            operatorMemberId = currentMemberResolver.resolve(rawMemberId),
            orderId = orderId,
        )

    @PostMapping("/{orderId}/next-status")
    fun advanceOrderStatus(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable orderId: Long,
        @RequestBody request: PrintOrderStatusChangeRequest,
    ): PrintOrderActionResponse =
        bookOrderService.advanceOrderStatusAsOperator(
            operatorMemberId = currentMemberResolver.resolve(rawMemberId),
            orderId = orderId,
            memo = request.memo,
        )

    @PostMapping("/{orderId}/cancel")
    fun cancelOrder(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable orderId: Long,
        @RequestBody request: CancelPrintOrderRequest,
    ): PrintOrderActionResponse =
        bookOrderService.cancelOrderAsOperator(
            operatorMemberId = currentMemberResolver.resolve(rawMemberId),
            orderId = orderId,
            request = request,
        )
}
