package com.recordroom.letter.controller

import com.recordroom.letter.model.LetterDetailResponse
import com.recordroom.letter.model.LettersResponse
import com.recordroom.letter.model.SendLetterRequest
import com.recordroom.letter.model.SendLetterResponse
import com.recordroom.letter.service.LetterService
import com.recordroom.member.service.CurrentMemberResolver
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/rooms/{roomId}/letters")
class LetterController(
    private val currentMemberResolver: CurrentMemberResolver,
    private val letterService: LetterService,
) {
    @GetMapping
    fun getLetters(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable roomId: Long,
        @RequestParam(required = false) box: String?,
        @RequestParam(required = false) page: Int?,
        @RequestParam(required = false) size: Int?,
    ): LettersResponse =
        letterService.getLetters(
            memberId = currentMemberResolver.resolve(rawMemberId),
            roomId = roomId,
            rawBox = box,
            rawPage = page,
            rawSize = size,
        )

    @PostMapping
    fun sendLetter(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable roomId: Long,
        @RequestBody request: SendLetterRequest,
    ): SendLetterResponse =
        letterService.sendLetter(
            memberId = currentMemberResolver.resolve(rawMemberId),
            roomId = roomId,
            request = request,
        )

    @GetMapping("/{letterId}")
    fun getLetterDetail(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable roomId: Long,
        @PathVariable letterId: Long,
    ): LetterDetailResponse =
        letterService.getLetterDetail(
            memberId = currentMemberResolver.resolve(rawMemberId),
            roomId = roomId,
            letterId = letterId,
        )
}
