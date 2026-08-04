package com.recordroom.book.controller

import com.recordroom.book.model.BookContentCandidatesResponse
import com.recordroom.book.model.BookCreateRoomsResponse
import com.recordroom.book.model.BookPreviewResponse
import com.recordroom.book.model.BookProductsResponse
import com.recordroom.book.model.CancelPrintOrderRequest
import com.recordroom.book.model.PrintOrderActionResponse
import com.recordroom.book.model.CreatePrintOrderRequest
import com.recordroom.book.model.CreatePrintOrderResponse
import com.recordroom.book.model.CreateBookPreviewRequest
import com.recordroom.book.model.PrintOrderDetailResponse
import com.recordroom.book.model.PrintOrdersResponse
import com.recordroom.book.service.BookArchiveService
import com.recordroom.book.service.BookOrderService
import com.recordroom.member.service.CurrentMemberResolver
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate

@RestController
@RequestMapping("/api/book-archive")
class BookArchiveController(
    private val currentMemberResolver: CurrentMemberResolver,
    private val bookArchiveService: BookArchiveService,
    private val bookOrderService: BookOrderService,
) {
    @GetMapping("/products")
    fun getProducts(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
    ): BookProductsResponse {
        currentMemberResolver.resolve(rawMemberId)
        return bookArchiveService.getProducts()
    }

    @GetMapping("/rooms")
    fun getCreateRooms(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
    ): BookCreateRoomsResponse =
        bookArchiveService.getCreateRooms(currentMemberResolver.resolve(rawMemberId))

    @GetMapping("/content-candidates")
    fun getContentCandidates(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @RequestParam roomId: Long,
        @RequestParam productUid: String,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate,
        @RequestParam(required = false) contentTypes: String?,
    ): BookContentCandidatesResponse =
        bookArchiveService.getContentCandidates(
            memberId = currentMemberResolver.resolve(rawMemberId),
            roomId = roomId,
            productUid = productUid,
            startDate = startDate,
            endDate = endDate,
            rawContentTypes = contentTypes,
        )

    @PostMapping("/previews")
    fun createPreview(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @RequestBody request: CreateBookPreviewRequest,
    ): BookPreviewResponse =
        bookArchiveService.createPreview(
            memberId = currentMemberResolver.resolve(rawMemberId),
            request = request,
        )

    @PostMapping("/orders")
    fun createOrder(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @RequestBody request: CreatePrintOrderRequest,
    ): CreatePrintOrderResponse =
        bookOrderService.createOrder(
            memberId = currentMemberResolver.resolve(rawMemberId),
            request = request,
        )

    @GetMapping("/orders/status")
    fun getMyActiveOrders(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
    ): PrintOrdersResponse =
        bookOrderService.getMyActiveOrders(currentMemberResolver.resolve(rawMemberId))

    @GetMapping("/orders/history")
    fun getMyOrderHistory(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
    ): PrintOrdersResponse =
        bookOrderService.getMyOrderHistory(currentMemberResolver.resolve(rawMemberId))

    @GetMapping("/orders/{orderId}")
    fun getMyOrderDetail(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable orderId: Long,
    ): PrintOrderDetailResponse =
        bookOrderService.getMyOrderDetail(
            memberId = currentMemberResolver.resolve(rawMemberId),
            orderId = orderId,
        )

    @PostMapping("/orders/{orderId}/cancel")
    fun cancelMyOrder(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable orderId: Long,
        @RequestBody request: CancelPrintOrderRequest,
    ): PrintOrderActionResponse =
        bookOrderService.cancelMyOrder(
            memberId = currentMemberResolver.resolve(rawMemberId),
            orderId = orderId,
            request = request,
        )
}
