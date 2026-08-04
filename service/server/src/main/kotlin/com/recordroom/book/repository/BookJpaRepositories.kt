package com.recordroom.book.repository

import com.recordroom.book.model.BookPresetEntity
import com.recordroom.book.model.BookPreviewContentEntity
import com.recordroom.book.model.BookPreviewEntity
import com.recordroom.book.model.PrintOrderContentEntity
import com.recordroom.book.model.PrintOrderEntity
import com.recordroom.book.model.PrintOrderStatusHistoryEntity
import org.springframework.data.jpa.repository.JpaRepository

interface BookPresetJpaRepository : JpaRepository<BookPresetEntity, String>

interface BookPreviewJpaRepository : JpaRepository<BookPreviewEntity, Long>

interface BookPreviewContentJpaRepository : JpaRepository<BookPreviewContentEntity, Long>

interface PrintOrderJpaRepository : JpaRepository<PrintOrderEntity, Long>

interface PrintOrderContentJpaRepository : JpaRepository<PrintOrderContentEntity, Long>

interface PrintOrderStatusHistoryJpaRepository : JpaRepository<PrintOrderStatusHistoryEntity, Long>
