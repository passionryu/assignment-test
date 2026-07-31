package com.recordroom.member.repository

import com.recordroom.member.model.MemberEntity
import org.springframework.data.jpa.repository.JpaRepository

interface MemberJpaRepository : JpaRepository<MemberEntity, Long> {
    fun findByIdAndDeletedFalse(id: Long): MemberEntity?
}
