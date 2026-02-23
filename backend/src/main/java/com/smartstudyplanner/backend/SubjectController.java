package com.smartstudyplanner.backend;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class SubjectController {

    @GetMapping("/api/subjects")
    public List<String> subjects() {
        return List.of(
                "Math",
                "Physics",
                "Computer Science",
                "SAT Prep"
        );
    }
}