package com.recordroom.memory.model

import java.time.LocalDate
import java.time.OffsetDateTime

data class MemoryPostsResponse(
    val roomId: Long,
    val roomName: String,
    val posts: List<MemoryPostSummaryResponse>,
)

data class MemoryPostSummaryResponse(
    val id: Long,
    val roomId: Long,
    val authorMemberId: Long,
    val authorName: String,
    val title: String,
    val bodyPreview: String,
    val representativeImageUrl: String?,
    val imageCount: Int,
    val commentCount: Int,
    val occurredDate: LocalDate,
    val createdAt: OffsetDateTime,
    val mine: Boolean,
)

data class MemoryPostDetailResponse(
    val id: Long,
    val roomId: Long,
    val authorMemberId: Long,
    val authorName: String,
    val title: String,
    val body: String,
    val representativeImageUrl: String?,
    val imageCount: Int,
    val commentCount: Int,
    val occurredDate: LocalDate,
    val createdAt: OffsetDateTime,
    val mine: Boolean,
    val comments: List<MemoryCommentResponse>,
)

data class MemoryCommentResponse(
    val id: Long,
    val memoryPostId: Long,
    val authorMemberId: Long,
    val authorName: String,
    val body: String,
    val createdAt: OffsetDateTime,
    val mine: Boolean,
)

data class CreateMemoryPostRequest(
    val title: String?,
    val body: String?,
    val representativeImageUrl: String?,
    val occurredDate: LocalDate?,
)

data class CreateMemoryCommentRequest(
    val body: String?,
)
