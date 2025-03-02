document.addEventListener("DOMContentLoaded", () => {
    const searchBox = document.getElementById("searchBox");
    const settingsBtn = document.getElementById("settingsBtn");
    const dropdown = document.getElementById("dropdown");
    const radios = document.querySelectorAll('input[name="searchEngine"]');
    const clockElement = document.getElementById("clock");

    // Load saved search engine
    const savedEngine = localStorage.getItem("searchEngine") || "google";
    document.querySelector(`input[value="${savedEngine}"]`).checked = true;

    // Toggle dropdown menu
    settingsBtn.addEventListener("click", () => {
        dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    });

    // Close dropdown if clicking outside
    document.addEventListener("click", (event) => {
        if (!settingsBtn.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.style.display = "none";
        }
    });

    // Save selected search engine
    radios.forEach(radio => {
        radio.addEventListener("change", () => {
            localStorage.setItem("searchEngine", radio.value);
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
});
