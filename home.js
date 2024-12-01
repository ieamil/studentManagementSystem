document.addEventListener("DOMContentLoaded", function () {
    // Header 
    fetch("header.html")
        .then((response) => response.text())
        .then((data) => {
            document.body.insertAdjacentHTML("afterbegin", data);
        });

    // Sidebar 
    fetch("sidebar.html")
        .then((response) => response.text())
        .then((data) => {
            document.body.insertAdjacentHTML("afterbegin", data);
        });
});
