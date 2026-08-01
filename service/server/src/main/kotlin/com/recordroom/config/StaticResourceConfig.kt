package com.recordroom.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import java.nio.file.Files
import java.nio.file.Paths

@Configuration
class StaticResourceConfig(
    @Value("\${app.upload.memory-dir:uploads/memories}")
    private val memoryUploadDir: String,
    @Value("\${app.upload.mission-dir:uploads/missions}")
    private val missionUploadDir: String,
) : WebMvcConfigurer {
    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        val memoryUploadRoot = Paths.get(memoryUploadDir).toAbsolutePath().normalize()
        val missionUploadRoot = Paths.get(missionUploadDir).toAbsolutePath().normalize()
        Files.createDirectories(memoryUploadRoot)
        Files.createDirectories(missionUploadRoot)

        registry.addResourceHandler("/uploads/memories/**")
            .addResourceLocations(memoryUploadRoot.toUri().toString())

        registry.addResourceHandler("/uploads/missions/**")
            .addResourceLocations(missionUploadRoot.toUri().toString())
    }
}
