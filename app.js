
/* ========================= app.js ========================= */
// Paste into app.js

// --- Sample dataset (would normally come from a backend) ---
const students = [
  { id: 'S001', name: 'Ananya Sharma' },
  { id: 'S002', name: 'Rahul Verma' },
  { id: 'S003', name: 'Priya Singh' },
  { id: 'S004', name: 'Amit Kumar' },
  { id: 'S005', name: 'Sana Khan' }
];

// Attendance store for "today" (simple in-memory map)
const attendance = new Map(); // key: student id -> {time:ISO, status:'Present'}

// ---- DOM refs ----
const tbody = document.querySelector('#attendance-table tbody');
const percentPresent = document.getElementById('percent-present');
const totalStudentsElem = document.getElementById('total-students');
const barCanvas = document.getElementById('bar-chart');

// Mode buttons
const modeQR = document.getElementById('mode-qr');
const modeManual = document.getElementById('mode-manual');
const modeFacial = document.getElementById('mode-facial');

// mode areas
const qrArea = document.getElementById('qr-area');
const manualArea = document.getElementById('manual-area');
const facialArea = document.getElementById('facial-area');

// inputs
const studentIdInput = document.getElementById('student-id-input');
const markPresentBtn = document.getElementById('mark-present');
const addStudentBtn = document.getElementById('add-student');
const newStudentName = document.getElementById('new-student-name');
const newStudentID = document.getElementById('new-student-id');
const simulateFaceBtn = document.getElementById('simulate-face');
const clearTodayBtn = document.getElementById('clear-today');
const exportCsvBtn = document.getElementById('export-csv');

// Utility: switch mode UI
function setMode(mode){
  [modeQR, modeManual, modeFacial].forEach(b=>b.classList.remove('active'));
  [qrArea, manualArea, facialArea].forEach(a=>a.classList.add('hidden'));
  if(mode==='qr'){ modeQR.classList.add('active'); qrArea.classList.remove('hidden'); }
  if(mode==='manual'){ modeManual.classList.add('active'); manualArea.classList.remove('hidden'); }
  if(mode==='facial'){ modeFacial.classList.add('active'); facialArea.classList.remove('hidden'); }
}
modeQR.addEventListener('click', ()=>setMode('qr'));
modeManual.addEventListener('click', ()=>setMode('manual'));
modeFacial.addEventListener('click', ()=>setMode('facial'));

// Render attendance table
function renderTable(){
  tbody.innerHTML='';
  // show all students and their status
  students.forEach(s=>{
    const row = document.createElement('tr');
    const status = attendance.has(s.id) ? 'Present' : 'Absent';
    const time = attendance.has(s.id) ? new Date(attendance.get(s.id).time).toLocaleTimeString() : '-';
    row.innerHTML = `<td>${s.id}</td><td>${s.name}</td><td>${status}</td><td>${time}</td>`;
    tbody.appendChild(row);
  });

  // update analytics
  const total = students.length;
  const present = [...attendance.keys()].filter(id => students.find(s=>s.id===id)).length;
  const percent = total===0?0:Math.round((present/total)*100);
  percentPresent.textContent = percent + '%';
  totalStudentsElem.textContent = total;
  drawBarChart(present, total-present);
}

// Mark present
function markPresent(studentId){
  const std = students.find(s=>s.id.toLowerCase()===studentId.toLowerCase());
  if(!std){ alert('Student ID not found in the class list. Add the student via Manual → Add Student.'); return; }
  if(attendance.has(std.id)){
    alert(std.name + ' is already marked present.');
    return;
  }
  attendance.set(std.id, { time: new Date().toISOString(), method: 'qr' });
  renderTable();
}

markPresentBtn.addEventListener('click', ()=>{
  const id = studentIdInput.value.trim();
  if(!id) return alert('Enter Student ID');
  markPresent(id);
  studentIdInput.value='';
});

// Add student manually
addStudentBtn.addEventListener('click', ()=>{
  const name = newStudentName.value.trim();
  const id = newStudentID.value.trim();
  if(!name || !id) return alert('Enter both name and ID');
  if(students.find(s=>s.id.toLowerCase()===id.toLowerCase())) return alert('Student ID already exists');
  students.push({id, name});
  newStudentName.value=''; newStudentID.value='';
  renderTable();
});

// Simulate facial match by picking a random absent student
simulateFaceBtn.addEventListener('click', ()=>{
  const absent = students.filter(s=>!attendance.has(s.id));
  if(absent.length===0) return alert('All students are already present');
  const pick = absent[Math.floor(Math.random()*absent.length)];
  attendance.set(pick.id, { time: new Date().toISOString(), method: 'facial' });
  alert(`Facial match: ${pick.name} marked present`);
  renderTable();
});

// Clear today's attendance
clearTodayBtn.addEventListener('click', ()=>{
  if(!confirm('Clear today\'s attendance?')) return;
  attendance.clear();
  renderTable();
});

// Export CSV
exportCsvBtn.addEventListener('click', ()=>{
  const rows = [['Student ID','Name','Status','Time']];
  students.forEach(s=>{
    const status = attendance.has(s.id) ? 'Present' : 'Absent';
    const time = attendance.has(s.id) ? attendance.get(s.id).time : '';
    rows.push([s.id, s.name, status, time]);
  });
  const csvContent = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `attendance_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

// Basic bar chart (no libraries) — draws present vs absent
function drawBarChart(present, absent){
  const ctx = barCanvas.getContext('2d');
  const W = barCanvas.width; const H = barCanvas.height;
  ctx.clearRect(0,0,W,H);
  const total = present+absent || 1;
  const pH = Math.round((present/total)*H*0.8);
  const aH = Math.round((absent/total)*H*0.8);

  // labels
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#111827';
  ctx.fillText('Present', 40, H - pH - 30);
  ctx.fillText('Absent', W/2 + 40, H - aH - 30);

  // bars
  ctx.fillStyle = '#16a34a';
  ctx.fillRect(40, H - pH - 10, 80, pH);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(W/2 + 40, H - aH - 10, 80, aH);

  // values
  ctx.fillStyle = '#000';
  ctx.fillText(present, 40+30, H - pH - 15);
  ctx.fillText(absent, W/2 + 40 + 30, H - aH - 15);
}

// Initialize
renderTable();

// ---- Extension notes (in-code) ----
// 1) To integrate QR scanning: include a library like jsQR and use getUserMedia to feed camera frames and decode QR payloads (which would carry student ID).
//    Example lib: https://github.com/cozmo/jsQR (CDN available)
// 2) For facial recognition: use a secure cloud API (AWS Rekognition, Azure Face, or a privacy-focused on-prem SDK) — do NOT store biometric templates without consent.
// 3) Backend: send attendance records to a cloud DB (Firestore, Postgres) with endpoints to fetch historical records and compute trends.
// 4) Offline mode: store attendance in IndexedDB and sync when online.

// End of file
