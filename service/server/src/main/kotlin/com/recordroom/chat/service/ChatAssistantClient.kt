package com.recordroom.chat.service

import org.slf4j.LoggerFactory
import org.springframework.ai.chat.client.ChatClient
import org.springframework.beans.factory.annotation.Value
import org.springframework.beans.factory.ObjectProvider
import org.springframework.stereotype.Component

@Component
class ChatAssistantClient(
    private val chatClientBuilderProvider: ObjectProvider<ChatClient.Builder>,
    @Value("\${spring.ai.openai.api-key:}") private val apiKey: String,
) {
    private val log = LoggerFactory.getLogger(ChatAssistantClient::class.java)

    // 사용자의 방 대화가 끊기지 않도록 GPT 응답을 생성하고, 외부 API 실패 시 짧은 로컬 응답으로 격리한다.
    fun generateReply(roomName: String, senderName: String, userMessage: String): String {
        if (!hasUsableApiKey()) {
            return fallbackReply(userMessage)
        }

        val chatClient = chatClientBuilderProvider.getIfAvailable()?.build()
            ?: return fallbackReply(userMessage)

        return runCatching {
            chatClient
                .prompt()
                .system(
                    """
                    너는 기록방 서비스의 대화 보조 챗봇이다.
                    사용자가 남긴 채팅에 대해 따뜻하지만 짧게 답한다.
                    사용자의 추억, 미션, 편지 기록을 방해하지 말고 대화를 이어갈 수 있는 한 문장으로 응답한다.
                    최대 80자 이내의 한국어로만 답한다.
                    """.trimIndent(),
                )
                .user(
                    """
                    방 이름: $roomName
                    보낸 사람: $senderName
                    사용자 메시지: $userMessage
                    """.trimIndent(),
                )
                .call()
                .content()
                ?.trim()
                ?.takeIf { it.isNotEmpty() }
                ?: fallbackReply(userMessage)
        }.getOrElse { exception ->
            log.warn(
                "[채팅 AI 응답] GPT 응답 생성 실패. who=system, what=ChatAssistantClient.generateReply, requestData=roomName:{},senderName:{},messageLength:{}, reason={}",
                roomName,
                senderName,
                userMessage.length,
                exception.message ?: "unknown",
            )
            fallbackReply(userMessage)
        }
    }

    private fun fallbackReply(userMessage: String): String =
        when {
            userMessage.contains("사진") -> "좋아요. 이 사진 이야기는 나중에 책에 담기에도 좋겠어요."
            userMessage.contains("편지") -> "편지로 남기면 더 오래 기억될 것 같아요."
            userMessage.contains("미션") -> "미션 기록으로 남겨두면 함께 확인하기 좋겠어요."
            else -> "좋아요. 이 대화도 오늘의 기록으로 남겨둘게요."
        }

    private fun hasUsableApiKey(): Boolean =
        apiKey.isNotBlank() && !apiKey.startsWith("local-missing")
}
