package com.recordroom.letter.repository

import com.recordroom.calendar.model.LetterEntity
import org.springframework.data.jpa.repository.JpaRepository

interface LetterJpaRepository : JpaRepository<LetterEntity, Long>
