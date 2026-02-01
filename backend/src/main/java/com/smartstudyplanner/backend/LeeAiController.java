package com.smartstudyplanner.backend;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/leeai")
@CrossOrigin(origins = "http://localhost:5173")
public class LeeAiController {

    private final ChatClient chatClient;

    public LeeAiController(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @GetMapping("/chat")
    public String chat(@RequestParam String message) {
        return chatClient.prompt()
                .user(message)
                .call()
                .content();
    }
}