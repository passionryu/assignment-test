package com.recordroom.book.controller

import com.recordroom.book.model.BookContentCandidatesResponse
import com.recordroom.book.model.BookCreateRoomsResponse
import com.recordroom.book.model.BookPreviewResponse
import com.recordroom.book.model.BookProductsResponse
import com.recordroom.book.model.CreateBookPreviewRequest
import com.recordroom.book.service.BookArchiveService
import com.recordroom.member.service.CurrentMemberResolver
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.web.bind.annotation.GetMapping
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
    ): BookContentCandidatesResponse =
        bookArchiveService.getContentCandidates(
            memberId = currentMemberResolver.resolve(rawMemberId),
            roomId = roomId,
            productUid = productUid,
            startDate = startDate,
            endDate = endDate,
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
}
