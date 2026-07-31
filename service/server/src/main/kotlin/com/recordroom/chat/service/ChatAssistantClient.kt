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

    // GPT 키가 준비된 경우에만 외부 응답을 만들고, 실패하면 로컬 구성원 응답으로 넘기기 위해 null을 반환한다.
    fun generateReplyOrNull(roomName: String, senderName: String, userMessage: String): String? {
        if (!hasUsableApiKey()) {
            return null
        }

        val chatClient = chatClientBuilderProvider.getIfAvailable()?.build()
            ?: return null

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
        }.getOrElse { exception ->
            log.warn(
                "[채팅 AI 응답] GPT 응답 생성 실패. who=system, what=ChatAssistantClient.generateReply, requestData=roomName:{},senderName:{},messageLength:{}, reason={}",
                roomName,
                senderName,
                userMessage.length,
                exception.message ?: "unknown",
            )
            null
        }
    }

    private fun hasUsableApiKey(): Boolean =
        apiKey.isNotBlank() && !apiKey.startsWith("local-missing")
}
