package com.recordroom.book.service

import com.recordroom.book.model.BookEstimateResponse
import com.recordroom.book.model.BookProductResponse
import org.springframework.stereotype.Component

@Component
class BookEstimateCalculator {
    // 실제 결제가 아닌 과제용 mock 견적이므로 상품 정책과 수량만으로 총액을 계산한다.
    fun calculate(product: BookProductResponse, estimatedPageCount: Int, quantity: Int): BookEstimateResponse {
        val additionalPageCount = maxOf(estimatedPageCount - product.includedPageCount, 0)
        val additionalPrice = additionalPageCount * product.additionalPagePrice
        val subtotalPrice = product.basePrice + additionalPrice + product.shippingPrice

        return BookEstimateResponse(
            basePrice = product.basePrice,
            includedPageCount = product.includedPageCount,
            additionalPageCount = additionalPageCount,
            additionalPagePrice = additionalPrice,
            shippingPrice = product.shippingPrice,
            quantity = quantity,
            subtotalPrice = subtotalPrice,
            totalPrice = subtotalPrice * quantity,
        )
    }
}
