document.addEventListener("DOMContentLoaded", () => {
    const searchBox = document.getElementById("searchBox");
    const settingsBtn = document.getElementById("settingsBtn");
    const dropdown = document.getElementById("dropdown");
    const searchEngineRadios = document.querySelectorAll('input[name="searchEngine"]');
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    const clockElement = document.getElementById("clock");
    const themeStylesheet = document.getElementById("themeStylesheet");

    // Load saved settings
    loadSavedSettings();

    // Toggle settings dropdown
    settingsBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        dropdown.classList.toggle("show");
    });

    // Close dropdown if clicking outside
    document.addEventListener("click", (event) => {
        if (!settingsBtn.contains(event.target) &&
            !dropdown.contains(event.target)) {
            dropdown.classList.remove("show");
        }
    });

    // Save selected search engine
    searchEngineRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            localStorage.setItem("searchEngine", radio.value);
        });
    });

    // Save and apply selected theme
    themeRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            const selectedTheme = radio.value;
            localStorage.setItem("theme", selectedTheme);
            applyTheme(selectedTheme);
        });
    });

    // Search function
    searchBox.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            const query = searchBox.value.trim();
            if (query === "") return;

            const selectedEngine = document.querySelector('input[name="searchEngine"]:checked').value;
            let searchURL = "";

            switch (selectedEngine) {
                case "google":
                    searchURL = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                    break;
                case "bing":
                    searchURL = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
                    break;
                case "duckduckgo":
                    searchURL = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
                    break;
                case "brave":
                    searchURL = `https://search.brave.com/search?q=${encodeURIComponent(query)}`;
                    break;
                default:
                    searchURL = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            }

            window.location.href = searchURL;
        }
    });

    // Clock function
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        clockElement.textContent = `${hours}:${minutes}:${seconds}`;
    }

    setInterval(updateClock, 1000);
    updateClock();

    // Helper functions
    function loadSavedSettings() {
        // Load saved search engine
        const savedEngine = localStorage.getItem("searchEngine") || "google";
        const engineRadio = document.querySelector(`input[name="searchEngine"][value="${savedEngine}"]`);
        if (engineRadio) engineRadio.checked = true;

        // Load saved theme
        const savedTheme = localStorage.getItem("theme") || "default";
        const themeRadio = document.querySelector(`input[name="theme"][value="${savedTheme}"]`);
        if (themeRadio) themeRadio.checked = true;
        applyTheme(savedTheme);
    }

    function applyTheme(theme) {
        themeStylesheet.href = `themes/${theme}.css`;
        document.body.className = `theme-${theme}`;
    }
});