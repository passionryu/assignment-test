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
) : WebMvcConfigurer {
    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        val uploadRoot = Paths.get(memoryUploadDir).toAbsolutePath().normalize()
        Files.createDirectories(uploadRoot)

        registry.addResourceHandler("/uploads/memories/**")
            .addResourceLocations(uploadRoot.toUri().toString())
    }
}
