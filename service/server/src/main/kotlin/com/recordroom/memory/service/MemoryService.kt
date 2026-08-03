package com.recordroom.memory.service

import com.recordroom.calendar.model.MemoryPostEntity
import com.recordroom.common.ApiException
import com.recordroom.member.service.MemberService
import com.recordroom.memory.model.CreateMemoryCommentRequest
import com.recordroom.memory.model.CreateMemoryPostRequest
import com.recordroom.memory.model.DeleteMemoryPostResponse
import com.recordroom.memory.model.MemoryCommentEntity
import com.recordroom.memory.model.MemoryCommentResponse
import com.recordroom.memory.model.MemoryImageUploadResponse
import com.recordroom.memory.model.MemoryPostDetailResponse
import com.recordroom.memory.model.MemoryPostsResponse
import com.recordroom.memory.model.UpdateMemoryPostRequest
import com.recordroom.memory.repository.MemoryRepository
import com.recordroom.notification.model.NotificationEntity
import com.recordroom.notification.repository.NotificationRepository
import com.recordroom.room.model.RoomEntity
import com.recordroom.room.repository.RoomRepository
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDate
import java.time.OffsetDateTime
import java.time.ZoneId

@Service
@Transactional(readOnly = true)
class MemoryService(
    private val memberService: MemberService,
    private val roomRepository: RoomRepository,
    private val memoryRepository: MemoryRepository,
    private val memoryImageStorage: MemoryImageStorage,
    private val notificationRepository: NotificationRepository,
) {
    private val log = LoggerFactory.getLogger(MemoryService::class.java)
    private val seoulZone = ZoneId.of("Asia/Seoul")

    fun getPosts(memberId: Long, roomId: Long, date: LocalDate?): MemoryPostsResponse {
        memberService.getProfile(memberId)

        val room = readRoomJoinedByMember(memberId, roomId, "GET /api/rooms/$roomId/memories")
        val posts = memoryRepository.findPostSummaries(roomId, memberId, date)

        return MemoryPostsResponse(
            roomId = room.id,
            roomName = room.name,
            posts = posts,
        )
    }

    fun getPostDetail(memberId: Long, roomId: Long, memoryId: Long): MemoryPostDetailResponse {
        memberService.getProfile(memberId)

        readRoomJoinedByMember(memberId, roomId, "GET /api/rooms/$roomId/memories/$memoryId")

        return readPostDetail(memberId, roomId, memoryId, "GET /api/rooms/$roomId/memories/$memoryId")
    }

    @Transactional
    fun createPost(memberId: Long, roomId: Long, request: CreateMemoryPostRequest): MemoryPostDetailResponse {
        val author = memberService.getProfile(memberId)

        val room = readRoomJoinedByMember(memberId, roomId, "POST /api/rooms/$roomId/memories")
        val title = validateTitle(memberId, roomId, "POST /api/rooms/$roomId/memories", request.title)
        val body = validateBody(memberId, roomId, "POST /api/rooms/$roomId/memories", request.body)
        val imageUrl = validateImageUrl(memberId, roomId, "POST /api/rooms/$roomId/memories", request.representativeImageUrl)
        val now = OffsetDateTime.now(seoulZone)

        val savedPost = memoryRepository.savePost(
            MemoryPostEntity(
                roomId = roomId,
                authorMemberId = memberId,
                title = title,
                body = body,
                representativeImageUrl = imageUrl,
                imageCount = if (imageUrl == null) 0 else 1,
                occurredDate = request.occurredDate ?: now.toLocalDate(),
                createdAt = now,
                updatedAt = now,
            ),
        )

        createMemoryPostNotifications(
            authorMemberId = memberId,
            authorName = author.displayName,
            room = room,
            memoryPostId = savedPost.id,
            occurredAt = now,
        )

        return readPostDetail(memberId, roomId, savedPost.id, "MemoryService.createPost")
    }

    @Transactional
    fun updatePost(
        memberId: Long,
        roomId: Long,
        memoryId: Long,
        request: UpdateMemoryPostRequest,
    ): MemoryPostDetailResponse {
        memberService.getProfile(memberId)

        readRoomJoinedByMember(memberId, roomId, "PATCH /api/rooms/$roomId/memories/$memoryId")
        val post = readActivePost(memberId, roomId, memoryId, "PATCH /api/rooms/$roomId/memories/$memoryId")
        validateMemberOwnsMemoryPost(memberId, roomId, post, "PATCH /api/rooms/$roomId/memories/$memoryId")

        val title = validateTitle(memberId, roomId, "PATCH /api/rooms/$roomId/memories/$memoryId", request.title)
        val body = validateBody(memberId, roomId, "PATCH /api/rooms/$roomId/memories/$memoryId", request.body)
        val imageUrl = validateImageUrl(memberId, roomId, "PATCH /api/rooms/$roomId/memories/$memoryId", request.representativeImageUrl)

        post.title = title
        post.body = body
        post.representativeImageUrl = imageUrl
        post.imageCount = if (imageUrl == null) 0 else 1
        post.occurredDate = request.occurredDate ?: post.occurredDate
        post.updatedAt = OffsetDateTime.now(seoulZone)
        memoryRepository.savePost(post)

        return readPostDetail(memberId, roomId, memoryId, "MemoryService.updatePost")
    }

    @Transactional
    fun deletePost(memberId: Long, roomId: Long, memoryId: Long): DeleteMemoryPostResponse {
        memberService.getProfile(memberId)

        readRoomJoinedByMember(memberId, roomId, "DELETE /api/rooms/$roomId/memories/$memoryId")
        val post = readActivePost(memberId, roomId, memoryId, "DELETE /api/rooms/$roomId/memories/$memoryId")
        validateMemberOwnsMemoryPost(memberId, roomId, post, "DELETE /api/rooms/$roomId/memories/$memoryId")

        val now = OffsetDateTime.now(seoulZone)
        post.deletedAt = now
        post.updatedAt = now
        memoryRepository.savePost(post)

        return DeleteMemoryPostResponse(id = memoryId, deleted = true)
    }

    fun uploadImage(memberId: Long, roomId: Long, image: MultipartFile): MemoryImageUploadResponse {
        memberService.getProfile(memberId)

        readRoomJoinedByMember(memberId, roomId, "POST /api/rooms/$roomId/memories/images")

        return memoryImageStorage.storeImageSelectedByMember(memberId, roomId, image)
    }

    @Transactional
    fun createComment(
        memberId: Long,
        roomId: Long,
        memoryId: Long,
        request: CreateMemoryCommentRequest,
    ): MemoryCommentResponse {
        memberService.getProfile(memberId)

        readRoomJoinedByMember(memberId, roomId, "POST /api/rooms/$roomId/memories/$memoryId/comments")
        readActivePost(memberId, roomId, memoryId, "POST /api/rooms/$roomId/memories/$memoryId/comments")
        val body = validateCommentBody(memberId, roomId, memoryId, request.body)
        val now = OffsetDateTime.now(seoulZone)

        val comment = memoryRepository.saveComment(
            MemoryCommentEntity(
                memoryPostId = memoryId,
                authorMemberId = memberId,
                body = body,
                createdAt = now,
            ),
        )

        return memoryRepository.findComments(memoryId, memberId)
            .firstOrNull { it.id == comment.id }
            ?: MemoryCommentResponse(
                id = comment.id,
                memoryPostId = memoryId,
                authorMemberId = memberId,
                authorName = "",
                body = comment.body,
                createdAt = comment.createdAt,
                mine = true,
            )
    }

    private fun readRoomJoinedByMember(memberId: Long, roomId: Long, what: String): RoomEntity {
        val room = roomRepository.findActiveRoom(roomId) ?: run {
            log.warn(
                "[추억 게시판] 방 조회 실패. who=memberId:{}, what={}, requestData=roomId:{}, reason=room_not_found",
                memberId,
                what,
                roomId,
            )
            throw ApiException(HttpStatus.NOT_FOUND, "ROOM_NOT_FOUND", "방을 찾을 수 없습니다.")
        }

        if (roomRepository.findActiveRoomMember(roomId, memberId) == null) {
            log.warn(
                "[추억 게시판] 방 접근 권한 검증 실패. who=memberId:{}, what={}, requestData=roomId:{}, reason=member_not_joined_room",
                memberId,
                what,
                roomId,
            )
            throw ApiException(HttpStatus.FORBIDDEN, "ROOM_ACCESS_DENIED", "참여 중인 방의 추억만 볼 수 있습니다.")
        }

        return room
    }

    private fun readPostDetail(memberId: Long, roomId: Long, memoryId: Long, what: String): MemoryPostDetailResponse =
        memoryRepository.findPostDetail(roomId, memoryId, memberId) ?: postNotFound(memberId, roomId, memoryId, what)

    private fun readActivePost(memberId: Long, roomId: Long, memoryId: Long, what: String): MemoryPostEntity =
        memoryRepository.findActivePost(roomId, memoryId) ?: postNotFound(memberId, roomId, memoryId, what)

    // 새 추억은 작성자를 제외한 방 구성원에게 확인 대상이므로 추억 알림을 남긴다.
    private fun createMemoryPostNotifications(
        authorMemberId: Long,
        authorName: String,
        room: RoomEntity,
        memoryPostId: Long,
        occurredAt: OffsetDateTime,
    ) {
        val notifications = roomRepository.findActiveRoomMembers(room.id)
            .filter { roomMember -> roomMember.memberId != authorMemberId }
            .map { roomMember ->
                NotificationEntity(
                    receiverMemberId = roomMember.memberId,
                    roomId = room.id,
                    actorMemberId = authorMemberId,
                    type = NotificationRepository.MEMORY_NOTIFICATION_TYPE,
                    title = "새 추억",
                    message = "${authorName}님이 새 추억을 올렸습니다.",
                    targetType = "MEMORY",
                    targetId = memoryPostId,
                    occurredDate = occurredAt.toLocalDate(),
                    createdAt = occurredAt,
                )
            }

        if (notifications.isNotEmpty()) {
            notificationRepository.saveAll(notifications)
        }
    }

    private fun validateMemberOwnsMemoryPost(memberId: Long, roomId: Long, post: MemoryPostEntity, what: String) {
        if (post.authorMemberId == memberId) return

        log.warn(
            "[추억 게시글] 작성자 권한 검증 실패. who=memberId:{}, what={}, requestData=roomId:{},memoryId:{},authorMemberId:{}, reason=memory_post_owner_required",
            memberId,
            what,
            roomId,
            post.id,
            post.authorMemberId,
        )
        throw ApiException(HttpStatus.FORBIDDEN, "MEMORY_POST_OWNER_REQUIRED", "작성자만 추억 게시글을 수정하거나 삭제할 수 있습니다.")
    }

    private fun validateTitle(memberId: Long, roomId: Long, what: String, rawTitle: String?): String {
        val title = rawTitle?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: badRequest(memberId, roomId, what, "title:null", "제목을 입력해 주세요.", "MEMORY_TITLE_REQUIRED")

        if (title.length > MAX_TITLE_LENGTH) {
            badRequest(memberId, roomId, what, "title:length:${title.length}", "제목은 120자 이하로 입력해 주세요.", "MEMORY_TITLE_TOO_LONG")
        }

        return title
    }

    private fun validateBody(memberId: Long, roomId: Long, what: String, rawBody: String?): String {
        val body = rawBody?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: badRequest(memberId, roomId, what, "body:null", "추억 내용을 입력해 주세요.", "MEMORY_BODY_REQUIRED")

        if (body.length > MAX_BODY_LENGTH) {
            badRequest(memberId, roomId, what, "body:length:${body.length}", "추억 내용은 2000자 이하로 입력해 주세요.", "MEMORY_BODY_TOO_LONG")
        }

        return body
    }

    private fun validateImageUrl(memberId: Long, roomId: Long, what: String, rawImageUrl: String?): String? {
        val imageUrl = rawImageUrl?.trim()?.takeIf { it.isNotEmpty() } ?: return null

        if (imageUrl.length > MAX_IMAGE_URL_LENGTH) {
            badRequest(memberId, roomId, what, "representativeImageUrl:length:${imageUrl.length}", "이미지 URL은 500자 이하로 입력해 주세요.", "MEMORY_IMAGE_URL_TOO_LONG")
        }
        if (!imageUrl.startsWith("https://") && !imageUrl.startsWith("http://") && !imageUrl.startsWith("/")) {
            badRequest(memberId, roomId, what, "representativeImageUrl:invalid_scheme", "이미지 URL 형식이 올바르지 않습니다.", "MEMORY_IMAGE_URL_INVALID")
        }

        return imageUrl
    }

    private fun validateCommentBody(memberId: Long, roomId: Long, memoryId: Long, rawBody: String?): String {
        val body = rawBody?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: badRequest(
                memberId,
                roomId,
                "POST /api/rooms/$roomId/memories/$memoryId/comments",
                "memoryId:$memoryId,body:null",
                "댓글을 입력해 주세요.",
                "MEMORY_COMMENT_REQUIRED",
            )

        if (body.length > MAX_COMMENT_LENGTH) {
            badRequest(
                memberId,
                roomId,
                "POST /api/rooms/$roomId/memories/$memoryId/comments",
                "memoryId:$memoryId,body:length:${body.length}",
                "댓글은 500자 이하로 입력해 주세요.",
                "MEMORY_COMMENT_TOO_LONG",
            )
        }

        return body
    }

    private fun postNotFound(memberId: Long, roomId: Long, memoryId: Long, what: String): Nothing {
        log.warn(
            "[추억 게시글] 게시글 조회 실패. who=memberId:{}, what={}, requestData=roomId:{},memoryId:{}, reason=memory_post_not_found",
            memberId,
            what,
            roomId,
            memoryId,
        )
        throw ApiException(HttpStatus.NOT_FOUND, "MEMORY_POST_NOT_FOUND", "추억 게시글을 찾을 수 없습니다.")
    }

    private fun badRequest(memberId: Long, roomId: Long, what: String, requestData: String, message: String, code: String): Nothing {
        log.warn(
            "[추억 게시판] 요청 값 검증 실패. who=memberId:{}, what={}, requestData=roomId:{},{}, reason={}",
            memberId,
            what,
            roomId,
            requestData,
            code,
        )
        throw ApiException(HttpStatus.BAD_REQUEST, code, message)
    }

    companion object {
        private const val MAX_TITLE_LENGTH = 120
        private const val MAX_BODY_LENGTH = 2000
        private const val MAX_COMMENT_LENGTH = 500
        private const val MAX_IMAGE_URL_LENGTH = 500
    }
}
