// DOM Elements
const addBtn = document.getElementById("add-note");
const notesContainer = document.getElementById("notes-container");
const newNoteBtn = document.getElementById("new-note-btn");
const mobileNewNoteBtn = document.getElementById("mobile-new-note");
const closeInputBtn = document.getElementById("close-input");
const themeBtn = document.getElementById("theme-btn");
const noteInputContainer = document.querySelector(".note-input-container");

// states
let notes = JSON.parse(localStorage.getItem("notes")) || [];
let currentEditIndex = null;
let currentTheme = localStorage.getItem("theme") || "light";
let selectedColor = "#ffd5cd";

// init
document.documentElement.setAttribute("data-theme", currentTheme);
themeBtn.innerHTML = currentTheme === "dark" ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

// Colors
const colorOptions = document.querySelectorAll(".color-option");
colorOptions.forEach(option => {
  option.addEventListener("click", () => {
    
    colorOptions.forEach(opt => opt.classList.remove("selected"));

    option.classList.add("selected");
    selectedColor = option.dataset.color;
    
    // Update color picker
    document.getElementById("note-color").value = selectedColor;
  });
});

// first color as default selected
if (colorOptions.length > 0) {
  colorOptions[0].classList.add("selected");
}

// Toggle Note Input (for mobile)
function toggleNoteInput(show) {
  if (show) {
    noteInputContainer.classList.add("visible");
    document.getElementById("note-title").focus();
  } else {
    noteInputContainer.classList.remove("visible");
  }
}

newNoteBtn?.addEventListener("click", () => toggleNoteInput(true));
mobileNewNoteBtn?.addEventListener("click", () => toggleNoteInput(true));
closeInputBtn?.addEventListener("click", () => toggleNoteInput(false));

// Save notes
function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

// Render notes
function renderNotes() {
  notesContainer.innerHTML = "";
  
  if (notes.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state glass-card";
    emptyState.innerHTML = `
      <i class="fas fa-sticky-note"></i>
      <h3>No Notes Yet</h3>
      <p>Create your first note by clicking the + button below</p>
    `;
    notesContainer.appendChild(emptyState);
    return;
  }
  
  notes.forEach((note, index) => {
    const noteEl = document.createElement("div");
    noteEl.className = "note";
    noteEl.style.backgroundColor = note.color || "#ffd5cd";
    noteEl.style.color = getTextColor(note.color || "#ffd5cd");
    noteEl.style.animationDelay = `${index * 0.05}s`;
    
    noteEl.innerHTML = `
      <h3>${note.title}</h3>
      <p>${note.text}</p>
      <div class="note-actions">
        <button class="note-btn edit" onclick="openEditModal(${index}, event)">
          <i class="fas fa-edit"></i>
        </button>
        <button class="note-btn delete" onclick="deleteNote(${index}, event)">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    
    //  click effect
    noteEl.addEventListener("click", (e) => {
      if (!e.target.closest(".note-btn")) {
        noteEl.style.transform = "scale(0.98)";
        setTimeout(() => {
          noteEl.style.transform = "";
        }, 200);
      }
    });
    
    notesContainer.appendChild(noteEl);
  });
}

// Delete note
function deleteNote(index, event) {
  event.stopPropagation();
  
  const noteToDelete = document.querySelectorAll(".note")[index];
  noteToDelete.style.transform = "scale(0.9)";
  noteToDelete.style.opacity = "0";
  
  setTimeout(() => {
    notes.splice(index, 1);
    saveNotes();
    renderNotes();
    
    // Simple confirmation toast without undo
    showToast("Note deleted");
  }, 300);
}

// Add note
addBtn.addEventListener("click", () => {
  const title = document.getElementById("note-title").value.trim();
  const text = document.getElementById("note-text").value.trim();
  const color = selectedColor;

  if (title && text) {
    notes.push({ title, text, color });
    saveNotes();
    renderNotes();
    
    // Reset 
    document.getElementById("note-title").value = "";
    document.getElementById("note-text").value = "";
    selectedColor = "#ffd5cd";
    document.getElementById("note-color").value = selectedColor;
    colorOptions[0].classList.add("selected");
    colorOptions.forEach((opt, i) => i !== 0 && opt.classList.remove("selected"));
    
    // Close input on mobile
    toggleNoteInput(false);
    
    // Show success 
    addBtn.innerHTML = '<i class="fas fa-check"></i><span>Note Added</span>';
    setTimeout(() => {
      addBtn.innerHTML = '<i class="fas fa-paper-plane"></i><span>Send Note</span>';
    }, 1500);
  } else {
    // Shake empty fields
    if (!title) {
      const titleInput = document.getElementById("note-title");
      titleInput.style.animation = "shake 0.5s";
      titleInput.focus();
      setTimeout(() => titleInput.style.animation = "", 500);
    }
    if (!text) {
      const textInput = document.getElementById("note-text");
      textInput.style.animation = "shake 0.5s";
      if (title) textInput.focus();
      setTimeout(() => textInput.style.animation = "", 500);
    }
  }
});

// Modal 
const modal = document.getElementById("edit-modal");
const editTitle = document.getElementById("edit-title");
const editText = document.getElementById("edit-text");
const saveEditBtn = document.getElementById("save-edit");
const cancelEditBtn = document.getElementById("cancel-edit");
const closeModalBtn = document.querySelector(".close-modal");

function openEditModal(index, event) {
  if (event) event.stopPropagation();
  
  currentEditIndex = index;
  editTitle.value = notes[index].title;
  editText.value = notes[index].text;
  selectedColor = notes[index].color || "#ffd5cd";
  
  // Set selected color in modal
  colorOptions.forEach(option => {
    option.classList.remove("selected");
    if (option.dataset.color === selectedColor) {
      option.classList.add("selected");
    }
  });
  
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
  editTitle.focus();
}

function closeEditModal() {
  modal.style.display = "none";
  document.body.style.overflow = "auto";
}

saveEditBtn.addEventListener("click", () => {
  const updatedTitle = editTitle.value.trim();
  const updatedText = editText.value.trim();
  const updatedColor = selectedColor;

  if (updatedTitle && updatedText) {
    notes[currentEditIndex] = {
      title: updatedTitle,
      text: updatedText,
      color: updatedColor
    };
    saveNotes();
    renderNotes();
    closeEditModal();
    
    // Show success 
    saveEditBtn.innerHTML = '<i class="fas fa-check"></i><span>Changes Saved</span>';
    setTimeout(() => {
      saveEditBtn.innerHTML = '<i class="fas fa-save"></i><span>Save Changes</span>';
    }, 1500);
  } else {
    // Shake empty fields
    if (!updatedTitle) {
      editTitle.style.animation = "shake 0.5s";
      editTitle.focus();
      setTimeout(() => editTitle.style.animation = "", 500);
    }
    if (!updatedText) {
      editText.style.animation = "shake 0.5s";
      if (updatedTitle) editText.focus();
      setTimeout(() => editText.style.animation = "", 500);
    }
  }
});

cancelEditBtn.addEventListener("click", closeEditModal);
closeModalBtn.addEventListener("click", closeEditModal);

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeEditModal();
  }
});

// Theme toggle
themeBtn.addEventListener("click", () => {
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  currentTheme = newTheme;
  themeBtn.innerHTML = newTheme === "dark" ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

// Helper function to get appropriate text color based on background
function getTextColor(hex) {
  return '#000000';
}
// Simplified showToast function without action button
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span>${message}</span>`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  renderNotes();
  
  // Keyboard shortcut (Ctrl+Enter to add note)
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      if (modal.style.display === "flex") {
        saveEditBtn.click();
      } else {
        addBtn.click();
      }
    }
  });
  
  // Detect mobile device
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    document.body.classList.add("mobile");
  }
});