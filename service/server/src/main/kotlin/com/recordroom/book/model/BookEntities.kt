package com.recordroom.book.model

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDate
import java.time.OffsetDateTime

@Entity
@Table(name = "book_presets")
class BookPresetEntity(
    @Id
    @Column(name = "uid", nullable = false, length = 40)
    var uid: String = "",

    @Column(name = "display_name", nullable = false, length = 80)
    var displayName: String = "",

    @Column(name = "size_name", nullable = false, length = 40)
    var sizeName: String = "",

    @Column(name = "width_mm", nullable = false)
    var widthMm: Int = 0,

    @Column(name = "height_mm", nullable = false)
    var heightMm: Int = 0,

    @Column(name = "cover_type", nullable = false, length = 40)
    var coverType: String = "",

    @Column(name = "binding_type", nullable = false, length = 40)
    var bindingType: String = "",

    @Column(name = "paper_description", nullable = false, length = 120)
    var paperDescription: String = "",

    @Column(name = "min_page", nullable = false)
    var minPage: Int = 0,

    @Column(name = "max_page", nullable = false)
    var maxPage: Int = 0,

    @Column(name = "base_price", nullable = false)
    var basePrice: Int = 0,

    @Column(name = "included_page_count", nullable = false)
    var includedPageCount: Int = 0,

    @Column(name = "additional_page_price", nullable = false)
    var additionalPagePrice: Int = 0,

    @Column(name = "shipping_price", nullable = false)
    var shippingPrice: Int = 0,

    @Enumerated(EnumType.STRING)
    @Column(name = "creation_type", nullable = false, length = 30)
    var creationType: BookCreationType = BookCreationType.TEMPLATE,

    @Column(name = "note", nullable = false, length = 255)
    var note: String = "",
)

@Entity
@Table(name = "book_previews")
class BookPreviewEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    var id: Long = 0,

    @Column(name = "member_id", nullable = false)
    var memberId: Long = 0,

    @Column(name = "room_id", nullable = false)
    var roomId: Long = 0,

    @Column(name = "book_spec_uid", nullable = false, length = 40)
    var bookSpecUid: String = "",

    @Enumerated(EnumType.STRING)
    @Column(name = "creation_type", nullable = false, length = 30)
    var creationType: BookCreationType = BookCreationType.TEMPLATE,

    @Column(name = "title", nullable = false, length = 120)
    var title: String = "",

    @Column(name = "quantity", nullable = false)
    var quantity: Int = 1,

    @Column(name = "period_start_date", nullable = false)
    var periodStartDate: LocalDate = LocalDate.now(),

    @Column(name = "period_end_date", nullable = false)
    var periodEndDate: LocalDate = LocalDate.now(),

    @Column(name = "estimated_page_count", nullable = false)
    var estimatedPageCount: Int = 0,

    @Column(name = "base_price", nullable = false)
    var basePrice: Int = 0,

    @Column(name = "additional_page_price", nullable = false)
    var additionalPagePrice: Int = 0,

    @Column(name = "shipping_price", nullable = false)
    var shippingPrice: Int = 0,

    @Column(name = "total_price", nullable = false)
    var totalPrice: Int = 0,

    @Column(name = "created_at", nullable = false)
    var createdAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "expires_at", nullable = false)
    var expiresAt: OffsetDateTime = OffsetDateTime.now().plusDays(7),
)

@Entity
@Table(name = "book_preview_contents")
class BookPreviewContentEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    var id: Long = 0,

    @Column(name = "preview_id", nullable = false)
    var previewId: Long = 0,

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false, length = 30)
    var contentType: BookContentType = BookContentType.MEMORY,

    @Column(name = "source_id", nullable = false)
    var sourceId: Long = 0,

    @Column(name = "title", nullable = false, length = 120)
    var title: String = "",

    @Column(name = "occurred_date", nullable = false)
    var occurredDate: LocalDate = LocalDate.now(),

    @Column(name = "page_count", nullable = false)
    var pageCount: Int = 1,

    @Column(name = "sort_order", nullable = false)
    var sortOrder: Int = 0,

    @Column(name = "snapshot_json", nullable = false)
    var snapshotJson: String = "{}",
)

@Entity
@Table(name = "print_orders")
class PrintOrderEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    var id: Long = 0,

    @Column(name = "order_no", nullable = false, length = 40)
    var orderNo: String = "",

    @Column(name = "member_id", nullable = false)
    var memberId: Long = 0,

    @Column(name = "room_id", nullable = false)
    var roomId: Long = 0,

    @Column(name = "preview_id")
    var previewId: Long? = null,

    @Column(name = "book_spec_uid", nullable = false, length = 40)
    var bookSpecUid: String = "",

    @Enumerated(EnumType.STRING)
    @Column(name = "creation_type", nullable = false, length = 30)
    var creationType: BookCreationType = BookCreationType.TEMPLATE,

    @Column(name = "title", nullable = false, length = 120)
    var title: String = "",

    @Column(name = "quantity", nullable = false)
    var quantity: Int = 1,

    @Column(name = "period_start_date", nullable = false)
    var periodStartDate: LocalDate = LocalDate.now(),

    @Column(name = "period_end_date", nullable = false)
    var periodEndDate: LocalDate = LocalDate.now(),

    @Column(name = "estimated_page_count", nullable = false)
    var estimatedPageCount: Int = 0,

    @Column(name = "base_price", nullable = false)
    var basePrice: Int = 0,

    @Column(name = "additional_page_price", nullable = false)
    var additionalPagePrice: Int = 0,

    @Column(name = "shipping_price", nullable = false)
    var shippingPrice: Int = 0,

    @Column(name = "total_price", nullable = false)
    var totalPrice: Int = 0,

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    var status: PrintOrderStatus = PrintOrderStatus.PAID,

    @Column(name = "requested_at", nullable = false)
    var requestedAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "cancelled_at")
    var cancelledAt: OffsetDateTime? = null,

    @Column(name = "cancel_reason", length = 255)
    var cancelReason: String? = null,
)

@Entity
@Table(name = "print_order_contents")
class PrintOrderContentEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    var id: Long = 0,

    @Column(name = "order_id", nullable = false)
    var orderId: Long = 0,

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false, length = 30)
    var contentType: BookContentType = BookContentType.MEMORY,

    @Column(name = "source_id", nullable = false)
    var sourceId: Long = 0,

    @Column(name = "title", nullable = false, length = 120)
    var title: String = "",

    @Column(name = "occurred_date", nullable = false)
    var occurredDate: LocalDate = LocalDate.now(),

    @Column(name = "page_count", nullable = false)
    var pageCount: Int = 1,

    @Column(name = "sort_order", nullable = false)
    var sortOrder: Int = 0,

    @Column(name = "snapshot_json", nullable = false)
    var snapshotJson: String = "{}",
)

@Entity
@Table(name = "print_order_status_histories")
class PrintOrderStatusHistoryEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    var id: Long = 0,

    @Column(name = "order_id", nullable = false)
    var orderId: Long = 0,

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 40)
    var previousStatus: PrintOrderStatus? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "next_status", nullable = false, length = 40)
    var nextStatus: PrintOrderStatus = PrintOrderStatus.PAID,

    @Column(name = "changed_by_member_id")
    var changedByMemberId: Long? = null,

    @Column(name = "memo", length = 255)
    var memo: String? = null,

    @Column(name = "changed_at", nullable = false)
    var changedAt: OffsetDateTime = OffsetDateTime.now(),
)
