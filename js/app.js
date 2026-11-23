const lessonList = document.getElementById("lesson-list");
const searchInput = document.getElementById("search-input");

async function loadLessons() {
    try {
        const response = await fetch("lessons.json");

        if (!response.ok) {
            throw new Error("Cannot load lessons.json");
        }
        const lessons = await response.json();
        renderLessons(lessons);
    } catch (error) {
        console.error(error);
    }
}

function renderLessons(lessons) {
    lessonList.innerHTML = "";

    lessons.forEach(lesson => {
        const link = document.createElement("a");

        link.className = "lesson-item";
        link.href = `lessons/${lesson}`;
        link.textContent = lesson.replace(".html", "");

        lessonList.appendChild(link);
    });
}

searchInput.addEventListener("input", async () => {
    const response = await fetch("lessons.json");
    const lessons = await response.json();

    const keyword = searchInput.value.toLowerCase();

    const filteredLessons = lessons.filter(lesson =>
        lesson.toLowerCase().includes(keyword)
    );

    renderLessons(filteredLessons);
});

loadLessons();
