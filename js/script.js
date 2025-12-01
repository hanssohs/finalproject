// Seasonal Eats - Enhanced JavaScript with Favorites and Accessibility
// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // ==================== HAMBURGER MENU ====================
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', !isExpanded);
        });
    }
    
    // ==================== FAVORITES SYSTEM ====================
    const FAVORITES_KEY = 'seasonalEatsFavorites';
    
    // Get favorites from localStorage
    function getFavorites() {
        const favorites = localStorage.getItem(FAVORITES_KEY);
        return favorites ? JSON.parse(favorites) : [];
    }
    
    // Save favorites to localStorage
    function saveFavorites(favorites) {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
    
    // Check if recipe is favorited
    function isFavorited(recipeId) {
        const favorites = getFavorites();
        return favorites.includes(recipeId);
    }
    
    // Toggle favorite status
    function toggleFavorite(recipeId) {
        let favorites = getFavorites();
        const index = favorites.indexOf(recipeId);
        
        if (index > -1) {
            // Remove from favorites
            favorites.splice(index, 1);
        } else {
            // Add to favorites
            favorites.push(recipeId);
        }
        
        saveFavorites(favorites);
        updateFavoritesCount();
        return favorites.includes(recipeId);
    }
    
    // Update favorites count display
    function updateFavoritesCount() {
        const favoritesCount = getFavorites().length;
        const countElement = document.getElementById('favorites-count');
        if (countElement) {
            countElement.textContent = favoritesCount;
        }
    }
    
    // Initialize favorite buttons
    function initializeFavoriteButtons() {
        const favoriteButtons = document.querySelectorAll('.favorite-btn');
        
        favoriteButtons.forEach(button => {
            const card = button.closest('.recipe-card');
            const recipeId = card.getAttribute('data-recipe-id');
            
            // Set initial state
            if (isFavorited(recipeId)) {
                button.classList.add('favorited');
                button.querySelector('.heart').textContent = '♥';
            }
            
            // Add click event
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const isNowFavorited = toggleFavorite(recipeId);
                
                if (isNowFavorited) {
                    button.classList.add('favorited');
                    button.querySelector('.heart').textContent = '♥';
                    button.setAttribute('aria-label', button.getAttribute('aria-label').replace('Add', 'Remove') + ' from favorites');
                } else {
                    button.classList.remove('favorited');
                    button.querySelector('.heart').textContent = '♡';
                    button.setAttribute('aria-label', button.getAttribute('aria-label').replace('Remove', 'Add'));
                }
                
                // If showing favorites, re-apply filter
                if (showingFavorites) {
                    applyFilters();
                }
            });
            
            // Keyboard support
            button.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });
    }
    
    // ==================== FILTER FUNCTIONALITY ====================
    const filterButtons = document.querySelectorAll('.filter-btn[data-filter]');
    const timeButtons = document.querySelectorAll('.filter-btn[data-time]');
    const favoritesButton = document.getElementById('show-favorites');
    const recipeCards = document.querySelectorAll('.recipe-card');
    const resultsCount = document.getElementById('results-count');
    
    // Track current filters
    let currentSeasonFilter = 'all';
    let currentTimeFilter = 'all';
    let showingFavorites = false;
    
    // Season filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update ARIA and active states
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-pressed', 'true');
            
            // Update current filter
            currentSeasonFilter = this.getAttribute('data-filter');
            
            // Reset favorites filter if active
            if (showingFavorites) {
                showingFavorites = false;
                favoritesButton.setAttribute('aria-pressed', 'false');
            }
            
            // Apply filters
            applyFilters();
        });
        
        // Keyboard support
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
        });
    });
    
    // Time filter buttons
    timeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update ARIA and active states
            timeButtons.forEach(btn => {
                btn.classList.remove('time-active');
                btn.setAttribute('aria-pressed', 'false');
            });
            this.classList.add('time-active');
            this.setAttribute('aria-pressed', 'true');
            
            // Update current filter
            currentTimeFilter = this.getAttribute('data-time');
            
            // Reset favorites filter if active
            if (showingFavorites) {
                showingFavorites = false;
                favoritesButton.setAttribute('aria-pressed', 'false');
            }
            
            // Apply filters
            applyFilters();
        });
        
        // Keyboard support
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
        });
    });
    
    // Favorites filter button
    if (favoritesButton) {
        favoritesButton.addEventListener('click', function() {
            showingFavorites = !showingFavorites;
            this.setAttribute('aria-pressed', showingFavorites ? 'true' : 'false');
            
            if (showingFavorites) {
                // Reset other filters
                currentSeasonFilter = 'all';
                currentTimeFilter = 'all';
                
                filterButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                });
                filterButtons[0].classList.add('active');
                filterButtons[0].setAttribute('aria-pressed', 'true');
                
                timeButtons.forEach(btn => {
                    btn.classList.remove('time-active');
                    btn.setAttribute('aria-pressed', 'false');
                });
                timeButtons[0].classList.add('time-active');
                timeButtons[0].setAttribute('aria-pressed', 'true');
            }
            
            applyFilters();
        });
        
        // Keyboard support
        favoritesButton.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                favoritesButton.click();
            }
        });
    }
    
    // Function to apply filters
    function applyFilters() {
        let visibleCount = 0;
        const favorites = getFavorites();
        
        recipeCards.forEach(card => {
            const cardSeason = card.getAttribute('data-season');
            const cardTime = card.getAttribute('data-time');
            const recipeId = card.getAttribute('data-recipe-id');
            
            let shouldShow = false;
            
            if (showingFavorites) {
                // Only show favorited recipes
                shouldShow = favorites.includes(recipeId);
            } else {
                // Check if card matches both filters
                const matchesSeason = currentSeasonFilter === 'all' || cardSeason === currentSeasonFilter;
                const matchesTime = currentTimeFilter === 'all' || cardTime === currentTimeFilter;
                shouldShow = matchesSeason && matchesTime;
            }
            
            if (shouldShow) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });
        
        // Update results count
        updateResultsCount(visibleCount);
    }
    
    // Function to update results count text
    function updateResultsCount(count) {
        let filterText = '';
        
        if (showingFavorites) {
            filterText = `Showing My Favorites (${count})`;
        } else if (currentSeasonFilter === 'all' && currentTimeFilter === 'all') {
            filterText = 'Showing All Recipes';
        } else {
            filterText = 'Showing ';
            
            if (currentSeasonFilter !== 'all') {
                filterText += currentSeasonFilter.charAt(0).toUpperCase() + currentSeasonFilter.slice(1);
            }
            
            if (currentTimeFilter !== 'all') {
                if (currentSeasonFilter !== 'all') {
                    filterText += ' ';
                }
                filterText += currentTimeFilter === 'weeknight' ? 'Weeknight' : 'Weekend';
            }
            
            filterText += ` Recipes (${count})`;
        }
        
        resultsCount.textContent = filterText;
    }
    
    // ==================== INITIALIZE ====================
    initializeFavoriteButtons();
    updateFavoritesCount();
    
    // Make sure all recipes are visible on load
    recipeCards.forEach(card => card.classList.remove('hidden'));
});
