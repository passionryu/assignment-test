package com.recordroom.memory.service

import com.recordroom.common.ApiException
import com.recordroom.memory.model.MemoryImageUploadResponse
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
class MemoryImageStorage(
    @Value("\${app.upload.memory-dir:uploads/memories}")
    memoryUploadDir: String,
    @Value("\${app.upload.memory-public-path:/uploads/memories}")
    private val publicPath: String,
) {
    private val log = LoggerFactory.getLogger(MemoryImageStorage::class.java)
    private val uploadRoot: Path = Paths.get(memoryUploadDir).toAbsolutePath().normalize()

    // 일반 사용자가 URL을 직접 입력하지 않도록 선택한 로컬 이미지를 저장 가능한 공개 경로로 변환한다.
    fun storeImageSelectedByMember(memberId: Long, roomId: Long, image: MultipartFile): MemoryImageUploadResponse {
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
                "[추억 이미지 업로드] 이미지 파일 저장 실패. who=memberId:{}, what=MemoryImageStorage.storeImageSelectedByMember, requestData=roomId:{},fileSize:{}, reason={}",
                memberId,
                roomId,
                image.size,
                e.message,
                e,
            )
            throw ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "MEMORY_IMAGE_UPLOAD_FAILED", "이미지를 저장할 수 없습니다.")
        }

        return MemoryImageUploadResponse(
            imageUrl = "${publicPath.trimEnd('/')}/$storedFileName",
            originalFileName = image.originalFilename?.takeIf { it.isNotBlank() } ?: storedFileName,
            size = image.size,
        )
    }

    private fun validateImageFile(memberId: Long, roomId: Long, image: MultipartFile) {
        if (image.isEmpty) {
            badRequest(memberId, roomId, image.size, "MEMORY_IMAGE_REQUIRED", "이미지를 선택해 주세요.")
        }

        if (image.size > MAX_IMAGE_SIZE_BYTES) {
            badRequest(memberId, roomId, image.size, "MEMORY_IMAGE_TOO_LARGE", "이미지는 5MB 이하로 선택해 주세요.")
        }

        val contentType = image.contentType.orEmpty()
        if (!contentType.startsWith("image/")) {
            badRequest(memberId, roomId, image.size, "MEMORY_IMAGE_TYPE_INVALID", "이미지 파일만 업로드할 수 있습니다.")
        }
    }

    private fun readAllowedExtension(memberId: Long, roomId: Long, originalFilename: String?): String {
        val extension = originalFilename
            ?.substringAfterLast('.', missingDelimiterValue = "")
            ?.lowercase()
            ?.takeIf { it.isNotBlank() }
            ?: "jpg"

        if (extension !in ALLOWED_EXTENSIONS) {
            badRequest(memberId, roomId, 0, "MEMORY_IMAGE_EXTENSION_INVALID", "jpg, png, gif, webp 이미지만 업로드할 수 있습니다.")
        }

        return extension
    }

    private fun badRequest(memberId: Long, roomId: Long, fileSize: Long, code: String, message: String): Nothing {
        log.warn(
            "[추억 이미지 업로드] 이미지 요청 값 검증 실패. who=memberId:{}, what=MemoryImageStorage.storeImageSelectedByMember, requestData=roomId:{},fileSize:{}, reason={}",
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
