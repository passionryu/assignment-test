package com.recordroom.room.service

import com.recordroom.common.ApiException
import com.recordroom.room.repository.RoomRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@Transactional
class RoomServiceTest @Autowired constructor(
    private val roomService: RoomService,
    private val roomRepository: RoomRepository,
) {
    @Test
    fun `member can leave joined room`() {
        val response = roomService.leaveRoom(memberId = 1L, roomId = 4L)

        assertEquals(4L, response.id)
        assertEquals(true, response.left)
        assertNotNull(roomRepository.findActiveRoom(roomId = 4L))
        assertEquals(null, roomRepository.findActiveRoomMember(roomId = 4L, memberId = 1L))
    }

    @Test
    fun `owner cannot leave room`() {
        val exception = assertThrows(ApiException::class.java) {
            roomService.leaveRoom(memberId = 2L, roomId = 4L)
        }

        assertEquals("ROOM_OWNER_MUST_DELETE_ROOM", exception.code)
    }
}
