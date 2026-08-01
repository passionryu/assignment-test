package com.recordroom.letter.controller

import com.recordroom.letter.model.LetterDetailResponse
import com.recordroom.letter.model.LettersResponse
import com.recordroom.letter.model.SendLetterRequest
import com.recordroom.letter.model.SendLetterResponse
import com.recordroom.letter.service.LetterService
import com.recordroom.member.service.CurrentMemberResolver
import io.swagger.v3.oas.annotations.Operation
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
    @Operation(summary = "편지 목록 조회", description = "선택 방의 받은 편지함 또는 보낸 편지함을 조회한다.")
    @GetMapping
    fun getLetters(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @PathVariable roomId: Long,
        @RequestParam(required = false) box: String?,
    ): LettersResponse =
        letterService.getLetters(
            memberId = currentMemberResolver.resolve(rawMemberId),
            roomId = roomId,
            rawBox = box,
        )

    @Operation(summary = "편지 작성", description = "같은 방 구성원에게 편지를 보내고 수신자에게 알림을 생성한다.")
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

    @Operation(summary = "편지 상세 조회", description = "선택 편지 상세를 조회한다. 받은 편지는 상세 조회 시 읽음 처리한다.")
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
