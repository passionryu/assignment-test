package com.recordroom.mission.repository

import com.recordroom.calendar.model.MissionEntity
import org.springframework.data.jpa.repository.JpaRepository

interface MissionJpaRepository : JpaRepository<MissionEntity, Long>
