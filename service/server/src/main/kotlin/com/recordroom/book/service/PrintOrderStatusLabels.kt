package com.recordroom.book.service

import com.recordroom.book.model.PrintOrderStatus

fun PrintOrderStatus.toKoreanLabel(): String =
    when (this) {
        PrintOrderStatus.PAID -> "주문 요청"
        PrintOrderStatus.PDF_READY -> "제작 파일 준비"
        PrintOrderStatus.CONFIRMED -> "주문 확정"
        PrintOrderStatus.IN_PRODUCTION -> "제작 중"
        PrintOrderStatus.PRODUCTION_COMPLETE -> "제작 완료"
        PrintOrderStatus.SHIPPED -> "배송 중"
        PrintOrderStatus.DELIVERED -> "배송 완료"
        PrintOrderStatus.CANCELLED_REFUND -> "취소/환불"
        PrintOrderStatus.ERROR -> "오류"
    }
