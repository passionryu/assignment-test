package com.recordroom.book.repository

import com.recordroom.book.model.BookPresetEntity
import com.recordroom.book.model.BookPreviewContentEntity
import com.recordroom.book.model.BookPreviewEntity
import com.recordroom.book.model.PrintOrderContentEntity
import com.recordroom.book.model.PrintOrderEntity
import com.recordroom.book.model.PrintOrderStatus
import com.recordroom.book.model.PrintOrderStatusHistoryEntity
import org.springframework.data.jpa.repository.JpaRepository

interface BookPresetJpaRepository : JpaRepository<BookPresetEntity, String>

interface BookPreviewJpaRepository : JpaRepository<BookPreviewEntity, Long> {
    fun findByIdAndMemberId(id: Long, memberId: Long): BookPreviewEntity?
}

interface BookPreviewContentJpaRepository : JpaRepository<BookPreviewContentEntity, Long> {
    fun findByPreviewIdOrderBySortOrderAsc(previewId: Long): List<BookPreviewContentEntity>
}

interface PrintOrderJpaRepository : JpaRepository<PrintOrderEntity, Long> {
    fun findByIdAndMemberId(id: Long, memberId: Long): PrintOrderEntity?

    fun findByMemberIdAndStatusInOrderByRequestedAtDesc(
        memberId: Long,
        statuses: Collection<PrintOrderStatus>,
    ): List<PrintOrderEntity>
}

interface PrintOrderContentJpaRepository : JpaRepository<PrintOrderContentEntity, Long> {
    fun findByOrderIdOrderBySortOrderAsc(orderId: Long): List<PrintOrderContentEntity>
}

interface PrintOrderStatusHistoryJpaRepository : JpaRepository<PrintOrderStatusHistoryEntity, Long> {
    fun findByOrderIdOrderByChangedAtAscIdAsc(orderId: Long): List<PrintOrderStatusHistoryEntity>
}
