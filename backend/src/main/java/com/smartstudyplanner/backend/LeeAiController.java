package com.smartstudyplanner.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leeai")
@CrossOrigin(origins = "http://localhost:5173")
public class LeeAiController {

    private final ChatClient chatClient;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${spring.ai.openai.api-key}")
    private String openAiApiKey;

    // Chat history stored in memory
    private final List<String> history = new ArrayList<>();

    private static final Map<String, String> TOOL_PROMPTS = Map.of(
        "Audio Summary",  "You are an expert content creator. The user will provide text extracted from a document. Generate a clear, engaging audio script (spoken-word narration) that summarizes the SUBJECT MATTER and TOPIC discussed in that document — not the document format. Use a conversational tone, natural pauses, and make it easy to follow by ear. Format with [INTRO], [MAIN POINTS], and [OUTRO] sections.",
        "Video Summary",  "You are an expert video scriptwriter. The user will provide text extracted from a document. Create a storyboard script about the TOPIC and SUBJECT MATTER discussed in that document — not about the document format itself. Use EXACTLY this format:\n\nSCENE: 1\nVISUAL: [what appears on screen]\nNARRATION: [spoken words]\n\nSCENE: 2\n...\n\nCreate 6-10 scenes covering the content.",
        "Concept Map",    "You are an expert educator. The user will provide text extracted from a document. Create a concept map about the TOPIC and SUBJECT MATTER discussed in that document — not about the document format itself. Use EXACTLY this format:\n\nROOT: [main topic]\n  BRANCH: [subtopic 1]\n    NODE: [concept name] | [definition in 6-9 words]\n    NODE: [concept name] | [definition in 6-9 words]\n  BRANCH: [subtopic 2]\n    NODE: [concept name] | [definition in 6-9 words]\n    NODE: [concept name] | [definition in 6-9 words]\n\nUse 2-space indentation. The pipe | separates the concept name from its short definition. Every NODE must include both a name and a definition separated by |.",
        "Study Guide",    "You are an expert tutor. The user will provide text extracted from a document. Create a comprehensive study guide about the SUBJECT MATTER and TOPIC discussed in that document — not about the document format. Include: an overview, key concepts with explanations, important definitions, key formulas or rules (if any), and a summary section. Use clear headings and bullet points.",
        "Flashcards",     "You are an expert educator. The user will provide text extracted from a document. Generate exactly 10 flashcards testing knowledge of the SUBJECT MATTER and TOPIC discussed in that document — not about the document format. Use EXACTLY this format with no extra text:\n\nCARD: 1\nQ: [question]\nA: [answer]\n\nCARD: 2\nQ: [question]\nA: [answer]\n\nContinue through CARD: 10.",
        "Infographic",    "You are an expert infographic designer. The user will provide text extracted from a document. Your job is to create a visual infographic about the SUBJECT MATTER and TOPIC discussed inside that document — not about the document itself, not about its file format, not about PDFs. Focus entirely on what the document is teaching or explaining.\n\nCreate the infographic using EXACTLY this format:\n\nTITLE: [the actual topic or subject of the content, in title case]\nSUBTITLE: [one compelling sentence summarizing what this content covers]\n\nCOLUMN_LEFT: [THE CHALLENGE or THE PROBLEM or THE CONTEXT — whichever fits the subject best, in caps]\nPOINT: [emoji] | [short bold title] | [description in 10-14 words]\nPOINT: [emoji] | [short bold title] | [description in 10-14 words]\nPOINT: [emoji] | [short bold title] | [description in 10-14 words]\n\nCOLUMN_RIGHT: [THE SOLUTION or THE APPROACH or KEY INSIGHTS — whichever fits best, in caps]\nPOINT: [emoji] | [short bold title] | [description in 10-14 words]\nPOINT: [emoji] | [short bold title] | [description in 10-14 words]\nPOINT: [emoji] | [short bold title] | [description in 10-14 words]\n\nSTAT: [metric label from the content] | [specific value, percentage, or key fact from the content]\nSTAT: [metric label] | [specific value, percentage, or key fact]\nSTAT: [metric label] | [specific value, percentage, or key fact]\n\nSECTION: [SECTION HEADING IN CAPS]\n• [concise one-sentence bullet from the content]\n• [concise one-sentence bullet]\n• [concise one-sentence bullet]\n\nSECTION: [SECTION HEADING IN CAPS]\n• [concise one-sentence bullet]\n• [concise one-sentence bullet]\n• [concise one-sentence bullet]\n\nTAKEAWAY: [the single most important insight from the content]\n\nUse relevant emojis for POINT items. Make STATs specific and grounded in the content. Keep all text concise and punchy.",
        "Slide Deck",     "You are an expert presenter. The user will provide text extracted from a document. Create a slide deck about the TOPIC and SUBJECT MATTER discussed in that document — not about the document format. Use EXACTLY this format:\n\nSLIDE: 1\nTITLE: [slide title]\n• [bullet point]\n• [bullet point]\n• [bullet point]\n\nSLIDE: 2\nTITLE: [slide title]\n• [bullet point]\n\nCreate 6-8 slides: title slide, content slides, conclusion.",
        "Key Facts",      "You are an expert educator. The user will provide text extracted from a document. Extract exactly 12 key facts about the SUBJECT MATTER and TOPIC discussed in that document — not facts about the document format, file structure, or PDF metadata. Focus on the actual educational content. Use EXACTLY this format:\n\n1. [fact in one clear sentence]\n2. [fact]\n3. [fact]\n\nContinue through 12. Each fact must be self-contained, specific, and about the document's topic.",
        "Quiz",           "You are an expert quiz maker. The user will provide text extracted from a document. Generate quiz questions about the SUBJECT MATTER and TOPIC discussed in that document — not about the document format or PDF structure."
    );

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

    @PostMapping("/generate")
    public String generate(@RequestBody GenerateRequest request) {
        String toolType = request.getToolType();
        String context = request.getContext();

        // Cap context to ~8000 chars to stay within rate limits
        String safeContext = (context != null && context.length() > 8000)
            ? context.substring(0, 8000) + "\n\n[...content truncated for length...]"
            : context;

        // Build quiz prompt dynamically based on count and type
        String systemPrompt;
        if ("Quiz".equals(toolType)) {
            int count = request.getCount() != null ? request.getCount() : 10;
            String qType = request.getQuestionType() != null ? request.getQuestionType() : "multiple-choice";
            if ("short-answer".equals(qType)) {
                systemPrompt = "You are an expert quiz maker. Generate exactly " + count + " short answer questions. " +
                    "Use EXACTLY this format:\n\nQ: [question text]\nANSWER: [concise answer]\n\nQ: [next question]\nANSWER: [answer]\n\nRepeat for all " + count + " questions.";
            } else {
                systemPrompt = "You are an expert quiz maker. Generate exactly " + count + " multiple choice questions. " +
                    "Use EXACTLY this format:\n\nQ: [question text]\nA) [option]\nB) [option]\nC) [option]\nD) [option]\nCORRECT: [A/B/C/D]\n\nQ: [next question]\n...\n\nRepeat for all " + count + " questions.";
            }
        } else {
            systemPrompt = TOOL_PROMPTS.getOrDefault(toolType,
                "You are an expert educator. Process the following content and generate a helpful " + toolType + ".");
        }

        String userPrompt = (safeContext != null && !safeContext.isBlank())
            ? "Here is the text extracted from the user's document. Generate a " + toolType + " about the subject matter and topics discussed in this text:\n\n" + safeContext
            : "There is no specific content provided. Generate a helpful example " + toolType + " on a general educational topic.";

        String response = chatClient.prompt()
                .system(systemPrompt)
                .user(userPrompt)
                .call()
                .content();

        return response;
    }

    @PostMapping("/audio")
    public ResponseEntity<byte[]> generateAudio(@RequestBody GenerateRequest request) {
        try {
            String context = request.getContext();

            // Step 1: Generate a clean spoken script
            String systemPrompt = "You are an expert narrator. Write a natural, engaging spoken-word summary " +
                "of the following content (2-3 minutes when read aloud, ~400 words max). " +
                "Use plain conversational sentences only — no bullet points, no markdown, no stage directions, " +
                "no text in brackets or parentheses. Just the words to be spoken.";

            // Cap context to ~8000 chars (~2000 tokens) to stay within rate limits
            String safeContext = (context != null && context.length() > 8000)
                ? context.substring(0, 8000) + "\n\n[...content truncated for length...]"
                : context;

            String userPrompt = (safeContext != null && !safeContext.isBlank())
                ? "Summarize this content as a spoken narration:\n\n" + safeContext
                : "Create a short spoken educational summary on an interesting general learning topic.";

            String script = chatClient.prompt()
                    .system(systemPrompt)
                    .user(userPrompt)
                    .call()
                    .content();

            if (script == null || script.isBlank()) {
                return ResponseEntity.internalServerError()
                        .header(HttpHeaders.CONTENT_TYPE, "text/plain")
                        .body("AI returned empty script.".getBytes());
            }

            // Trim to OpenAI TTS 4096-char limit
            if (script.length() > 4000) {
                script = script.substring(0, 4000);
            }

            // Step 2: Call OpenAI TTS API
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + openAiApiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = Map.of(
                "model", "tts-1",
                "input", script,
                "voice", "nova"
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<byte[]> ttsResponse = restTemplate.postForEntity(
                "https://api.openai.com/v1/audio/speech",
                entity,
                byte[].class
            );

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "audio/mpeg")
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"audio-summary.mp3\"")
                    .body(ttsResponse.getBody());

        } catch (HttpStatusCodeException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .header(HttpHeaders.CONTENT_TYPE, "text/plain")
                    .body(("OpenAI error: " + e.getResponseBodyAsString()).getBytes());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header(HttpHeaders.CONTENT_TYPE, "text/plain")
                    .body(("Server error: " + e.getMessage()).getBytes());
        }
    }

    @PostMapping("/video")
    public ResponseEntity<String> generateVideo(@RequestBody GenerateRequest request) {
        try {
            String context = request.getContext();
            String safeContext = (context != null && context.length() > 6000)
                ? context.substring(0, 6000) + "\n\n[...content truncated...]"
                : context;

            // Step 1: Generate 5-slide content as JSON
            String systemPrompt =
                "You are an expert educational video creator. Generate a 5-slide educational video " +
                "presentation about the provided content. " +
                "Respond with ONLY valid JSON — no markdown, no code fences, no explanation. " +
                "Use exactly this structure: " +
                "{\"topic\":\"<title>\",\"slides\":[{\"title\":\"<slide title>\"," +
                "\"bullets\":[\"<point 1>\",\"<point 2>\",\"<point 3>\"]," +
                "\"narration\":\"<2-3 spoken sentences, max 60 words>\"}]} " +
                "Rules: exactly 5 slides, 3-4 bullets per slide, " +
                "first slide is an introduction, last slide is conclusion/key takeaways.";

            String userPrompt = (safeContext != null && !safeContext.isBlank())
                ? "Create an educational video presentation about this content:\n\n" + safeContext
                : "Create an educational video presentation on an interesting general learning topic.";

            String jsonStr = chatClient.prompt()
                    .system(systemPrompt)
                    .user(userPrompt)
                    .call()
                    .content();

            // Strip any accidental markdown code fences
            String cleaned = jsonStr != null ? jsonStr.trim() : "{}";
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replaceAll("(?s)^```[a-z]*\\n?", "").replaceAll("```\\s*$", "").trim();
            }

            // Step 2: Parse and attach per-slide TTS audio
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(cleaned);
            String topic = root.path("topic").asText("Educational Video");
            ArrayNode slidesIn = (ArrayNode) root.path("slides");

            List<Map<String, Object>> slides = new ArrayList<>();
            for (JsonNode slideNode : slidesIn) {
                String title = slideNode.path("title").asText();
                List<String> bullets = new ArrayList<>();
                for (JsonNode b : slideNode.path("bullets")) bullets.add(b.asText());
                String narration = slideNode.path("narration").asText();

                String audioBase64 = callTTS(narration);

                Map<String, Object> slide = new HashMap<>();
                slide.put("title", title);
                slide.put("bullets", bullets);
                slide.put("narration", narration);
                slide.put("audioBase64", audioBase64);
                slides.add(slide);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("topic", topic);
            result.put("slides", slides);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "application/json")
                    .body(mapper.writeValueAsString(result));

        } catch (HttpStatusCodeException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .header(HttpHeaders.CONTENT_TYPE, "text/plain")
                    .body("OpenAI error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header(HttpHeaders.CONTENT_TYPE, "text/plain")
                    .body("Server error: " + e.getMessage());
        }
    }

    private String callTTS(String text) throws Exception {
        if (text == null || text.isBlank()) return "";
        String safeText = text.length() > 4000 ? text.substring(0, 4000) : text;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + openAiApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
            "model", "tts-1",
            "input", safeText,
            "voice", "nova"
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<byte[]> resp = restTemplate.postForEntity(
            "https://api.openai.com/v1/audio/speech",
            entity,
            byte[].class
        );

        return Base64.getEncoder().encodeToString(resp.getBody());
    }
}