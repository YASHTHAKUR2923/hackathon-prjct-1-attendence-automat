// today.js

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#attendance-table tbody");

  // Load attendance data from localStorage
  function loadTodayAttendance() {
    const allData = JSON.parse(localStorage.getItem("attendance")) || [];
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const todayData = allData.filter(entry => entry.date === today);

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
        <td>${entry.id}</td>
        <td>${entry.name}</td>
        <td>${entry.status}</td>
        <td>${entry.time}</td>
        <td><button class="remove-btn" data-index="${index}">Remove</button></td>
      `;
      tableBody.appendChild(row);
    });
  }

  // Remove a student from today's attendance
  tableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
      const index = e.target.dataset.index;
      const allData = JSON.parse(localStorage.getItem("attendance")) || [];
      const today = new Date().toISOString().split("T")[0];

      // Find today's data
      const todayData = allData.filter(entry => entry.date === today);
      const removeItem = todayData[index];

      // Remove it from allData
      const updatedData = allData.filter(entry => {
        return !(entry.date === removeItem.date && entry.id === removeItem.id && entry.time === removeItem.time);
      });

      localStorage.setItem("attendance", JSON.stringify(updatedData));
      loadTodayAttendance();
    }
  });

  // Initial load
  loadTodayAttendance();
});
