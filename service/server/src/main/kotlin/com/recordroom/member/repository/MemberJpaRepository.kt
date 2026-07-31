package com.recordroom.member.repository

import com.recordroom.member.model.MemberEntity
import org.springframework.data.jpa.repository.JpaRepository

interface MemberJpaRepository : JpaRepository<MemberEntity, Long> {
    fun findByIdAndDeletedFalse(id: Long): MemberEntity?

    fun findByEmailAndDeletedFalse(email: String): MemberEntity?

    fun findByPhoneNumberAndDeletedFalse(phoneNumber: String): MemberEntity?
}
