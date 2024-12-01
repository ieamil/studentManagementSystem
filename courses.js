//load JSON files and save in localstorage
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
  

//Get courses, students and records in localstorage
  let courses = JSON.parse(localStorage.getItem("courses")) || [];
  let students = JSON.parse(localStorage.getItem("students")) || [];
  let records = JSON.parse(localStorage.getItem("records")) || [];
  
//Save course updates to Local Storage
  function saveCourses() {
    if (courses && Array.isArray(courses)) {
        localStorage.setItem("courses", JSON.stringify(courses));
    } else {
        console.error("Courses data is invalid!");
    }
}
  
  function displayCourses() {
    // I select the table body in which the courses will be displayed
    const tableBody = document.querySelector("#course-table tbody");
    tableBody.innerHTML = "";   // Clear any existing rows

    // Loop through the courses array to create table rows for each course
    courses.forEach((course) => {
        const row = document.createElement("tr");
        row.addEventListener("click", () => showCourseDetails(course.id));
        row.innerHTML = `
            <td>${course.id}</td>
            <td>${course.name}</td>
            <td>${course.lecturer || "N/A"}</td>
            <td>${course.midtermPercent || "N/A"}%</td>
            <td>${course.acts || 0}</td>
        `;
        tableBody.appendChild(row);
    });
}

  function calculateLetterGrade(midtermGrade, finalGrade, gradingScale , midtermPerc) {
    const totalGrade = midtermGrade * (midtermPerc/100) + finalGrade * ((100-midtermPerc)/100);

    if (totalGrade >= gradingScale.AA) return "AA";
    if (totalGrade >= gradingScale.BA) return "BA";
    if (totalGrade >= gradingScale.BB) return "BB";
    if (totalGrade >= gradingScale.CB) return "CB";
    if (totalGrade >= gradingScale.CC) return "CC";
    return "FF";
}

  
// Check if there is a course with the same ID
  function isDuplicateCourseId(courseId) {
    return courses.some((course) => course.id === courseId);
  }
  
// Add new course
document.getElementById("add-course-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const courseId = document.getElementById("course-id").value.trim();
  const courseName = document.getElementById("course-name").value.trim();
  const courseLecturer = document.getElementById("course-lecturer").value.trim();
  const courseMidtermPercent = parseInt(document.getElementById("course-midterm-percent").value.trim(), 10);
  const courseACTS = parseInt(document.getElementById("course-acts").value.trim(), 10);

  const gradeAA = parseInt(document.getElementById("grade-aa").value.trim(), 10);
  const gradeBA = parseInt(document.getElementById("grade-ba").value.trim(), 10);
  const gradeBB = parseInt(document.getElementById("grade-bb").value.trim(), 10);
  const gradeCB = parseInt(document.getElementById("grade-cb").value.trim(), 10);
  const gradeCC = parseInt(document.getElementById("grade-cc").value.trim(), 10);
  const gradeFF = 0;

  if (!courseId || !courseName || isNaN(courseMidtermPercent) || isNaN(courseACTS)) {
      alert("All fields are required and must be valid!");
      return;
  }

  if (isDuplicateCourseId(courseId)) {
      alert("A course with this ID already exists. Please use a unique ID.");
      return;
  }

  const newCourse = {
      id: courseId,
      name: courseName,
      lecturer: courseLecturer,
      midtermPercent: courseMidtermPercent,
      acts: courseACTS,
      gradingScale: {
          AA: gradeAA,
          BA: gradeBA,
          BB: gradeBB,
          CB: gradeCB,
          CC: gradeCC,
          FF: gradeFF,
      },
  };

  courses.push(newCourse);
  saveCourses(); 
  displayCourses();
  document.getElementById("add-course-form").reset();
  alert("Course added successfully!");
});

//Update
document.getElementById("update-course-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const courseId = document.getElementById("update-course-id").value.trim();
  const course = courses.find((c) => c.id === courseId);

  if (!course) {
      alert("Course not found!");
      return;
  }

  const updatedFields = {
      name: document.getElementById("update-course-name").value.trim(),
      lecturer: document.getElementById("update-course-lecturer").value.trim(),
      midtermPercent: parseInt(document.getElementById("update-course-midterm-percent").value.trim(), 10),
      acts: parseInt(document.getElementById("update-course-acts").value.trim(), 10),
      gradingScale: {
          AA: parseInt(document.getElementById("update-grade-aa").value.trim(), 10) || course.gradingScale.AA,
          BA: parseInt(document.getElementById("update-grade-ba").value.trim(), 10) || course.gradingScale.BA,
          BB: parseInt(document.getElementById("update-grade-bb").value.trim(), 10) || course.gradingScale.BB,
          CB: parseInt(document.getElementById("update-grade-cb").value.trim(), 10) || course.gradingScale.CB,
          CC: parseInt(document.getElementById("update-grade-cc").value.trim(), 10) || course.gradingScale.CC,
          FF: 0 
      }
  };

  if (updatedFields.name) course.name = updatedFields.name;
  if (updatedFields.lecturer) course.lecturer = updatedFields.lecturer;
  if (!isNaN(updatedFields.midtermPercent)) course.midtermPercent = updatedFields.midtermPercent;
  if (!isNaN(updatedFields.acts)) course.acts = updatedFields.acts;

  // Grading scale 
  course.gradingScale = { ...updatedFields.gradingScale };

  saveCourses();
  displayCourses();
  alert("Course updated successfully!");
  document.getElementById("update-course-form").reset();
});

  
  // Delete
  document.getElementById("delete-course-form").addEventListener("submit", function (event) {
    event.preventDefault();
  
    const courseId = document.getElementById("delete-course-id").value.trim();
    const courseIndex = courses.findIndex((c) => c.id === courseId);
  
    if (courseIndex > -1) {
      courses.splice(courseIndex, 1);
      saveCourses(); 
      displayCourses();
      alert("Course deleted successfully!");
      document.getElementById("delete-course-form").reset();
    } else {
      alert("Course not found!");
    }
  });

  function filterFailingStudents() {
    if (!currentCourseId) {
        console.error("No course selected!");
        return;
    }

    const course = courses.find((c) => c.id === currentCourseId);
    if (!course || !course.gradingScale) {
        console.error("Grading scale not found for course:", currentCourseId);
        return;
    }

    const courseRecords = records.filter((record) => record.courseId === currentCourseId);
    const failingStudents = courseRecords.filter((record) => {
        const totalGrade = record.midtermGrade * (course.midtermPercent / 100) + 
                           record.finalGrade * (1 - course.midtermPercent / 100);
        return totalGrade < course.gradingScale.CC; 
    });

    updateStudentTable(failingStudents, course);
}

function filterPassingStudents() {
    if (!currentCourseId) {
        console.error("No course selected!");
        return;
    }

    const course = courses.find((c) => c.id === currentCourseId);
    if (!course || !course.gradingScale) {
        console.error("Grading scale not found for course:", currentCourseId);
        return;
    }

    const courseRecords = records.filter((record) => record.courseId === currentCourseId);
    const passingStudents = courseRecords.filter((record) => {
        const totalGrade = record.midtermGrade * (course.midtermPercent / 100) + 
                           record.finalGrade * (1 - course.midtermPercent / 100);
        return totalGrade >= course.gradingScale.CC; 
    });

    updateStudentTable(passingStudents, course);
}


function updateStudentTable(filteredRecords, course) {
  const studentsTableBody = document.querySelector("#course-students-table tbody");
  studentsTableBody.innerHTML = ""; 

  filteredRecords.forEach((record) => {
      const student = students.find((s) => s.id === record.studentId);
      if (student) {
          const letterGrade = calculateLetterGrade(
              record.midtermGrade,
              record.finalGrade,
              course.gradingScale,
              course.midtermPercent
          );

          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${student.name} ${student.surname}</td>
              <td>${record.midtermGrade}</td>
              <td>${record.finalGrade}</td>
              <td>${letterGrade}</td>
          `;
          studentsTableBody.appendChild(row);
      }
  });
}

function showCourseDetails(courseId) {
  const course = courses.find((c) => c.id === courseId);

  if (course) {
      currentCourseId = courseId; 

      document.getElementById("modal-course-name").textContent = course.name;
      document.getElementById("modal-course-id").textContent = course.id;
      document.getElementById("modal-course-lecturer").textContent = course.lecturer || "N/A";
      document.getElementById("modal-course-midterm").textContent = course.midtermPercent || "N/A";
      document.getElementById("modal-course-acts").textContent = course.acts || 0;

      const courseRecords = records.filter((record) => record.courseId === courseId);

      const { successCount, failCount, averageScore } = calculateCourseStatistics(courseRecords, course);

      document.getElementById("success-count").textContent = `Successful Students: ${successCount}`;
      document.getElementById("fail-count").textContent = `Failing Students: ${failCount}`;
      document.getElementById("average-score").textContent = `Average Score: ${averageScore}`;

      updateStudentTable(courseRecords, course);

      document.getElementById("course-modal").classList.remove("hidden");
  }
}

function calculateCourseStatistics(courseRecords, course) {
  let successCount = 0;
  let failCount = 0;
  let totalScore = 0;

  courseRecords.forEach((record) => {
      const totalGrade = record.midtermGrade * (course.midtermPercent / 100) + 
                         record.finalGrade * (1 - course.midtermPercent / 100);

      totalScore += totalGrade;

      if (totalGrade >= course.gradingScale.CC) {
          successCount++; 
      } else {
          failCount++; 
      }
  });

  const averageScore = courseRecords.length > 0 ? (totalScore / courseRecords.length).toFixed(2) : "N/A";

  return { successCount, failCount, averageScore };
}

function searchCourses() {
  const searchInput = document.getElementById("search-bar").value.toLowerCase(); 
  const tableRows = document.querySelectorAll("#course-table tbody tr"); 

  tableRows.forEach((row) => {
      const courseId = row.cells[0].textContent.toLowerCase(); 
      const courseName = row.cells[1].textContent.toLowerCase(); 

      if (courseId.includes(searchInput) || courseName.includes(searchInput)) {
          row.style.display = ""; 
      } else {
          row.style.display = "none";
      }
  });
}

  function closeCourseModal() {
    document.getElementById("course-modal").classList.add("hidden");
  }
  
  displayCourses();
  