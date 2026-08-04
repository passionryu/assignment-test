package com.recordroom.book.service

import com.recordroom.book.model.BookCreationType
import com.recordroom.book.model.BookProductResponse
import kotlin.test.Test
import kotlin.test.assertEquals

class BookEstimateCalculatorTest {
    private val calculator = BookEstimateCalculator()

    @Test
    fun `included pages only charge base and shipping per quantity`() {
        val estimate = calculator.calculate(product(), estimatedPageCount = 38, quantity = 2)

        assertEquals(0, estimate.additionalPageCount)
        assertEquals(0, estimate.additionalPagePrice)
        assertEquals(35000, estimate.subtotalPrice)
        assertEquals(70000, estimate.totalPrice)
    }

    @Test
    fun `pages over included range add page price before quantity`() {
        val estimate = calculator.calculate(product(), estimatedPageCount = 45, quantity = 3)

        assertEquals(5, estimate.additionalPageCount)
        assertEquals(1500, estimate.additionalPagePrice)
        assertEquals(36500, estimate.subtotalPrice)
        assertEquals(109500, estimate.totalPrice)
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
