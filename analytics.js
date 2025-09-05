const percentPresent = document.getElementById('percent-present');
const totalStudentsElem = document.getElementById('total-students');
const barCanvas = document.getElementById('bar-chart');

let students = JSON.parse(localStorage.getItem("students")) || [];
let attendance = JSON.parse(localStorage.getItem("attendance")) || {};

const today = new Date().toISOString().slice(0,10);
const todayRecords = attendance[today] || [];

function renderAnalytics(){
  const total = students.length;
  const present = todayRecords.length;
  const percent = total === 0 ? 0 : Math.round((present/total)*100);
  percentPresent.textContent = percent + "%";
  totalStudentsElem.textContent = total;
  drawBarChart(present, total - present);
}

function drawBarChart(present, absent){
  const ctx = barCanvas.getContext('2d');
  const W = barCanvas.width, H = barCanvas.height;
  ctx.clearRect(0,0,W,H);
  const total = present+absent || 1;
  const pH = Math.round((present/total)*H*0.8);
  const aH = Math.round((absent/total)*H*0.8);

  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#111827';
  ctx.fillText('Present', 40, H - pH - 30);
  ctx.fillText('Absent', 140, H - aH - 30);

  ctx.fillStyle = '#16a34a';
  ctx.fillRect(40, H-pH-20, 40, pH);

  ctx.fillStyle = '#ef4444';
  ctx.fillRect(140, H-aH-20, 40, aH);
}

renderAnalytics();
