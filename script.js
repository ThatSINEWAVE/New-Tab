document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const searchBox = document.getElementById("searchBox");
    const settingsBtn = document.getElementById("settingsBtn");
    const dropdown = document.getElementById("dropdown");
    const searchEngineRadios = document.querySelectorAll('input[name="searchEngine"]');
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    const clockElement = document.getElementById("clock");
    const themeStylesheet = document.getElementById("themeStylesheet");
    const favoritesBar = document.getElementById("favoritesBar");
    const frequentItems = document.getElementById("frequentItems");
    const frequentSearchesElement = document.querySelector(".frequent-searches");
    const favoritesContainerElement = document.querySelector(".favorites-container");

    // Default Configuration
    const defaultFavorites = [{
            name: 'GitHub',
            url: 'https://github.com'
        },
        {
            name: 'YouTube',
            url: 'https://youtube.com'
        },
        {
            name: 'Reddit',
            url: 'https://reddit.com'
        },
        {
            name: 'Twitter',
            url: 'https://twitter.com'
        },
        {
            name: 'Wikipedia',
            url: 'https://wikipedia.org'
        },
        {
            name: 'Google',
            url: 'https://google.com'
        }
    ];

    // Force reset favorites for existing users
    if (!localStorage.getItem('favorites')) {
        localStorage.setItem('favorites', JSON.stringify(defaultFavorites));
    } else {
        const existingFavorites = JSON.parse(localStorage.getItem('favorites'));
        if (existingFavorites.length < 6) {
            localStorage.setItem('favorites', JSON.stringify(defaultFavorites));
        }
    }

    // Settings Management
    function loadSavedSettings() {
        // Search Engine
        const savedEngine = localStorage.getItem("searchEngine") || "google";
        document.querySelector(`input[name="searchEngine"][value="${savedEngine}"]`).checked = true;

        // Theme
        const savedTheme = localStorage.getItem("theme") || "default";
        document.querySelector(`input[name="theme"][value="${savedTheme}"]`).checked = true;
        applyTheme(savedTheme);

        // Visibility Settings
        const visibilities = ['clock', 'frequent', 'favorites'];
        visibilities.forEach(section => {
            const savedVisibility = localStorage.getItem(`${section}Visibility`) || "shown";
            document.querySelector(`input[name="${section}Visibility"][value="${savedVisibility}"]`).checked = true;
            applyVisibility(section, savedVisibility);
        });

        // Initialize defaults if missing
        if (!localStorage.getItem("searchEngine")) {
            localStorage.setItem("searchEngine", "google");
        }
        if (!localStorage.getItem("theme")) {
            localStorage.setItem("theme", "default");
        }
        visibilities.forEach(section => {
            if (!localStorage.getItem(`${section}Visibility`)) {
                localStorage.setItem(`${section}Visibility`, "shown");
            }
        });
    }

    function applyVisibility(section, visibility) {
        const elements = {
            clock: clockElement,
            frequent: frequentSearchesElement,
            favorites: favoritesContainerElement
        };

        if (visibility === "hidden") {
            elements[section].classList.add('hidden');
            // Adjust margins when hiding
            if (section === 'favorites') {
                frequentSearchesElement.style.marginBottom = '15px';
            }
        } else {
            elements[section].classList.remove('hidden');
            // Reset margins when showing
            if (section === 'favorites') {
                frequentSearchesElement.style.marginBottom = '';
            }
        }

        // Force reflow to trigger animations
        void elements[section].offsetHeight;
    }

    // Settings Panel Interactions
    settingsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
        if (!settingsBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove("show");
        }
    });

    // Search Engine Persistence
    searchEngineRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            localStorage.setItem("searchEngine", radio.value);
        });
    });

    // Theme Management
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

    // Visibility Toggles
    document.querySelectorAll('input[name^="clock"], input[name^="frequent"], input[name^="favorites"]').forEach(radio => {
        radio.addEventListener("change", (e) => {
            const section = e.target.name.replace("Visibility", "");
            localStorage.setItem(`${section}Visibility`, e.target.value);
            applyVisibility(section, e.target.value);
        });
    });

    // Search Functionality
    searchBox.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const query = searchBox.value.trim();
            if (!query) return;

            updateFrequentSearches(query);

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

    // Clock System
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

    // Favorites System
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

        const newName = prompt('Edit site name:', current.name);
        if (newName === null) return;

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

    // Frequent Searches System
    const MAX_FREQUENT = 3;

    function updateFrequentSearches(query) {
        let searches = JSON.parse(localStorage.getItem('frequentSearches')) || [];
        searches = searches.filter(item => item !== query);
        searches.unshift(query);
        searches = searches.slice(0, MAX_FREQUENT);
        localStorage.setItem('frequentSearches', JSON.stringify(searches));
        renderFrequentSearches();
    }

    function renderFrequentSearches() {
        const searches = JSON.parse(localStorage.getItem('frequentSearches')) || [];
        frequentItems.innerHTML = searches.length > 0 ?
            searches.map(search => `<div class="frequent-item">${search}</div>`).join('') :
            `<div class="no-searches-message">Your frequent searches will appear here,<br>search for something to get started!</div>`;
    }

    function handleFrequentSearch(e) {
        if (!e.target.classList.contains('frequent-item')) return;

        const query = e.target.textContent;
        updateFrequentSearches(query);

        const engine = document.querySelector('input[name="searchEngine"]:checked').value;
        const engines = {
            google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            bing: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
            duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
            brave: `https://search.brave.com/search?q=${encodeURIComponent(query)}`
        };
        window.location.href = engines[engine] || engines.google;
    }

    // Initialization
    if (!localStorage.getItem('favorites')) {
        localStorage.setItem('favorites', JSON.stringify(defaultFavorites));
    }
    loadFavorites();
    favoritesBar.addEventListener('click', handleEditFavorite);

    renderFrequentSearches();
    frequentItems.addEventListener('click', handleFrequentSearch);

    loadSavedSettings();
});