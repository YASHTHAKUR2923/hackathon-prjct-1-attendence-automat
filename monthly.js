const tbody = document.querySelector('#monthly-table tbody');
const exportBtn = document.getElementById('export-monthly');

let attendance = JSON.parse(localStorage.getItem("attendance")) || {};

function renderMonthly(){
  tbody.innerHTML='';
  Object.keys(attendance).forEach(date=>{
    attendance[date].forEach(r=>{
      const row = document.createElement('tr');
      row.innerHTML = `<td>${date}</td><td>${r.id}</td><td>${r.name}</td><td>${r.status}</td>`;
      tbody.appendChild(row);
    });
  });
}
renderMonthly();

exportBtn.addEventListener('click', ()=>{
  const rows = [['Date','Student ID','Name','Status']];
  Object.keys(attendance).forEach(date=>{
    attendance[date].forEach(r=>{
      rows.push([date, r.id, r.name, r.status]);
    });
  });
  downloadCSV(rows, 'monthly_attendance.csv');
});

function downloadCSV(rows, filename){
  const csvContent = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
