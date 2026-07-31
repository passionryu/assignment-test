package com.recordroom.member

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/members/me")
class MemberController(
    private val currentMemberResolver: CurrentMemberResolver,
    private val memberService: MemberService,
) {
    @GetMapping
    fun getMe(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
    ): MemberProfileResponse =
        memberService.getProfile(currentMemberResolver.resolve(rawMemberId))

    @PatchMapping("/profile")
    fun updateProfile(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @RequestBody request: UpdateProfileRequest,
    ): MemberProfileResponse =
        memberService.updateProfile(currentMemberResolver.resolve(rawMemberId), request)

    @PostMapping("/password")
    fun changePassword(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @RequestBody request: ChangePasswordRequest,
    ): ChangePasswordResponse =
        memberService.changePassword(currentMemberResolver.resolve(rawMemberId), request)

    @GetMapping("/notification-settings")
    fun getNotificationSettings(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
    ): NotificationSettingsResponse =
        memberService.getNotificationSettings(currentMemberResolver.resolve(rawMemberId))

    @PutMapping("/notification-settings")
    fun updateNotificationSettings(
        @RequestHeader("X-Member-Id", required = false) rawMemberId: String?,
        @RequestBody request: UpdateNotificationSettingsRequest,
    ): NotificationSettingsResponse =
        memberService.updateNotificationSettings(currentMemberResolver.resolve(rawMemberId), request)
}
