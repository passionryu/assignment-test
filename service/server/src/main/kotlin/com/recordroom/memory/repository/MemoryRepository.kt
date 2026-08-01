package com.recordroom.memory.repository

import com.querydsl.jpa.impl.JPAQueryFactory
import com.recordroom.calendar.model.MemoryPostEntity
import com.recordroom.calendar.model.QMemoryPostEntity.memoryPostEntity
import com.recordroom.member.model.QMemberEntity
import com.recordroom.memory.model.MemoryCommentEntity
import com.recordroom.memory.model.MemoryCommentResponse
import com.recordroom.memory.model.MemoryPostDetailResponse
import com.recordroom.memory.model.MemoryPostSummaryResponse
import com.recordroom.memory.model.QMemoryCommentEntity.memoryCommentEntity
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.time.OffsetDateTime

@Repository
class MemoryRepository(
    private val queryFactory: JPAQueryFactory,
    private val memoryPostJpaRepository: MemoryPostJpaRepository,
    private val memoryCommentJpaRepository: MemoryCommentJpaRepository,
) {
    // 선택 방의 추억 흐름을 카드 목록으로 보여주기 위해 게시글, 작성자, 댓글 수를 함께 조회한다.
    fun findPostSummaries(roomId: Long, memberId: Long, date: LocalDate?): List<MemoryPostSummaryResponse> {
        val author = QMemberEntity("memoryPostAuthor")
        val comment = com.recordroom.memory.model.QMemoryCommentEntity("memoryPostSummaryComment")
        val commentCount = comment.id.count()

        return queryFactory
            .select(
                memoryPostEntity.id,
                memoryPostEntity.roomId,
                memoryPostEntity.authorMemberId,
                author.displayName,
                memoryPostEntity.title,
                memoryPostEntity.body,
                memoryPostEntity.representativeImageUrl,
                memoryPostEntity.imageCount,
                memoryPostEntity.occurredDate,
                memoryPostEntity.createdAt,
                commentCount,
            )
            .from(memoryPostEntity)
            .join(author).on(author.id.eq(memoryPostEntity.authorMemberId))
            .leftJoin(comment).on(
                comment.memoryPostId.eq(memoryPostEntity.id),
                comment.deletedAt.isNull,
            )
            .where(
                memoryPostEntity.roomId.eq(roomId),
                memoryPostEntity.deletedAt.isNull,
                date?.let { memoryPostEntity.occurredDate.eq(it) },
            )
            .groupBy(
                memoryPostEntity.id,
                memoryPostEntity.roomId,
                memoryPostEntity.authorMemberId,
                author.displayName,
                memoryPostEntity.title,
                memoryPostEntity.body,
                memoryPostEntity.representativeImageUrl,
                memoryPostEntity.imageCount,
                memoryPostEntity.occurredDate,
                memoryPostEntity.createdAt,
            )
            .orderBy(memoryPostEntity.occurredDate.desc(), memoryPostEntity.createdAt.desc(), memoryPostEntity.id.desc())
            .fetch()
            .map { row ->
                MemoryPostSummaryResponse(
                    id = row.get(memoryPostEntity.id) ?: 0L,
                    roomId = row.get(memoryPostEntity.roomId) ?: roomId,
                    authorMemberId = row.get(memoryPostEntity.authorMemberId) ?: 0L,
                    authorName = row.get(author.displayName) ?: "",
                    title = row.get(memoryPostEntity.title) ?: "",
                    bodyPreview = preview(row.get(memoryPostEntity.body) ?: ""),
                    representativeImageUrl = row.get(memoryPostEntity.representativeImageUrl),
                    imageCount = row.get(memoryPostEntity.imageCount) ?: 0,
                    commentCount = row.get(commentCount)?.toInt() ?: 0,
                    occurredDate = row.get(memoryPostEntity.occurredDate) ?: LocalDate.now(),
                    createdAt = row.get(memoryPostEntity.createdAt) ?: OffsetDateTime.now(),
                    mine = row.get(memoryPostEntity.authorMemberId) == memberId,
                )
            }
    }

    // 상세 화면에서 같은 방의 단일 추억과 댓글을 한 번에 복원할 수 있도록 게시글과 작성자를 조회한다.
    fun findPostDetail(roomId: Long, postId: Long, memberId: Long): MemoryPostDetailResponse? {
        val author = QMemberEntity("memoryPostDetailAuthor")
        val comment = com.recordroom.memory.model.QMemoryCommentEntity("memoryPostDetailComment")
        val commentCount = comment.id.count()

        val row = queryFactory
            .select(
                memoryPostEntity.id,
                memoryPostEntity.roomId,
                memoryPostEntity.authorMemberId,
                author.displayName,
                memoryPostEntity.title,
                memoryPostEntity.body,
                memoryPostEntity.representativeImageUrl,
                memoryPostEntity.imageCount,
                memoryPostEntity.occurredDate,
                memoryPostEntity.createdAt,
                commentCount,
            )
            .from(memoryPostEntity)
            .join(author).on(author.id.eq(memoryPostEntity.authorMemberId))
            .leftJoin(comment).on(
                comment.memoryPostId.eq(memoryPostEntity.id),
                comment.deletedAt.isNull,
            )
            .where(
                memoryPostEntity.id.eq(postId),
                memoryPostEntity.roomId.eq(roomId),
                memoryPostEntity.deletedAt.isNull,
            )
            .groupBy(
                memoryPostEntity.id,
                memoryPostEntity.roomId,
                memoryPostEntity.authorMemberId,
                author.displayName,
                memoryPostEntity.title,
                memoryPostEntity.body,
                memoryPostEntity.representativeImageUrl,
                memoryPostEntity.imageCount,
                memoryPostEntity.occurredDate,
                memoryPostEntity.createdAt,
            )
            .fetchOne()
            ?: return null

        return MemoryPostDetailResponse(
            id = row.get(memoryPostEntity.id) ?: postId,
            roomId = row.get(memoryPostEntity.roomId) ?: roomId,
            authorMemberId = row.get(memoryPostEntity.authorMemberId) ?: 0L,
            authorName = row.get(author.displayName) ?: "",
            title = row.get(memoryPostEntity.title) ?: "",
            body = row.get(memoryPostEntity.body) ?: "",
            representativeImageUrl = row.get(memoryPostEntity.representativeImageUrl),
            imageCount = row.get(memoryPostEntity.imageCount) ?: 0,
            commentCount = row.get(commentCount)?.toInt() ?: 0,
            occurredDate = row.get(memoryPostEntity.occurredDate) ?: LocalDate.now(),
            createdAt = row.get(memoryPostEntity.createdAt) ?: OffsetDateTime.now(),
            mine = row.get(memoryPostEntity.authorMemberId) == memberId,
            comments = findComments(postId, memberId),
        )
    }

    // 댓글 작성 전 게시글이 실제 선택 방에 속하는지 검증하기 위해 활성 게시글 엔티티를 조회한다.
    fun findActivePost(roomId: Long, postId: Long): MemoryPostEntity? =
        queryFactory
            .selectFrom(memoryPostEntity)
            .where(
                memoryPostEntity.id.eq(postId),
                memoryPostEntity.roomId.eq(roomId),
                memoryPostEntity.deletedAt.isNull,
            )
            .fetchOne()

    // 새 추억 게시글을 즉시 목록과 캘린더에 반영할 수 있도록 저장한다.
    fun savePost(post: MemoryPostEntity): MemoryPostEntity =
        memoryPostJpaRepository.save(post)

    // 새 댓글을 게시글 상세 화면에서 즉시 확인할 수 있도록 저장한다.
    fun saveComment(comment: MemoryCommentEntity): MemoryCommentEntity =
        memoryCommentJpaRepository.save(comment)

    // 게시글 상세 화면에서 댓글 대화를 시간순으로 읽을 수 있게 댓글과 작성자를 함께 조회한다.
    fun findComments(postId: Long, memberId: Long): List<MemoryCommentResponse> {
        val author = QMemberEntity("memoryCommentAuthor")

        return queryFactory
            .select(
                memoryCommentEntity.id,
                memoryCommentEntity.memoryPostId,
                memoryCommentEntity.authorMemberId,
                author.displayName,
                memoryCommentEntity.body,
                memoryCommentEntity.createdAt,
            )
            .from(memoryCommentEntity)
            .join(author).on(author.id.eq(memoryCommentEntity.authorMemberId))
            .where(
                memoryCommentEntity.memoryPostId.eq(postId),
                memoryCommentEntity.deletedAt.isNull,
            )
            .orderBy(memoryCommentEntity.createdAt.asc(), memoryCommentEntity.id.asc())
            .fetch()
            .map { row ->
                MemoryCommentResponse(
                    id = row.get(memoryCommentEntity.id) ?: 0L,
                    memoryPostId = row.get(memoryCommentEntity.memoryPostId) ?: postId,
                    authorMemberId = row.get(memoryCommentEntity.authorMemberId) ?: 0L,
                    authorName = row.get(author.displayName) ?: "",
                    body = row.get(memoryCommentEntity.body) ?: "",
                    createdAt = row.get(memoryCommentEntity.createdAt) ?: OffsetDateTime.now(),
                    mine = row.get(memoryCommentEntity.authorMemberId) == memberId,
                )
            }
    }

    private fun preview(body: String): String =
        if (body.length <= BODY_PREVIEW_LENGTH) body else "${body.take(BODY_PREVIEW_LENGTH)}..."

    companion object {
        private const val BODY_PREVIEW_LENGTH = 80
    }
}
