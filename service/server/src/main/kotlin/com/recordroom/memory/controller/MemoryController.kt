package com.recordroom.memory.controller

import com.recordroom.member.service.CurrentMemberResolver
import com.recordroom.memory.model.CreateMemoryCommentRequest
import com.recordroom.memory.model.CreateMemoryPostRequest
import com.recordroom.memory.model.MemoryCommentResponse
import com.recordroom.memory.model.MemoryPostDetailResponse
import com.recordroom.memory.model.MemoryPostsResponse
import com.recordroom.memory.service.MemoryService
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate

@RestController
@RequestMapping("/api/rooms/{roomId}/memories")
class MemoryController(
    private val currentMemberResolver: CurrentMemberResolver,
    private val memoryService: MemoryService,
) {
    @GetMapping
    fun getPosts(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable roomId: Long,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate?,
    ): MemoryPostsResponse =
        memoryService.getPosts(
            memberId = currentMemberResolver.resolve(rawMemberId),
            roomId = roomId,
            date = date,
        )

    @GetMapping("/{memoryId}")
    fun getPostDetail(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable roomId: Long,
        @PathVariable memoryId: Long,
    ): MemoryPostDetailResponse =
        memoryService.getPostDetail(
            memberId = currentMemberResolver.resolve(rawMemberId),
            roomId = roomId,
            memoryId = memoryId,
        )

    @PostMapping
    fun createPost(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable roomId: Long,
        @RequestBody request: CreateMemoryPostRequest,
    ): MemoryPostDetailResponse =
        memoryService.createPost(
            memberId = currentMemberResolver.resolve(rawMemberId),
            roomId = roomId,
            request = request,
        )

    @PostMapping("/{memoryId}/comments")
    fun createComment(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable roomId: Long,
        @PathVariable memoryId: Long,
        @RequestBody request: CreateMemoryCommentRequest,
    ): MemoryCommentResponse =
        memoryService.createComment(
            memberId = currentMemberResolver.resolve(rawMemberId),
            roomId = roomId,
            memoryId = memoryId,
            request = request,
        )
}
