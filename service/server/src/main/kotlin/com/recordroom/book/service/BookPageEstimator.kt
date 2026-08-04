package com.recordroom.book.service

import com.recordroom.book.model.BookContentCandidate
import com.recordroom.book.model.BookContentSummaryResponse
import com.recordroom.book.model.BookContentType
import kotlin.math.ceil
import org.springframework.stereotype.Component

@Component
class BookPageEstimator {
    // 콘텐츠 종류별 템플릿 면 수를 계산해 상품 페이지 제한 검증의 입력값으로 사용한다.
    fun estimateContentPage(candidate: BookContentCandidate): Int =
        when (candidate.type) {
            BookContentType.MEMORY -> 2 + ceil(maxOf(candidate.imageCount - 1, 0) / 3.0).toInt() + if (candidate.commentCount >= 6) 1 else 0
            BookContentType.MISSION -> 2 + if (candidate.commentCount >= 5) 1 else 0
            BookContentType.LETTER -> 2
            BookContentType.CHAT -> maxOf(1, ceil(candidate.commentCount / 14.0).toInt())
        }

    // 표지, 시작 글, 목차, 마무리 페이지를 포함한 책 전체 예상 페이지 수를 산출한다.
    fun estimateTotalPage(contents: List<BookContentCandidate>): Int =
        BASE_TEMPLATE_PAGE_COUNT + contents.sumOf { estimateContentPage(it) }

    fun summarize(contents: List<BookContentCandidate>, estimatedPageCount: Int): BookContentSummaryResponse =
        BookContentSummaryResponse(
            memoryCount = contents.count { it.type == BookContentType.MEMORY },
            missionCount = contents.count { it.type == BookContentType.MISSION },
            letterCount = contents.count { it.type == BookContentType.LETTER },
            chatCount = contents.count { it.type == BookContentType.CHAT },
            estimatedPageCount = estimatedPageCount,
        )

    companion object {
        private const val BASE_TEMPLATE_PAGE_COUNT = 4
    }
}
