// --- Load students from localStorage only (no hardcoded list) ---
let students = JSON.parse(localStorage.getItem("students"));
if(!students) {
    students = [];
    localStorage.setItem("students", JSON.stringify(students));
}

// Attendance storage
let attendance = JSON.parse(localStorage.getItem("attendance")) || {};
const today = new Date().toISOString().slice(0, 10);
if (!attendance[today]) attendance[today] = [];

// ---- DOM refs ----
const studentTableBody = document.querySelector('#student-table tbody');
const studentIdInput = document.getElementById('student-id-input');
const markPresentBtn = document.getElementById('mark-present');
const addStudentBtn = document.getElementById('add-student');
const newStudentName = document.getElementById('new-student-name');
const newStudentID = document.getElementById('new-student-id');
const clearTodayBtn = document.getElementById('clear-today');
const exportCsvBtn = document.getElementById('export-csv');

// --- Render Student List ---
function renderStudents() {
    studentTableBody.innerHTML = '';

    if(students.length === 0){
        studentTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No students</td></tr>';
        return;
    }

    students.forEach((s, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${s.id}</td>
            <td>${s.name}</td>
            <td>${s.dateAdded || "-"}</td>
            <td><button class="remove-student-btn" data-index="${index}">❌ Remove</button></td>
        `;
        studentTableBody.appendChild(row);
    });

    // Attach remove listeners
    document.querySelectorAll('.remove-student-btn').forEach(btn=>{
        btn.addEventListener('click', e=>{
            const idx = e.target.dataset.index;
            if(confirm("Remove this student?")){
                students.splice(idx,1);
                localStorage.setItem("students", JSON.stringify(students));
                renderStudents();
            }
        });
    });
}

// --- Render Today's Attendance ---
function renderToday() {
    const attendanceTableBody = document.querySelector('#attendance-table tbody');
    if (!attendanceTableBody) return;
    attendanceTableBody.innerHTML = '';

    if(!attendance[today] || attendance[today].length === 0){
        attendanceTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No records</td></tr>';
        return;
    }

    attendance[today].forEach((rec, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${rec.id}</td>
            <td>${rec.name}</td>
            <td>${rec.status}</td>
            <td>${rec.time}</td>
            <td><button class="remove-btn" data-index="${index}">❌ Remove</button></td>
        `;
        attendanceTableBody.appendChild(row);
    });

    document.querySelectorAll('.remove-btn').forEach(btn=>{
        btn.addEventListener('click', e=>{
            const idx = e.target.dataset.index;
            if(confirm("Remove this attendance record?")){
                attendance[today].splice(idx,1);
                localStorage.setItem("attendance", JSON.stringify(attendance));
                renderToday();
            }
        });
    });
}

// --- Mark Present ---
function markPresent(studentId){
    const std = students.find(s => s.id.toLowerCase() === studentId.toLowerCase());
    if(!std){ alert('Student not found!'); return; }

    if(attendance[today].some(r => r.id === std.id)){
        alert(std.name + " is already marked present!");
        return;
    }

    const record = {
        id: std.id,
        name: std.name,
        status: "Present",
        time: new Date().toLocaleTimeString()
    };

    attendance[today].push(record);
    localStorage.setItem("attendance", JSON.stringify(attendance));
    renderToday();

    alert(`✔ ${record.name} (${record.id}) marked Present at ${record.time}`);
}

markPresentBtn.addEventListener('click', ()=>{
    const id = studentIdInput.value.trim();
    if(!id) return alert("Enter Student ID");
    markPresent(id);
    studentIdInput.value = '';
});

// --- Add Student ---
addStudentBtn.addEventListener('click', ()=>{
    const name = newStudentName.value.trim();
    const id = newStudentID.value.trim();
    if(!name || !id) return alert("Enter both fields");
    if(students.find(s => s.id.toLowerCase() === id.toLowerCase())) return alert("Student already exists");

    students.push({id, name, dateAdded: today});
    localStorage.setItem("students", JSON.stringify(students));
    newStudentName.value = '';
    newStudentID.value = '';
    renderStudents();
    alert("Student added successfully!");
});

// --- Clear Today's Attendance ---
if(clearTodayBtn){
    clearTodayBtn.addEventListener('click', ()=>{
        if(confirm("Clear all today's attendance?")){
            attendance[today] = [];
            localStorage.setItem("attendance", JSON.stringify(attendance));
            renderToday();
        }
    });
}

// --- Export CSV ---
if(exportCsvBtn){
    exportCsvBtn.addEventListener('click', ()=>{
        const rows = [['Student ID','Name','Status','Time']];
        if(attendance[today]){
            attendance[today].forEach(r=>{
                rows.push([r.id, r.name, r.status, r.time]);
            });
        }

        const csvContent = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
        const blob = new Blob([csvContent], {type:'text/csv'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; 
        a.download = `attendance_${today}.csv`; 
        a.click();
        URL.revokeObjectURL(url);
    });
}

// --- Initial render ---
renderStudents();
renderToday();
