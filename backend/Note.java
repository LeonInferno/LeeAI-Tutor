package com.smartstudyplanner.backend;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long notebookId;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    public Note() {}

    public Note(Long notebookId, String title, String content) {
        this.notebookId = notebookId;
        this.title = title;
        this.content = content;
    }

    // getters/setters
    public Long getId() { return id; }
    public Long getNotebookId() { return notebookId; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setNotebookId(Long notebookId) { this.notebookId = notebookId; }
    public void setTitle(String title) { this.title = title; }
    public void setContent(String content) { this.content = content; }
}