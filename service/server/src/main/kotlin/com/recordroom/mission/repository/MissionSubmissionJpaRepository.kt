package com.recordroom.mission.repository

import com.recordroom.calendar.model.MissionSubmissionEntity
import org.springframework.data.jpa.repository.JpaRepository

interface MissionSubmissionJpaRepository : JpaRepository<MissionSubmissionEntity, Long>
