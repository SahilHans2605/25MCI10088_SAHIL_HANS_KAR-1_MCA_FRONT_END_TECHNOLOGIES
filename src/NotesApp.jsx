import { useState, useRef } from "react";
import "./NotesApp.css";

const initialNotes = [];

export default function NotesApp() {
  const [notes, setNotes] = useState(initialNotes);
  const [editingId, setEditingId] = useState(null);
  const inputRef = useRef(null);

  function handleSubmit() {
    const text = inputRef.current.value.trim();
    if (!text) return;

    if (editingId !== null) {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === editingId ? { ...note, text } : note
        )
      );
      setEditingId(null);
    } else {
      setNotes((prev) => [
        ...prev,
        { id: Date.now(), text, createdAt: new Date().toLocaleTimeString() },
      ]);
    }

    inputRef.current.value = "";
    inputRef.current.focus();
  }

  function handleEdit(note) {
    setEditingId(note.id);
    inputRef.current.value = note.text;
    inputRef.current.focus();
  }

  function handleDelete(id) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (editingId === id) {
      setEditingId(null);
      inputRef.current.value = "";
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape" && editingId !== null) {
      setEditingId(null);
      inputRef.current.value = "";
    }
  }

  return (
    <div className="notes-page">
      <div className="notes-container">
        <header className="notes-header">
          <h1 className="notes-title">Notes</h1>
          <span className="notes-count">{notes.length} note{notes.length !== 1 ? "s" : ""}</span>
        </header>

        {/* Input area */}
        <div className="notes-input-row">
          <input
            ref={inputRef}
            type="text"
            placeholder={editingId ? "Edit your note..." : "Write a note..."}
            onKeyDown={handleKeyDown}
            className={`notes-input${editingId ? " editing" : ""}`}
          />
          <button onClick={handleSubmit} className="notes-submit-btn">
            {editingId ? "Update" : "Submit"}
          </button>
        </div>
        {editingId && (
          <p className="notes-edit-hint">
            Editing note · Press <kbd className="notes-kbd">Esc</kbd> to cancel
          </p>
        )}

        {/* Notes list */}
        <div className="notes-list">
          {notes.length === 0 ? (
            <div className="notes-empty">
              <span className="notes-empty-icon">📋</span>
              <p className="notes-empty-text">No notes yet. Add one above!</p>
            </div>
          ) : (
            notes.map((note, i) => (
              <div
                key={note.id}
                className={`note-card${editingId === note.id ? " editing" : ""}`}
              >
                <div className="note-left">
                  <span className="note-index">{i + 1}</span>
                  <span className="note-text">{note.text}</span>
                </div>
                <div className="note-actions">
                  <span className="note-time">{note.createdAt}</span>
                  <button
                    onClick={() => handleEdit(note)}
                    className="note-edit-btn"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="note-delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}