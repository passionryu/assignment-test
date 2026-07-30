package com.recordroom

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class RecordRoomApplication

fun main(args: Array<String>) {
    runApplication<RecordRoomApplication>(*args)
}
