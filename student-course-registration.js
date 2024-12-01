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

let records = JSON.parse(localStorage.getItem("records")) || [];
let courses = JSON.parse(localStorage.getItem("courses")) || [];

function saveRecords() {
    localStorage.setItem("records", JSON.stringify(records));
}

function populateCourseDropdown() {
    const courseDropdown = document.getElementById("course-dropdown");
    courseDropdown.innerHTML = ""; 

    if (courses.length === 0) {
        console.error("Courses array is empty! Check if JSON is loaded correctly.");
        return;
    }

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Choose a course";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    courseDropdown.appendChild(defaultOption);

    courses.forEach((course) => {
        const option = document.createElement("option");
        option.value = course.id;
        option.textContent = course.name;
        courseDropdown.appendChild(option);
    });
}

function displayRecords() {
    const tableBody = document.querySelector("#registration-table tbody");
    tableBody.innerHTML = ""; 

    records.forEach((record) => {
        const course = courses.find((c) => c.id === record.courseId);
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${course ? course.id : "N/A"}</td> <!-- Course ID -->
            <td>${course ? course.name : "N/A"}</td> <!-- Course Name -->
            <td>${record.studentId}</td> <!-- Student ID -->
            <td>${record.midtermGrade}</td> <!-- Midterm Grade -->
            <td>${record.finalGrade}</td> <!-- Final Grade -->
            <td>
                <button class="delete-btn" onclick="deleteRecord('${record.studentId}', '${record.courseId}')">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function isStudentRegistered(studentId) {
    const students = JSON.parse(localStorage.getItem("students")) || [];
    return students.some((student) => student.id === studentId);
}

function addRecord(event) {
    event.preventDefault();

    const courseId = document.getElementById("course-dropdown").value;
    const studentId = document.getElementById("student-id").value.trim();
    const midtermGrade = parseInt(document.getElementById("midterm-grade").value.trim(), 10);
    const finalGrade = parseInt(document.getElementById("final-grade").value.trim(), 10);

    if (!courseId || !studentId || isNaN(midtermGrade) || isNaN(finalGrade)) {
        alert("All fields are required and must be valid!");
        return;
    }

    if (!isStudentRegistered(studentId)) {
        alert("The student ID is not registered in the system!");
        return;
    }

    const newRecord = {
        studentId: studentId,
        courseId: courseId,
        midtermGrade: midtermGrade,
        finalGrade: finalGrade
    };

    records.push(newRecord);
    saveRecords(); 
    displayRecords(); 
    document.getElementById("register-student-form").reset();
    alert("Record added successfully!");
}

// Kayıt silme
function deleteRecord(studentId, courseId) {
    const recordIndex = records.findIndex(
        (record) => record.studentId === studentId && record.courseId === courseId
    );

    if (recordIndex > -1) {
        records.splice(recordIndex, 1); 
        saveRecords(); 
        displayRecords(); 
        alert("Record deleted successfully!");
    } else {
        alert("Record not found!");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    populateCourseDropdown();
    displayRecords();

    const registerForm = document.getElementById("register-student-form");
    if (registerForm) {
        registerForm.addEventListener("submit", addRecord);
    } else {
        console.error("Register student form not found!");
    }
});
