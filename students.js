async function setJson(jsonPath, localStorageName) {
  const response = await fetch(jsonPath);
  const data = await response.json();
  localStorage.setItem(localStorageName, JSON.stringify(data));
}

if (!localStorage.getItem("students")) {
  setJson("json/students.json", "students");
}
if (!localStorage.getItem("records")) {
  setJson("json/records.json", "records");
}
if (!localStorage.getItem("courses")) {
  setJson("json/courses.json", "courses");
}

let students = JSON.parse(localStorage.getItem("students")) || [];
let records = JSON.parse(localStorage.getItem("records")) || [];
let courses = JSON.parse(localStorage.getItem("courses")) || [];

function saveStudents() {
  localStorage.setItem("students", JSON.stringify(students));
}

function displayStudents() {
  const tableBody = document.querySelector("#student-table tbody");
  tableBody.innerHTML = ""; 

  students.forEach((student) => {
    let totalGrades = 0;
    let totalACTS = 0;

    const studentRecords = records.filter((record) => record.studentId === student.id);
    studentRecords.forEach((record) => {
      const course = courses.find((c) => c.id === record.courseId);
      if (course) {
        const midtermPercent = course.midtermPercent / 100; 
        const finalPercent = 1 - midtermPercent; 
        const totalGrade = record.midtermGrade * midtermPercent + record.finalGrade * finalPercent;

        const gradeOutOf4 = (totalGrade / 100) * 4;

        totalGrades += gradeOutOf4 * course.acts; 
        totalACTS += course.acts; 
      }
    });

    const gpa = totalACTS > 0 ? (totalGrades / totalACTS).toFixed(2) : "N/A";

    student.gpa = gpa;
    student.totalActs = totalACTS;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>${student.surname}</td>
      <td>${student.gpa}</td>
      <td>${student.totalActs}</td>
    `;
    row.addEventListener("click", () => showStudentDetails(student.id)); 
    tableBody.appendChild(row);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  displayStudents();
});


document.addEventListener("DOMContentLoaded", () => {
  displayStudents();
});


function addStudentDetails(student){
  const tableBody = document.getElementById("student-courses-table");
  const row = document.createElement("tr");
  row.innerHTML = `
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>${student.surname}</td>
      <td>${student.gpa || "N/A"}</td>
      <td>${student.totalActs || 0}</td>
    `;
    tableBody.appendChild(row);
}

function isDuplicateId(studentId) {
  return students.some((student) => student.id === studentId);
}

document.getElementById("add-student-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const studentId = document.getElementById("student-id").value.trim();
  const studentName = document.getElementById("student-name").value.trim();
  const studentSurname = document.getElementById("student-surname").value.trim();

  if (!/^\d{9}$/.test(studentId)) {
    alert("Student ID must be exactly 9 digits.");
    return;
  }

  if (isDuplicateId(studentId)) {
    alert("A student with this ID already exists. Please use a unique ID.");
    return;
  }

  if (studentName && studentSurname) {
    const newStudent = { id: studentId, name: studentName, surname: studentSurname, gpa: "N/A", totalActs: 0 };
    students.push(newStudent);
    saveStudents(); 
    displayStudents();
    document.getElementById("add-student-form").reset();
    alert("Student added successfully!");
  } else {
    alert("All fields are required!");
  }
});

document.getElementById("update-student-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const studentId = document.getElementById("update-student-id").value.trim();
  const studentName = document.getElementById("update-student-name").value.trim();
  const studentSurname = document.getElementById("update-student-surname").value.trim();

  const student = students.find((s) => s.id === studentId);

  if (!/^\d{9}$/.test(studentId)) {
    alert("Student ID must be exactly 9 digits.");
    return;
  }

  if (student) {
    if (studentName) student.name = studentName;
    if (studentSurname) student.surname = studentSurname;
    saveStudents(); 
    displayStudents();
    alert("Student updated successfully!");
    document.getElementById("update-student-form").reset();
  } else {
    alert("Student not found!");
  }
});

document.getElementById("delete-student-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const studentId = document.getElementById("delete-student-id").value.trim();

  if (!/^\d{9}$/.test(studentId)) {
    alert("Student ID must be exactly 9 digits.");
    return;
  }

  const studentIndex = students.findIndex((s) => s.id === studentId);

  if (studentIndex > -1) {
    students.splice(studentIndex, 1);
    saveStudents(); 
    displayStudents();
    alert("Student deleted successfully!");
    document.getElementById("delete-student-form").reset();
  } else {
    alert("Student not found!");
  }
});

function calculateLetterGrade(midtermGrade, finalGrade, gradingScale , midtermPerc) {
  const totalGrade = midtermGrade * (midtermPerc/100) + finalGrade * ((100-midtermPerc)/100);

  if (gradingScale && typeof gradingScale === "object") {
    if (totalGrade >= gradingScale.AA) return "AA";
    if (totalGrade >= gradingScale.BA) return "BA";
    if (totalGrade >= gradingScale.BB) return "BB";
    if (totalGrade >= gradingScale.CB) return "CB";
    if (totalGrade >= gradingScale.CC) return "CC";
  }
  return "FF";
}


// Search function to filter students in the table
function searchStudents() {
  const searchTerm = document.getElementById("search-bar").value.toLowerCase();
  const tableBody = document.querySelector("#student-table tbody");

  tableBody.innerHTML = ""; 

  students
    .filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm) ||
        student.surname.toLowerCase().includes(searchTerm) ||
        student.id.includes(searchTerm)
    )
    .forEach((student) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${student.id}</td>
        <td>${student.name}</td>
        <td>${student.surname}</td>
        <td>${student.gpa || "N/A"}</td>
        <td>${student.totalActs || 0}</td>
      `;
      tableBody.appendChild(row);
    });
}

async function showStudentDetails(studentId) {
  const records = JSON.parse(localStorage.getItem("records")) || [];
  const courses = JSON.parse(localStorage.getItem("courses")) || [];
  const student = students.find((s) => s.id === studentId);

  if (student) {
    document.getElementById("modal-student-name").textContent = `${student.name} ${student.surname}`;
    document.getElementById("modal-student-id").textContent = student.id;
    document.getElementById("modal-student-gpa").textContent = student.gpa || "N/A";
    document.getElementById("modal-student-acts").textContent = student.totalActs || 0;

    const studentRecords = records.filter((record) => record.studentId === studentId);
    const coursesTableBody = document.querySelector("#student-courses-table tbody");
    coursesTableBody.innerHTML = ""; 

    studentRecords.forEach((record) => {
      const course = courses.find((c) => c.id === record.courseId);
      if (course) {
        const letterGrade = calculateLetterGrade(
          record.midtermGrade,
          record.finalGrade,
          course.gradingScale,
          course.midtermPercent
        );

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${course.name}</td>
          <td>${record.midtermGrade}</td>
          <td>${record.finalGrade}</td>
          <td>${letterGrade}</td>
        `;
        coursesTableBody.appendChild(row);
      }
    });

    document.getElementById("student-modal").classList.remove("hidden");
  }
}

function closeStudentModal() {
  document.getElementById("student-modal").classList.add("hidden");
}

displayStudents();