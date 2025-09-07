
document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#attendance-table tbody");
  const today = new Date().toISOString().slice(0, 10);

  function loadTodayAttendance() {
    let attendance = JSON.parse(localStorage.getItem("attendance")) || {};
    let todayData = attendance[today] || [];

    tableBody.innerHTML = "";

    if (todayData.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="5" style="text-align:center;">No attendance marked today.</td>`;
      tableBody.appendChild(row);
      return;
    }

    todayData.forEach((entry, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${entry.id}</td>]
        <td>${entry.name}</td>
        <td>${entry.status}</td>
        <td>${entry.time}</td>
        <td><button class="remove-btn" data-index="${index}">Remove</button></td>
      `;
      tableBody.appendChild(row);
    });
  }

  // --- Remove a student from today's attendance ---
  tableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
      const index = e.target.dataset.index;
      let attendance = JSON.parse(localStorage.getItem("attendance")) || {};
      let todayData = attendance[today] || [];

      todayData.splice(index, 1);
      attendance[today] = todayData;
      localStorage.setItem("attendance", JSON.stringify(attendance));
      loadTodayAttendance();
    }
  });

  // --- Initial load ---
  loadTodayAttendance();
});

