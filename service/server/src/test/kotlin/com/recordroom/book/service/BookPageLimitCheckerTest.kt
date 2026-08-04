package com.recordroom.book.service

import com.recordroom.book.model.BookCreationType
import com.recordroom.book.model.BookPageLimitStatus
import com.recordroom.book.model.BookProductResponse
import kotlin.test.Test
import kotlin.test.assertEquals

class BookPageLimitCheckerTest {
    private val checker = BookPageLimitChecker()

    @Test
    fun `under minimum pages are padded by template pages`() {
        val pageRange = checker.check(product(), rawPageCount = 12)

        assertEquals(BookPageLimitStatus.AVAILABLE, pageRange.status)
        assertEquals(24, pageRange.estimatedPageCount)
    }

    @Test
    fun `pages over max range are blocked`() {
        val pageRange = checker.check(product(), rawPageCount = 131)

        assertEquals(BookPageLimitStatus.OVER_MAX, pageRange.status)
        assertEquals(131, pageRange.estimatedPageCount)
    }

    private fun product(): BookProductResponse =
        BookProductResponse(
            uid = "PHOTOBOOK_A4_SC",
            displayName = "A4 소프트커버 포토북",
            sizeName = "A4",
            widthMm = 210,
            heightMm = 297,
            coverType = "SOFTCOVER",
            bindingType = "무선제본",
            paperDescription = "사진 중심 템플릿",
            minPage = 24,
            maxPage = 130,
            basePrice = 32000,
            includedPageCount = 40,
            additionalPagePrice = 300,
            shippingPrice = 3000,
            creationType = BookCreationType.TEMPLATE,
            note = "테스트 상품",
        )
}
