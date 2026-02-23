package com.smartstudyplanner.backend;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/leeai")
@CrossOrigin(origins = "http://localhost:5173")
public class LeeAiController {

    private final ChatClient chatClient;

    // Chat history stored in memory
    private final List<String> history = new ArrayList<>();

    public LeeAiController(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @GetMapping("/chat")
    public String chat(@RequestParam String message) {

        // Save user message
        history.add("User: " + message);

        // Combine history into one prompt
        String fullPrompt = String.join("\n", history)
                + "\nAI Tutor: ";

        // Get AI response
        String response = chatClient.prompt(fullPrompt)
                .call()
                .content();

        // Save AI response
        history.add("AI Tutor: " + response);

        return response;
    }
}