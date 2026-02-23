package com.smartstudyplanner.backend;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notebooks")
@CrossOrigin(origins = "http://localhost:5173") // Vite default
public class NotebookController {

    private final NotebookRepository notebooks;
    private final NoteRepository notes;

    public NotebookController(NotebookRepository notebooks, NoteRepository notes) {
        this.notebooks = notebooks;
        this.notes = notes;
    }

    // --- Notebooks ---
    @GetMapping
    public List<Notebook> listNotebooks() {
        return notebooks.findAll();
    }

    @PostMapping
    public Notebook createNotebook(@RequestBody Notebook n) {
        return notebooks.save(new Notebook(n.getTitle(), n.getDescription()));
    }

    @GetMapping("/{id}")
    public Notebook getNotebook(@PathVariable Long id) {
        return notebooks.findById(id).orElseThrow();
    }

    // --- Notes ---
    @GetMapping("/{id}/notes")
    public List<Note> listNotes(@PathVariable Long id) {
        return notes.findByNotebookId(id);
    }

    @PostMapping("/{id}/notes")
    public Note createNote(@PathVariable Long id, @RequestBody Note note) {
        return notes.save(new Note(id, note.getTitle(), note.getContent()));
    }
}