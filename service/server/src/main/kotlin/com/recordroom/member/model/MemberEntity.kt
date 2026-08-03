package com.recordroom.member.model

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.OffsetDateTime

@Entity
@Table(name = "members")
class MemberEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    var id: Long = 0,

    @Column(name = "display_name", nullable = false, length = 50)
    var displayName: String = "",

    @Column(name = "username", nullable = false, length = 40)
    var username: String = "",

    @Column(name = "email", nullable = false, length = 255)
    var email: String = "",

    @Column(name = "phone_number", nullable = false, length = 30)
    var phoneNumber: String = "",

    @Column(name = "profile_image_url", columnDefinition = "text")
    var profileImageUrl: String? = null,

    @Column(name = "password_hash", nullable = false, length = 255)
    var passwordHash: String = "",

    @Column(name = "is_deleted", nullable = false)
    var deleted: Boolean = false,

    @Column(name = "created_at", nullable = false)
    var createdAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: OffsetDateTime = OffsetDateTime.now(),
)
