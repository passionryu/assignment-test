package com.recordroom.chat.service

import com.recordroom.chat.model.ChatReplyCandidate
import org.springframework.stereotype.Component
import kotlin.random.Random

data class LocalChatReply(
    val senderMemberId: Long,
    val body: String,
)

@Component
class LocalChatReplyGenerator {
    private val replies = listOf(
        "좋아, 이건 나중에 다시 봐도 기억나겠다.",
        "나도 그렇게 생각했어. 기록으로 남겨두자.",
        "오늘 이야기 흐름이 꽤 좋다.",
        "그 부분은 나중에 사진이랑 같이 보면 좋겠어.",
        "응, 이건 우리 방 기록에 남겨도 괜찮겠다.",
        "좋다. 다음에 이어서 더 이야기하자.",
        "그때 분위기가 생각나서 좋네.",
        "나중에 책으로 만들 때 이 대화도 의미 있겠다.",
        "맞아, 오늘 일은 짧게라도 남겨두자.",
        "그 이야기 들으니까 그날이 바로 떠오른다.",
        "좋은데? 다음 기록에도 이어서 적어보자.",
        "나는 이 내용 꽤 마음에 들어.",
        "나중에 같이 다시 읽으면 재밌겠다.",
        "이건 오늘 날짜에 남겨두기 딱 좋다.",
        "좋아, 내가 보기에도 기억할 만한 내용이야.",
        "그럼 이 흐름으로 계속 남겨보자.",
        "짧지만 오늘 느낌이 잘 담겼다.",
        "응, 이건 다른 기록이랑 같이 보면 더 좋겠다.",
        "나중에 정리할 때 중요한 단서가 될 것 같아.",
        "좋아. 다음에 이 이야기 다시 꺼내보자.",
    )

    // GPT 키가 없거나 외부 응답이 실패해도 대화 흐름이 끊기지 않도록 방 구성원의 일반 답장을 만든다.
    fun generateMemberReplies(candidates: List<ChatReplyCandidate>): List<LocalChatReply> {
        if (candidates.isEmpty()) {
            return emptyList()
        }

        val count = Random.nextInt(from = 1, until = 4)

        return (1..count).map {
            val sender = candidates.random()
            LocalChatReply(
                senderMemberId = sender.memberId,
                body = replies.random(),
            )
        }
    }
}
