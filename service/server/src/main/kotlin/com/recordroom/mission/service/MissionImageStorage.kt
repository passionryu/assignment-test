package com.recordroom.mission.service

import com.recordroom.common.ApiException
import com.recordroom.mission.model.MissionImageUploadResponse
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption
import java.util.UUID

@Component
class MissionImageStorage(
    @Value("\${app.upload.mission-dir:uploads/missions}")
    missionUploadDir: String,
    @Value("\${app.upload.mission-public-path:/uploads/missions}")
    private val publicPath: String,
) {
    private val log = LoggerFactory.getLogger(MissionImageStorage::class.java)
    private val uploadRoot: Path = Paths.get(missionUploadDir).toAbsolutePath().normalize()

    // 미션은 사진 인증이 필수이므로 사용자가 선택한 파일을 공개 이미지 경로로 저장한다.
    fun storeMissionProofImage(memberId: Long, roomId: Long, image: MultipartFile): MissionImageUploadResponse {
        validateImageFile(memberId, roomId, image)

        val extension = readAllowedExtension(memberId, roomId, image.originalFilename)
        val storedFileName = "${UUID.randomUUID()}.$extension"
        val targetPath = uploadRoot.resolve(storedFileName).normalize()

        try {
            Files.createDirectories(uploadRoot)
            image.inputStream.use { input ->
                Files.copy(input, targetPath, StandardCopyOption.REPLACE_EXISTING)
            }
        } catch (e: Exception) {
            log.error(
                "[미션 인증 이미지 업로드] 이미지 파일 저장 실패. who=memberId:{}, what=MissionImageStorage.storeMissionProofImage, requestData=roomId:{},fileSize:{}, reason={}",
                memberId,
                roomId,
                image.size,
                e.message,
                e,
            )
            throw ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "MISSION_IMAGE_UPLOAD_FAILED", "이미지를 저장할 수 없습니다.")
        }

        return MissionImageUploadResponse(
            imageUrl = "${publicPath.trimEnd('/')}/$storedFileName",
            originalFileName = image.originalFilename?.takeIf { it.isNotBlank() } ?: storedFileName,
            size = image.size,
        )
    }

    private fun validateImageFile(memberId: Long, roomId: Long, image: MultipartFile) {
        if (image.isEmpty) {
            badRequest(memberId, roomId, image.size, "MISSION_IMAGE_REQUIRED", "미션 인증 사진을 선택해 주세요.")
        }

        if (image.size > MAX_IMAGE_SIZE_BYTES) {
            badRequest(memberId, roomId, image.size, "MISSION_IMAGE_TOO_LARGE", "이미지는 5MB 이하로 선택해 주세요.")
        }

        val contentType = image.contentType.orEmpty()
        if (!contentType.startsWith("image/")) {
            badRequest(memberId, roomId, image.size, "MISSION_IMAGE_TYPE_INVALID", "이미지 파일만 업로드할 수 있습니다.")
        }
    }

    private fun readAllowedExtension(memberId: Long, roomId: Long, originalFilename: String?): String {
        val extension = originalFilename
            ?.substringAfterLast('.', missingDelimiterValue = "")
            ?.lowercase()
            ?.takeIf { it.isNotBlank() }
            ?: "jpg"

        if (extension !in ALLOWED_EXTENSIONS) {
            badRequest(memberId, roomId, 0, "MISSION_IMAGE_EXTENSION_INVALID", "jpg, png, gif, webp 이미지만 업로드할 수 있습니다.")
        }

        return extension
    }

    private fun badRequest(memberId: Long, roomId: Long, fileSize: Long, code: String, message: String): Nothing {
        log.warn(
            "[미션 인증 이미지 업로드] 이미지 요청 값 검증 실패. who=memberId:{}, what=MissionImageStorage.storeMissionProofImage, requestData=roomId:{},fileSize:{}, reason={}",
            memberId,
            roomId,
            fileSize,
            code,
        )
        throw ApiException(HttpStatus.BAD_REQUEST, code, message)
    }

    companion object {
        private const val MAX_IMAGE_SIZE_BYTES = 5L * 1024L * 1024L
        private val ALLOWED_EXTENSIONS = setOf("jpg", "jpeg", "png", "gif", "webp")
    }
}
