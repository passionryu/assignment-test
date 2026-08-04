package com.recordroom.book.service

import com.recordroom.book.model.BookCreationType
import com.recordroom.book.model.BookPresetEntity
import com.recordroom.book.model.BookProductResponse
import com.recordroom.book.repository.BookPresetJpaRepository
import com.recordroom.common.ApiException
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component

@Component
class BookProductCatalog(
    private val bookPresetJpaRepository: BookPresetJpaRepository,
) {
    // 서버 상품 정책을 단일 기준으로 사용해 프론트 표시값과 검증값이 어긋나지 않게 한다.
    fun getProducts(): List<BookProductResponse> =
        bookPresetJpaRepository.findAll()
            .map { it.toResponse() }
            .sortedBy { productOrder(it.uid) }

    // 미리보기와 후보 조회는 항상 서버 카탈로그에 있는 상품만 허용한다.
    fun getProduct(uid: String): BookProductResponse =
        getProducts().firstOrNull { it.uid == uid }
            ?: throw ApiException(HttpStatus.BAD_REQUEST, "BOOK_PRODUCT_NOT_FOUND", "선택할 수 없는 상품입니다.")

    private fun BookPresetEntity.toResponse(): BookProductResponse =
        BookProductResponse(
            uid = uid,
            displayName = displayName,
            sizeName = sizeName,
            widthMm = widthMm,
            heightMm = heightMm,
            coverType = coverType,
            bindingType = bindingType,
            paperDescription = paperDescription,
            minPage = minPage,
            maxPage = maxPage,
            basePrice = basePrice,
            includedPageCount = includedPageCount,
            additionalPagePrice = additionalPagePrice,
            shippingPrice = shippingPrice,
            creationType = creationType,
            note = note,
        )

    private fun productOrder(uid: String): Int =
        when (uid) {
            "PHOTOBOOK_A4_SC" -> 1
            "PHOTOBOOK_A5_SC" -> 2
            "SQUAREBOOK_HC" -> 3
            else -> 99
        }
}
