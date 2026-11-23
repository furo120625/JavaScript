const lessonList = document.getElementById("lesson-list");
const recentList = document.getElementById("recent-list");
const searchInput = document.getElementById("search-input");
const lessonCount = document.getElementById("lesson-count");

const GITHUB_API =
    "https://api.github.com/repos/furo120625/JavaScript/contents/lessons?ref=main";
const RECENT_STORAGE_KEY = "javascript-hub-recent-lessons";
const MAX_RECENT_LESSONS = 4;

let lessons = [];

function formatLessonTitle(filename) {
    const name = filename.replace(/\.html$/i, "");
    const topic = name.replace(/^javascript/i, "");

    if (!topic) {
        return "JavaScript";
    }

    const readableTopic = topic
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[-_]+/g, " ")
        .replace(/^./, character => character.toUpperCase());

    return name.toLowerCase().startsWith("javascript")
        ? `JavaScript ${readableTopic}`
        : readableTopic;
}

function readRecentLessons() {
    try {
        const saved = JSON.parse(localStorage.getItem(RECENT_STORAGE_KEY));

        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

function saveRecentLesson(lesson) {
    const recentLessons = readRecentLessons().filter(
        item => item.path !== lesson.path
    );

    recentLessons.unshift({
        path: lesson.path,
        title: lesson.title
    });

    try {
        localStorage.setItem(
            RECENT_STORAGE_KEY,
            JSON.stringify(recentLessons.slice(0, MAX_RECENT_LESSONS))
        );
    } catch (error) {
        console.warn("Unable to save recent lesson:", error);
    }
}

function createLessonLink(lesson) {
    const link = document.createElement("a");
    const icon = document.createElement("span");
    const title = document.createElement("span");

    link.className = "lesson-item";
    link.href = lesson.path;

    icon.className = "lesson-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "</>";

    title.className = "lesson-name";
    title.textContent = lesson.title;

    link.append(icon, title);

    link.addEventListener("click", () => saveRecentLesson(lesson));

    return link;
}

function renderLessons(items) {
    lessonList.replaceChildren();

    if (items.length === 0) {
        const message = document.createElement("p");

        message.className = "empty-message";
        message.textContent = searchInput.value.trim()
            ? "No lessons match your search."
            : "No lesson files were found in the lessons folder.";

        lessonList.appendChild(message);
        lessonCount.textContent = "0 lessons";
        return;
    }

    const fragment = document.createDocumentFragment();

    items.forEach(lesson => {
        fragment.appendChild(createLessonLink(lesson));
    });

    lessonList.appendChild(fragment);
    lessonCount.textContent = `${items.length} ${items.length === 1 ? "lesson" : "lessons"}`;
}

function renderRecentLessons() {
    recentList.replaceChildren();

    const availablePaths = new Set(lessons.map(lesson => lesson.path));
    const recentLessons = readRecentLessons().filter(
        lesson => availablePaths.has(lesson.path)
    );

    if (recentLessons.length === 0) {
        const message = document.createElement("p");

        message.className = "empty-message";
        message.textContent = "Lessons you open will appear here.";
        recentList.appendChild(message);
        return;
    }

    const lessonByPath = new Map(
        lessons.map(lesson => [lesson.path, lesson])
    );
    const fragment = document.createDocumentFragment();

    recentLessons.forEach(recentLesson => {
        const lesson = lessonByPath.get(recentLesson.path);

        if (lesson) {
            fragment.appendChild(createLessonLink(lesson));
        }
    });

    recentList.appendChild(fragment);
}

async function loadLessons() {
    lessonList.innerHTML = '<p class="loading-message">Loading lessons...</p>';

    try {
        const response = await fetch(GITHUB_API, {
            headers: {
                Accept: "application/vnd.github+json"
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API returned ${response.status}`);
        }

        const files = await response.json();

        lessons = files
            .filter(file =>
                file.type === "file" &&
                file.name.toLowerCase().endsWith(".html")
            )
            .map(file => ({
                name: file.name,
                path: file.path,
                title: formatLessonTitle(file.name)
            }))
            .sort((first, second) => first.title.localeCompare(second.title));

        renderLessons(lessons);
        renderRecentLessons();
    } catch (error) {
        console.error("Failed to load lessons:", error);

        lessonList.replaceChildren();

        const message = document.createElement("p");
        message.className = "error-message";
        message.textContent =
            "Unable to load lessons. Check your connection and try again.";

        lessonList.appendChild(message);
        lessonCount.textContent = "";
    }
}

function filterLessons() {
    const keyword = searchInput.value.trim().toLowerCase();

    const filteredLessons = lessons.filter(lesson =>
        lesson.title.toLowerCase().includes(keyword) ||
        lesson.name.toLowerCase().includes(keyword)
    );

    renderLessons(filteredLessons);
}

searchInput.addEventListener("input", filterLessons);

searchInput.form.addEventListener("submit", event => {
    event.preventDefault();
});

document.addEventListener("keydown", event => {
    const isTyping = ["INPUT", "TEXTAREA"].includes(
        document.activeElement.tagName
    );

    if (event.key === "/" && !isTyping) {
        event.preventDefault();
        searchInput.focus();
    }

    if (event.key === "Escape" && document.activeElement === searchInput) {
        searchInput.value = "";
        filterLessons();
        searchInput.blur();
    }
});

loadLessons();
