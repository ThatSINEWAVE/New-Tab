document.addEventListener("DOMContentLoaded", () => {
    // Existing elements
    const searchBox = document.getElementById("searchBox");
    const settingsBtn = document.getElementById("settingsBtn");
    const dropdown = document.getElementById("dropdown");
    const searchEngineRadios = document.querySelectorAll('input[name="searchEngine"]');
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    const clockElement = document.getElementById("clock");
    const themeStylesheet = document.getElementById("themeStylesheet");
    const favoritesBar = document.getElementById("favoritesBar");

    // Default favorites
    const defaultFavorites = [
        { name: 'GitHub', url: 'https://github.com' },
        { name: 'YouTube', url: 'https://youtube.com' },
        { name: 'Reddit', url: 'https://reddit.com' },
        { name: 'Twitter', url: 'https://twitter.com' },
        { name: 'Wikipedia', url: 'https://wikipedia.org' }
    ];

    // Load saved settings
    function loadSavedSettings() {
        const savedEngine = localStorage.getItem("searchEngine") || "google";
        document.querySelector(`input[name="searchEngine"][value="${savedEngine}"]`).checked = true;

        const savedTheme = localStorage.getItem("theme") || "default";
        document.querySelector(`input[name="theme"][value="${savedTheme}"]`).checked = true;
        applyTheme(savedTheme);

        if (!localStorage.getItem("searchEngine")) {
            localStorage.setItem("searchEngine", "google");
        }
        if (!localStorage.getItem("theme")) {
            localStorage.setItem("theme", "default");
        }
    }

    // Settings dropdown toggle
    settingsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
        if (!settingsBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove("show");
        }
    });

    // Search engine persistence
    searchEngineRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            localStorage.setItem("searchEngine", radio.value);
        });
    });

    // Theme handling
    themeRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            const theme = radio.value;
            localStorage.setItem("theme", theme);
            applyTheme(theme);
        });
    });

    function applyTheme(theme) {
        themeStylesheet.href = `themes/${theme}.css`;
        document.body.className = `theme-${theme}`;
    }

    // Search functionality
    searchBox.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const query = searchBox.value.trim();
            if (!query) return;

            const engine = document.querySelector('input[name="searchEngine"]:checked').value;
            const engines = {
                google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
                bing: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
                duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
                brave: `https://search.brave.com/search?q=${encodeURIComponent(query)}`
            };
            window.location.href = engines[engine] || engines.google;
        }
    });

    // Clock
    function updateClock() {
        const now = new Date();
        clockElement.textContent = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Favorites system
    function loadFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || defaultFavorites;
        favoritesBar.innerHTML = '';

        favorites.forEach((fav, index) => {
            const favElement = document.createElement('div');
            favElement.className = 'favorite-item';

            try {
                const url = new URL(fav.url);
                favElement.innerHTML = `
                    <button class="edit-favorite" data-index="${index}">•••</button>
                    <a href="${fav.url}" target="_blank" class="favorite-link">
                        <img src="https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64"
                             alt="${fav.name}"
                             class="favorite-icon">
                    </a>
                    <span class="favorite-name">${fav.name}</span>
                `;
            } catch {
                favElement.innerHTML = `
                    <button class="edit-favorite" data-index="${index}">•••</button>
                    <div class="favorite-link invalid">
                        <span>!</span>
                    </div>
                    <span class="favorite-name">Invalid</span>
                `;
            }

            favoritesBar.appendChild(favElement);
        });
    }

    function handleEditFavorite(e) {
        if (!e.target.classList.contains('edit-favorite')) return;

        const index = e.target.dataset.index;
        const favorites = JSON.parse(localStorage.getItem('favorites')) || defaultFavorites;
        const current = favorites[index];

        // Edit name
        const newName = prompt('Edit site name:', current.name);
        if (newName === null) return;

        // Edit URL
        const newUrl = prompt('Edit site URL:', current.url);
        if (newUrl === null) return;

        try {
            const url = new URL(newUrl);
            favorites[index] = {
                name: newName.trim() || url.hostname.replace('www.', ''),
                url: newUrl
            };
            localStorage.setItem('favorites', JSON.stringify(favorites));
            loadFavorites();
        } catch {
            alert('Invalid URL format! Please include http:// or https://');
        }
    }

    // Initialize favorites
    if (!localStorage.getItem('favorites')) {
        localStorage.setItem('favorites', JSON.stringify(defaultFavorites));
    }
    loadFavorites();
    favoritesBar.addEventListener('click', handleEditFavorite);

    // Initial setup
    loadSavedSettings();
});