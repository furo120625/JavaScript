const lessonList = document.getElementById("lesson-list");
const recentList = document.getElementById("recent-list");
const searchInput = document.getElementById("search-input");

let lessons = [];

function readRecentLessons() {
    try {
        const stored = JSON.parse(localStorage.getItem("recentLessons") || "[]");
        return Array.isArray(stored)
            ? stored.filter(item => typeof item === "string")
            : [];
    } catch (error) {
        console.warn("Recent lesson history is invalid:", error);
        return [];
    }
}

function renderLessonLinks(container, items, emptyMessage) {
    container.replaceChildren();

    if (items.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-message";
        message.textContent = emptyMessage;
        container.appendChild(message);
        return;
    }

    items.forEach(lesson => {
        const link = document.createElement("a");
        link.className = "lesson-item";
        link.href = lesson.path;
        link.textContent = lesson.title;
        link.addEventListener("click", () => saveRecentLesson(lesson.path));
        container.appendChild(link);
    });
}

function renderLessons(items) {
    renderLessonLinks(lessonList, items, "No lessons found.");
}

function saveRecentLesson(path) {
    const recent = readRecentLessons().filter(item => item !== path);
    recent.unshift(path);

    try {
        localStorage.setItem("recentLessons", JSON.stringify(recent.slice(0, 4)));
    } catch (error) {
        console.warn("Unable to save recent lessons:", error);
    }
}

function renderRecentLessons() {
    const recentPaths = readRecentLessons();
    const recentLessons = recentPaths
        .map(path => lessons.find(lesson => lesson.path === path))
        .filter(Boolean)
        .slice(0, 4);

    renderLessonLinks(recentList, recentLessons, "No recently accessed lessons.");
}

async function loadLessons() {
    try {
        const response = await fetch("lessons.json");

        if (!response.ok) {
            throw new Error(`Unable to load lessons.json (HTTP ${response.status})`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new TypeError("lessons.json must contain an array.");
        }

        lessons = data.filter(lesson =>
            lesson &&
            typeof lesson.title === "string" &&
            typeof lesson.path === "string"
        );

        renderLessons(lessons);
        renderRecentLessons();
    } catch (error) {
        console.error("Failed to load lessons:", error);
        const message = document.createElement("p");
        message.className = "error-message";
        message.textContent = "Unable to load lessons. Please refresh the page.";
        lessonList.replaceChildren(message);
    }
}

searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.trim().toLocaleLowerCase("vi");
    const filteredLessons = lessons.filter(lesson =>
        lesson.title.toLocaleLowerCase("vi").includes(keyword)
    );
    renderLessons(filteredLessons);
});

loadLessons();
