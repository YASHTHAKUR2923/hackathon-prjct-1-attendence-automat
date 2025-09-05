const tbody = document.querySelector('#monthly-table tbody');
const exportBtn = document.getElementById('export-monthly');
const resetBtn = document.getElementById('reset-monthly');
const monthFilter = document.getElementById('month-filter');

let attendance = JSON.parse(localStorage.getItem("attendance")) || {};
let filteredMonth = "all";

function renderMonthly(){
  tbody.innerHTML='';
  let found = false;

  Object.keys(attendance).forEach(date=>{
    // Expect date format like "2025-05-01"
    const month = date.split("-")[1];
    if(filteredMonth === "all" || month === filteredMonth){
      attendance[date].forEach(r=>{
        const row = document.createElement('tr');
        row.innerHTML = `<td>${date}</td><td>${r.id}</td><td>${r.name}</td><td>${r.status}</td>`;
        tbody.appendChild(row);
        found = true;
      });
    }
  });

  if(!found){
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No records found</td></tr>`;
  }
}
renderMonthly();

// --- Handle Month Filter ---
monthFilter.addEventListener("change", ()=>{
  filteredMonth = monthFilter.value;
  renderMonthly();
});

// --- Export CSV ---
exportBtn.addEventListener('click', ()=>{
  const rows = [['Date','Student ID','Name','Status']];
  Object.keys(attendance).forEach(date=>{
    const month = date.split("-")[1];
    if(filteredMonth === "all" || month === filteredMonth){
      attendance[date].forEach(r=>{
        rows.push([date, r.id, r.name, r.status]);
      });
    }
  });
  if(rows.length > 1){
    downloadCSV(rows, 'monthly_attendance.csv');
  } else {
    alert("No data available to export for this month!");
  }
});

function downloadCSV(rows, filename){
  const csvContent = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// --- Reset Table Data ---
resetBtn.addEventListener('click', ()=>{
  if(confirm("Are you sure you want to reset all attendance data? This cannot be undone.")){
    localStorage.removeItem("attendance");
    attendance = {};
    renderMonthly();
    alert("All attendance data has been cleared!");
  }
});
