package com.recordroom.mission.repository

import com.recordroom.mission.model.MissionCommentEntity
import org.springframework.data.jpa.repository.JpaRepository

interface MissionCommentJpaRepository : JpaRepository<MissionCommentEntity, Long>
