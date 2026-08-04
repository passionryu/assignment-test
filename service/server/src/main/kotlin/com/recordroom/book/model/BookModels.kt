package com.recordroom.book.model

import java.time.LocalDate
import java.time.OffsetDateTime

enum class BookCreationType {
    TEMPLATE,
}

enum class BookContentType {
    MEMORY,
    MISSION,
    LETTER,
    CHAT,
}

enum class PrintOrderStatus {
    PAID,
    PDF_READY,
    CONFIRMED,
    IN_PRODUCTION,
    PRODUCTION_COMPLETE,
    SHIPPED,
    DELIVERED,
    CANCELLED_REFUND,
    ERROR,
}

enum class BookPageLimitStatus {
    UNDER_MIN,
    AVAILABLE,
    OVER_MAX,
}

data class BookProductResponse(
    val uid: String,
    val displayName: String,
    val sizeName: String,
    val widthMm: Int,
    val heightMm: Int,
    val coverType: String,
    val bindingType: String,
    val paperDescription: String,
    val minPage: Int,
    val maxPage: Int,
    val basePrice: Int,
    val includedPageCount: Int,
    val additionalPagePrice: Int,
    val shippingPrice: Int,
    val creationType: BookCreationType,
    val note: String,
)

data class BookProductsResponse(
    val products: List<BookProductResponse>,
)

data class BookCreateRoomsResponse(
    val rooms: List<BookCreateRoomResponse>,
)

data class BookCreateRoomResponse(
    val id: Long,
    val name: String,
    val type: String,
    val memberCount: Int,
    val bookableRecordCount: Int,
)

data class BookPeriodResponse(
    val startDate: LocalDate,
    val endDate: LocalDate,
)

data class BookContentCandidateResponse(
    val type: BookContentType,
    val sourceId: Long,
    val title: String,
    val description: String,
    val occurredDate: LocalDate,
    val authorName: String,
    val imageCount: Int,
    val commentCount: Int,
    val pageCount: Int,
    val selectedByDefault: Boolean,
    val sourceLabel: String,
)

data class BookContentSummaryResponse(
    val memoryCount: Int,
    val missionCount: Int,
    val letterCount: Int,
    val chatCount: Int,
    val estimatedPageCount: Int,
)

data class BookPageRangeResponse(
    val minPage: Int,
    val maxPage: Int,
    val estimatedPageCount: Int,
    val status: BookPageLimitStatus,
    val message: String,
)

data class BookContentCandidatesResponse(
    val roomId: Long,
    val roomName: String,
    val product: BookProductResponse,
    val period: BookPeriodResponse,
    val defaultContents: List<BookContentCandidateResponse>,
    val additionalContents: List<BookContentCandidateResponse>,
    val summary: BookContentSummaryResponse,
    val pageRange: BookPageRangeResponse,
)

data class CreateBookPreviewRequest(
    val roomId: Long?,
    val bookSpecUid: String?,
    val title: String?,
    val quantity: Int?,
    val periodStartDate: LocalDate?,
    val periodEndDate: LocalDate?,
    val contents: List<BookPreviewContentItemRequest>?,
)

data class BookPreviewContentItemRequest(
    val type: BookContentType?,
    val sourceId: Long?,
)

data class BookEstimateResponse(
    val basePrice: Int,
    val includedPageCount: Int,
    val additionalPageCount: Int,
    val additionalPagePrice: Int,
    val shippingPrice: Int,
    val quantity: Int,
    val subtotalPrice: Int,
    val totalPrice: Int,
)

data class BookPreviewPageResponse(
    val pageNumber: Int,
    val label: String,
    val title: String,
    val description: String,
    val contentType: BookContentType?,
    val occurredDate: LocalDate?,
)

data class BookPreviewResponse(
    val previewId: Long,
    val creationType: BookCreationType,
    val roomId: Long,
    val roomName: String,
    val product: BookProductResponse,
    val title: String,
    val period: BookPeriodResponse,
    val contents: List<BookContentCandidateResponse>,
    val summary: BookContentSummaryResponse,
    val pageRange: BookPageRangeResponse,
    val estimate: BookEstimateResponse,
    val pages: List<BookPreviewPageResponse>,
    val warnings: List<String>,
)

data class CreatePrintOrderRequest(
    val previewId: Long?,
)

data class CreatePrintOrderResponse(
    val order: PrintOrderDetailResponse,
)

data class CancelPrintOrderRequest(
    val reason: String?,
)

data class PrintOrderStatusChangeRequest(
    val memo: String?,
)

data class PrintOrderActionResponse(
    val order: PrintOrderDetailResponse,
)

data class PrintOrdersResponse(
    val orders: List<PrintOrderSummaryResponse>,
)

data class PrintOrderSummaryResponse(
    val id: Long,
    val orderNo: String,
    val memberId: Long,
    val memberName: String,
    val roomId: Long,
    val roomName: String,
    val product: BookProductResponse,
    val title: String,
    val quantity: Int,
    val estimatedPageCount: Int,
    val totalPrice: Int,
    val status: PrintOrderStatus,
    val statusLabel: String,
    val requestedAt: OffsetDateTime,
    val updatedAt: OffsetDateTime,
)

data class PrintOrderDetailResponse(
    val id: Long,
    val orderNo: String,
    val memberId: Long,
    val memberName: String,
    val roomId: Long,
    val roomName: String,
    val product: BookProductResponse,
    val creationType: BookCreationType,
    val title: String,
    val quantity: Int,
    val period: BookPeriodResponse,
    val estimatedPageCount: Int,
    val basePrice: Int,
    val additionalPagePrice: Int,
    val shippingPrice: Int,
    val totalPrice: Int,
    val status: PrintOrderStatus,
    val statusLabel: String,
    val requestedAt: OffsetDateTime,
    val updatedAt: OffsetDateTime,
    val cancelledAt: OffsetDateTime?,
    val cancelReason: String?,
    val contents: List<PrintOrderContentSnapshotResponse>,
    val statusHistories: List<PrintOrderStatusHistoryResponse>,
)

data class PrintOrderContentSnapshotResponse(
    val type: BookContentType,
    val sourceId: Long,
    val title: String,
    val occurredDate: LocalDate,
    val pageCount: Int,
    val sortOrder: Int,
    val snapshot: BookContentCandidateResponse?,
)

data class PrintOrderStatusHistoryResponse(
    val id: Long,
    val previousStatus: PrintOrderStatus?,
    val nextStatus: PrintOrderStatus,
    val nextStatusLabel: String,
    val memo: String?,
    val changedAt: OffsetDateTime,
)

data class BookContentCandidate(
    val type: BookContentType,
    val sourceId: Long,
    val title: String,
    val description: String,
    val occurredDate: LocalDate,
    val authorName: String,
    val imageCount: Int,
    val commentCount: Int,
    val selectedByDefault: Boolean,
    val sourceLabel: String,
)
