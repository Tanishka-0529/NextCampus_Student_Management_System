/**
 * NextCampus - Student Management System
 * Frontend Script handling RESTful API interactions, form validation, and DOM updates.
 */

const API_BASE_URL = '/api/students';

// Local Memory Cache for dynamic offline demo fallback
let localStudentsStore = [
  { id: 1, roll_no: 'CS101', name: 'Aarav Sharma', student_class: 'B.Tech CS - Sem 4', marks: 88.5, contact: '9876543210', email: 'aarav@campus.edu' },
  { id: 2, roll_no: 'CS102', name: 'Priya Patel', student_class: 'B.Tech CS - Sem 4', marks: 92.0, contact: '9812345678', email: 'priya@campus.edu' },
  { id: 3, roll_no: 'EC201', name: 'Rohan Verma', student_class: 'B.Tech EC - Sem 6', marks: 74.0, contact: '9765432109', email: 'rohan@campus.edu' },
  { id: 4, roll_no: 'ME301', name: 'Ananya Gupta', student_class: 'B.Tech ME - Sem 2', marks: 65.5, contact: '9654321098', email: 'ananya@campus.edu' }
];

// DOM Elements
const studentsTableBody = document.getElementById('studentsTableBody');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const classFilterSelect = document.getElementById('classFilterSelect');
const refreshBtn = document.getElementById('refreshBtn');
const emptyState = document.getElementById('emptyState');
const totalCountBadge = document.getElementById('totalCountBadge');

// Stat Cards
const statTotal = document.getElementById('statTotal');
const statAvg = document.getElementById('statAvg');
const statTop = document.getElementById('statTop');
const statClasses = document.getElementById('statClasses');

// Modals & Form
const studentModal = document.getElementById('studentModal');
const studentForm = document.getElementById('studentForm');
const modalTitle = document.getElementById('modalTitle');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const emptyAddBtn = document.getElementById('emptyAddBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');

// Delete Modal
const deleteModal = document.getElementById('deleteModal');
const deleteStudentName = document.getElementById('deleteStudentName');
const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Mobile Nav
const mobileToggleBtn = document.getElementById('mobileToggleBtn');
const headerActions = document.getElementById('headerActions');

let deletingStudentId = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  fetchStudents();
  setupEventListeners();
});

// Setup All Event Listeners
function setupEventListeners() {
  // Mobile Nav Toggle
  mobileToggleBtn.addEventListener('click', () => {
    headerActions.classList.toggle('active');
  });

  // Search & Filters
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    clearSearchBtn.classList.toggle('active', query.length > 0);
    fetchStudents();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.classList.remove('active');
    fetchStudents();
  });

  classFilterSelect.addEventListener('change', fetchStudents);
  refreshBtn.addEventListener('click', fetchStudents);

  // Modal Open/Close
  openAddModalBtn.addEventListener('click', () => openFormModal());
  emptyAddBtn.addEventListener('click', () => openFormModal());
  closeModalBtn.addEventListener('click', closeFormModal);
  cancelModalBtn.addEventListener('click', closeFormModal);

  // Form Submit
  studentForm.addEventListener('submit', handleFormSubmit);

  // Delete Modal Close
  closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
  cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
}

// Fetch Students via REST API (with local fallback)
async function fetchStudents() {
  const query = searchInput.value.trim();
  const classFilter = classFilterSelect.value;

  try {
    let url = `${API_BASE_URL}?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Backend offline');
    
    let data = await response.json();
    if (classFilter !== 'ALL') {
      data = data.filter(s => s.student_class === classFilter);
    }
    renderTable(data);
    updateMetrics(data);
    updateClassFilterOptions(data);
  } catch (err) {
    // Client-side fallback if backend API server is not running
    let filtered = localStudentsStore.filter(s => 
      s.name.toLowerCase().includes(query.toLowerCase()) || 
      s.roll_no.toLowerCase().includes(query.toLowerCase())
    );
    if (classFilter !== 'ALL') {
      filtered = filtered.filter(s => s.student_class === classFilter);
    }
    renderTable(filtered);
    updateMetrics(filtered);
    updateClassFilterOptions(localStudentsStore);
  }
}

// Render Table Rows
function renderTable(students) {
  studentsTableBody.innerHTML = '';

  if (students.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  students.forEach(student => {
    const tr = document.createElement('tr');
    
    const isPass = parseFloat(student.marks) >= 40;
    const statusBadge = isPass 
      ? `<span class="badge-status status-pass">Pass</span>`
      : `<span class="badge-status status-fail">Needs Improvement</span>`;

    tr.innerHTML = `
      <td><span class="badge-roll">${escapeHtml(student.roll_no)}</span></td>
      <td>
        <span class="student-name">${escapeHtml(student.name)}</span>
        <span class="student-email">${escapeHtml(student.email || 'N/A')}</span>
      </td>
      <td>${escapeHtml(student.student_class)}</td>
      <td><strong>${parseFloat(student.marks).toFixed(1)}%</strong></td>
      <td>${escapeHtml(student.contact)}</td>
      <td>${statusBadge}</td>
      <td class="text-right">
        <div class="action-btns">
          <button class="btn-icon" onclick="editStudent(${student.id})" title="Edit Student">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn-icon delete" onclick="promptDelete(${student.id}, '${escapeHtml(student.name)}')" title="Delete Student">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    studentsTableBody.appendChild(tr);
  });
}

// Update Metrics Dashboard
function updateMetrics(students) {
  const total = students.length;
  totalCountBadge.textContent = total;
  statTotal.textContent = total;

  if (total === 0) {
    statAvg.textContent = '0.0%';
    statTop.textContent = 'N/A';
    statClasses.textContent = '0';
    return;
  }

  const sumMarks = students.reduce((acc, s) => acc + parseFloat(s.marks), 0);
  const avg = (sumMarks / total).toFixed(1);
  statAvg.textContent = `${avg}%`;

  const topScorer = [...students].sort((a, b) => parseFloat(b.marks) - parseFloat(a.marks))[0];
  statTop.textContent = topScorer ? `${topScorer.name} (${topScorer.marks}%)` : 'N/A';

  const uniqueClasses = new Set(students.map(s => s.student_class)).size;
  statClasses.textContent = uniqueClasses;
}

// Update Class Dropdown Filter
function updateClassFilterOptions(students) {
  const currentVal = classFilterSelect.value;
  const classes = Array.from(new Set(students.map(s => s.student_class)));

  classFilterSelect.innerHTML = '<option value="ALL">All Classes</option>';
  classes.forEach(cls => {
    const opt = document.createElement('option');
    opt.value = cls;
    opt.textContent = cls;
    if (cls === currentVal) opt.selected = true;
    classFilterSelect.appendChild(opt);
  });
}

// Open Form Modal (Add / Edit)
function openFormModal(student = null) {
  clearFormErrors();
  studentForm.reset();

  if (student) {
    modalTitle.innerHTML = `<i class="fa-solid fa-user-pen"></i> Edit Student`;
    document.getElementById('studentId').value = student.id;
    document.getElementById('rollNo').value = student.roll_no;
    document.getElementById('studentName').value = student.name;
    document.getElementById('studentClass').value = student.student_class;
    document.getElementById('studentMarks').value = student.marks;
    document.getElementById('studentContact').value = student.contact;
    document.getElementById('studentEmail').value = student.email || '';
  } else {
    modalTitle.innerHTML = `<i class="fa-solid fa-user-plus"></i> Add New Student`;
    document.getElementById('studentId').value = '';
  }

  studentModal.classList.remove('hidden');
}

function closeFormModal() {
  studentModal.classList.add('hidden');
}

// Handle Form Submit (Add or Update)
async function handleFormSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;

  const id = document.getElementById('studentId').value;
  const studentData = {
    roll_no: document.getElementById('rollNo').value.trim(),
    name: document.getElementById('studentName').value.trim(),
    student_class: document.getElementById('studentClass').value.trim(),
    marks: parseFloat(document.getElementById('studentMarks').value),
    contact: document.getElementById('studentContact').value.trim(),
    email: document.getElementById('studentEmail').value.trim()
  };

  try {
    const url = id ? `${API_BASE_URL}/${id}` : API_BASE_URL;
    const method = id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });

    if (!response.ok) {
      const errRes = await response.json();
      throw new Error(errRes.error || 'Failed to save record');
    }

    showToast(id ? 'Student updated successfully!' : 'Student added successfully!', 'success');
    closeFormModal();
    fetchStudents();
  } catch (err) {
    // Fallback for offline mode
    if (id) {
      const idx = localStudentsStore.findIndex(s => s.id == id);
      if (idx !== -1) localStudentsStore[idx] = { id: parseInt(id), ...studentData };
    } else {
      localStudentsStore.push({ id: Date.now(), ...studentData });
    }
    showToast(id ? 'Updated (Local Sync)' : 'Added (Local Sync)', 'success');
    closeFormModal();
    fetchStudents();
  }
}

// Validation Logic
function validateForm() {
  clearFormErrors();
  let isValid = true;

  const rollNo = document.getElementById('rollNo').value.trim();
  const name = document.getElementById('studentName').value.trim();
  const studentClass = document.getElementById('studentClass').value.trim();
  const marks = document.getElementById('studentMarks').value;
  const contact = document.getElementById('studentContact').value.trim();

  if (!rollNo) {
    showError('rollNo', 'Roll Number is required');
    isValid = false;
  }

  if (!name) {
    showError('studentName', 'Student Name is required');
    isValid = false;
  }

  if (!studentClass) {
    showError('studentClass', 'Class is required');
    isValid = false;
  }

  if (marks === '' || marks < 0 || marks > 100) {
    showError('studentMarks', 'Enter valid marks (0-100)');
    isValid = false;
  }

  if (!/^\d{10}$/.test(contact)) {
    showError('studentContact', 'Enter valid 10-digit contact number');
    isValid = false;
  }

  return isValid;
}

function showError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorElem = document.getElementById(`${fieldId}Error`) || input.nextElementSibling;
  input.classList.add('is-invalid');
  if (errorElem) errorElem.textContent = message;
}

function clearFormErrors() {
  document.querySelectorAll('.form-input').forEach(i => i.classList.remove('is-invalid'));
  document.querySelectorAll('.error-msg').forEach(e => e.textContent = '');
}

// Edit Trigger
function editStudent(id) {
  const student = localStudentsStore.find(s => s.id === id);
  if (student) openFormModal(student);
}

// Delete Triggers
function promptDelete(id, name) {
  deletingStudentId = id;
  deleteStudentName.textContent = name;
  deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
  deleteModal.classList.add('hidden');
  deletingStudentId = null;
}

async function handleConfirmDelete() {
  if (!deletingStudentId) return;

  try {
    const response = await fetch(`${API_BASE_URL}/${deletingStudentId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Delete failed');
    showToast('Student record deleted successfully', 'danger');
  } catch (err) {
    localStudentsStore = localStudentsStore.filter(s => s.id !== deletingStudentId);
    showToast('Record deleted (Local Sync)', 'danger');
  } finally {
    closeDeleteModal();
    fetchStudents();
  }
}

// Toast Notifications
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'circle-check' : 'circle-exclamation'}"></i> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Helper: Sanitize HTML string
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}