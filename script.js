let notes = JSON.parse(localStorage.getItem('notes')) || [];
let isEditing = false;
let editingIndex = null;
let searchTimeout = null;
let isNotesVisible = true;

function displayNotes(filteredNotes = notes) {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const notesList = document.getElementById('notesList');
    notesList.style.display = 'block';
    isNotesVisible = true;
    document.getElementById('showHideBtn').innerText = 'Hide Notes';
    notesList.innerHTML = '';
    filteredNotes.forEach((note, index) => {
        let highlightedText = note.text.replace(new RegExp(searchText, 'gi'), match => `<mark>${match}</mark>`);
        let noteDiv = document.createElement('div');
        noteDiv.className = `note ${note.color} slide-in`;
        noteDiv.innerHTML = `
            <p>${highlightedText}</p>
            <div class="timestamp">🕒 ${note.timestamp}</div>
            <div style="font-size:12px;">Color Tag: ${note.color}</div>
            <button onclick="editNote(${index})">Edit</button>
            <button onclick="deleteNote(${index})">Delete</button>
            <button onclick="downloadSingleNote(${index})">Download</button>
        `;
        notesList.appendChild(noteDiv);
    });
}

function toggleShowHideNotes() {
    const notesList = document.getElementById('notesList');
    const toggleBtn = document.getElementById('showHideBtn');
    if (isNotesVisible) {
        notesList.style.display = 'none';
        toggleBtn.innerText = 'Show Saved Notes';
        isNotesVisible = false;
    } else {
        notesList.style.display = 'block';
        displayNotes();
        toggleBtn.innerText = 'Hide Notes';
        isNotesVisible = true;
    }
}

function showNoteArea() {
    document.getElementById('noteInput').disabled = false;
    document.getElementById('noteInput').value = '';
    document.getElementById('charCount').style.display = 'block';
    document.getElementById('colorSelect').style.display = 'block';
    document.getElementById('showNoteAreaBtn').style.display = 'none';
    document.getElementById('saveNoteBtn').style.display = 'inline-block';
    updateCharCount();
}

function updateCharCount() {
    document.getElementById('charCount').innerText = "Characters: " + document.getElementById('noteInput').value.length;
}

document.getElementById('noteInput').addEventListener('input', updateCharCount);

function addOrUpdateNote() {
    const text = document.getElementById('noteInput').value.trim();
    const color = document.getElementById('colorSelect').value;
    if (text !== '') {
        let timestamp = new Date().toLocaleString();
        let noteObj = { text, timestamp, color };
        if (isEditing) {
            notes[editingIndex] = noteObj;
            isEditing = false;
            editingIndex = null;
        } else {
            notes.push(noteObj);
        }
        localStorage.setItem('notes', JSON.stringify(notes));
        resetInputArea();
        displayNotes();
        alert("✅ Note saved!");
    }
}

function resetInputArea() {
    document.getElementById('noteInput').disabled = true;
    document.getElementById('noteInput').value = '';
    document.getElementById('charCount').style.display = 'none';
    document.getElementById('colorSelect').style.display = 'none';
    document.getElementById('saveNoteBtn').style.display = 'none';
    document.getElementById('showNoteAreaBtn').style.display = 'inline-block';
}

function deleteNote(index) {
    const noteElements = document.querySelectorAll('.note');
    if (noteElements[index]) {
        noteElements[index].style.opacity = '0';
        setTimeout(() => {
            notes.splice(index, 1);
            localStorage.setItem('notes', JSON.stringify(notes));
            displayNotes();
        }, 500);
    }
}

function editNote(index) {
    document.getElementById('noteInput').value = notes[index].text;
    document.getElementById('colorSelect').value = notes[index].color;
    isEditing = true;
    editingIndex = index;
    showNoteArea();
}

function toggleDarkMode() {
    const btn = document.getElementById('darkModeToggle');
    document.body.classList.toggle('dark-mode');
    btn.style.transform = 'rotate(180deg)';
    btn.style.opacity = '0';
    setTimeout(() => {
        const isDark = document.body.classList.contains('dark-mode');
        btn.innerHTML = isDark ? '🌞' : '🌙';
        btn.style.transform = 'rotate(0deg)';
        btn.style.opacity = '1';
        localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
    }, 300);
}

function clearAllNotes() {
    if (confirm("Delete all notes?")) {
        notes = [];
        localStorage.setItem('notes', JSON.stringify(notes));
        displayNotes();
    }
}

function debouncedSearch() {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(searchNotes, 300);
}

function searchNotes() {
    let text = document.getElementById('searchInput').value.toLowerCase();
    let filtered = notes.filter(n => n.text.toLowerCase().includes(text));
    displayNotes(filtered);
    document.getElementById('showAllBtnWrapper').style.display = 'block';
    if (filtered.length === 0) alert("No matching notes found!");
}

function showAllNotes() {
    document.getElementById('searchInput').value = '';
    displayNotes();
    document.getElementById('showAllBtnWrapper').style.display = 'none';
}

function sortNotes(type) {
    if (type === 'alpha') notes.sort((a, b) => a.text.localeCompare(b.text));
    else notes.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();
    document.getElementById('sortDropdown').classList.remove('show');
}

function toggleDropdown() {
    document.getElementById("sortDropdown").classList.toggle("show");
}

window.onclick = function (event) {
    if (!event.target.closest('#sortToggleBtn') && !event.target.closest('#sortDropdown')) {
        document.getElementById('sortDropdown').classList.remove('show');
    }
};

function downloadSingleNote(index) {
    let note = notes[index];
    let content = `[${note.timestamp}] (${note.color})\n${note.text}`;
    let blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Note_${index + 1}.txt`;
    a.click();
}

function downloadAllNotes() {
    let content = notes.map((n, i) => `Note ${i + 1}:\n[${n.timestamp}] (${n.color})\n${n.text}\n\n`).join('');
    let blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "All_Notes.txt";
    a.click();
}

window.onload = function () {
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').innerHTML = '🌞';
    }
    displayNotes();
};