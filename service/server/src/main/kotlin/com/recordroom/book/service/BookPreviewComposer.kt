package com.recordroom.book.service

import com.recordroom.book.model.BookContentCandidateResponse
import com.recordroom.book.model.BookContentType
import com.recordroom.book.model.BookPreviewPageResponse
import org.springframework.stereotype.Component

@Component
class BookPreviewComposer {
    // 실제 PDF 대신 템플릿 바인딩 결과를 대표 페이지 카드로 보여준다.
    fun compose(title: String, contents: List<BookContentCandidateResponse>): List<BookPreviewPageResponse> {
        val contentPages = contents
            .take(REPRESENTATIVE_CONTENT_PAGE_LIMIT)
            .mapIndexed { index, content ->
                BookPreviewPageResponse(
                    pageNumber = index + 3,
                    label = content.sourceLabel,
                    title = content.title,
                    description = content.description,
                    contentType = content.type,
                    occurredDate = content.occurredDate,
                )
            }

        return listOf(
            BookPreviewPageResponse(
                pageNumber = 1,
                label = "표지",
                title = title,
                description = "선택한 방의 기록을 템플릿 표지로 구성합니다.",
                contentType = null,
                occurredDate = null,
            ),
            BookPreviewPageResponse(
                pageNumber = 2,
                label = "목차",
                title = "담은 기록 ${contents.size}개",
                description = contents.groupingBy { it.type }.eachCount().toDescription(),
                contentType = null,
                occurredDate = null,
            ),
        ) + contentPages
    }

    private fun Map<BookContentType, Int>.toDescription(): String =
        listOf(
            "추억 ${this[BookContentType.MEMORY] ?: 0}개",
            "미션 ${this[BookContentType.MISSION] ?: 0}개",
            "편지 ${this[BookContentType.LETTER] ?: 0}개",
            "채팅 ${this[BookContentType.CHAT] ?: 0}일",
        ).joinToString(" · ")

    companion object {
        private const val REPRESENTATIVE_CONTENT_PAGE_LIMIT = 6
    }
}
