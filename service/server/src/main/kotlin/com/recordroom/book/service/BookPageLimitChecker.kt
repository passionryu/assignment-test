package com.recordroom.book.service

import com.recordroom.book.model.BookPageLimitStatus
import com.recordroom.book.model.BookPageRangeResponse
import com.recordroom.book.model.BookProductResponse
import org.springframework.stereotype.Component

@Component
class BookPageLimitChecker {
    // 상품 최대 페이지를 넘는 구성은 주문 전 단계로 진행하지 못하게 차단한다.
    fun check(product: BookProductResponse, rawPageCount: Int): BookPageRangeResponse {
        val estimatedPageCount = maxOf(rawPageCount, product.minPage)

        return when {
            rawPageCount > product.maxPage -> BookPageRangeResponse(
                minPage = product.minPage,
                maxPage = product.maxPage,
                estimatedPageCount = rawPageCount,
                status = BookPageLimitStatus.OVER_MAX,
                message = "선택한 콘텐츠가 ${product.maxPage}페이지를 넘어 다음 단계로 진행할 수 없습니다.",
            )
            rawPageCount < product.minPage -> BookPageRangeResponse(
                minPage = product.minPage,
                maxPage = product.maxPage,
                estimatedPageCount = estimatedPageCount,
                status = BookPageLimitStatus.AVAILABLE,
                message = "선택 콘텐츠가 최소 페이지보다 적어 템플릿 기본 페이지로 보정됩니다.",
            )
            else -> BookPageRangeResponse(
                minPage = product.minPage,
                maxPage = product.maxPage,
                estimatedPageCount = rawPageCount,
                status = BookPageLimitStatus.AVAILABLE,
                message = "선택한 콘텐츠가 상품 페이지 범위 안에 있습니다.",
            )
        }
    }
}
