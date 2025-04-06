document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - Core UI
    const themeToggle = document.getElementById('theme-toggle');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const keyboardShortcutsBtn = document.getElementById('keyboard-shortcuts');
    const shortcutsModal = document.getElementById('shortcuts-modal');
    const commandInput = document.getElementById('command-input');
    const commandPalette = document.getElementById('command-palette');

    // DOM Elements - Form and Mastery
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');
    const categorySelect = document.getElementById('category');
    const descriptionInput = document.getElementById('description');
    const tagsInput = document.getElementById('tags-input');
    const tagsDisplay = document.getElementById('tags-display');
    const logWorkButton = document.getElementById('log-work');
    const decreaseTimeButton = document.getElementById('decrease-time');
    const increaseTimeButton = document.getElementById('increase-time');
    const workHistory = document.getElementById('work-history');

    // DOM Elements - Timer
    const timerDisplay = document.getElementById('timer-display');
    const startTimerButton = document.getElementById('start-timer');
    const pauseTimerButton = document.getElementById('pause-timer');
    const stopTimerButton = document.getElementById('stop-timer');

    // DOM Elements - Mastery Progress
    const masteryMeterBar = document.getElementById('mastery-meter-bar');
    const totalHoursElement = document.getElementById('total-hours');
    const masteryPercentageElement = document.getElementById('mastery-percentage');
    const hoursRemainingElement = document.getElementById('hours-remaining');
    const masteryTimeProjection = document.getElementById('mastery-time-projection');
    const hoursPerMonthElement = document.getElementById('hours-per-month');
    const hoursPerWeekElement = document.getElementById('hours-per-week');

    // DOM Elements - History and Analytics
    const searchEntriesInput = document.getElementById('search-entries');
    const filterCategorySelect = document.getElementById('filter-category');

    // DOM Elements - Modals
    const editModal = document.getElementById('edit-modal');
    const editDateInput = document.getElementById('edit-date');
    const editTimeInput = document.getElementById('edit-time');
    const editCategorySelect = document.getElementById('edit-category');
    const editDescriptionInput = document.getElementById('edit-description');
    const editTagsInput = document.getElementById('edit-tags-input');
    const editTagsDisplay = document.getElementById('edit-tags-display');
    const editEntryIndexInput = document.getElementById('edit-entry-index');
    const closeButtons = document.querySelectorAll('.close-button');
    const cancelButtons = document.querySelectorAll('.cancel-btn');
    const saveButton = document.querySelector('.save-btn');

    // DOM Elements - Import/Export
    const exportDataButton = document.getElementById('export-data');
    const importDataButton = document.getElementById('import-data');
    const clearDataButton = document.getElementById('clear-data');

    // Application State
    let workEntries = [];
    let totalHours = 0;
    const targetHours = 10000;
    let currentTags = [];
    let editTags = [];
    let timerInterval = null;
    let timerSeconds = 0;
    let timerRunning = false;
    const defaultCategories = ['coding', 'learning', 'design', 'research', 'meeting', 'other'];
    let categories = [...defaultCategories];

    // ===== Theme Toggle =====
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);

        // Update icon
        if (newTheme === 'dark') {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }

        // Save preference to localStorage
        localStorage.setItem('theme', newTheme);
    }

    // Initialize theme from localStorage
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            if (savedTheme === 'dark') {
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            }
        }
    }

    // ===== Tab Navigation =====
    function switchTab(tabId) {
        // Hide all tab contents
        tabContents.forEach(content => {
            content.classList.remove('active');
        });

        // Deactivate all tab buttons
        tabButtons.forEach(button => {
            button.classList.remove('active');
        });

        // Activate the selected tab
        document.getElementById(`${tabId}-tab`).classList.add('active');
        document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('active');
    }

    // ===== Timer Functionality =====
    function startTimer() {
        if (timerRunning) return;

        timerRunning = true;
        startTimerButton.disabled = true;
        pauseTimerButton.disabled = false;
        stopTimerButton.disabled = false;

        timerInterval = setInterval(() => {
            timerSeconds++;
            updateTimerDisplay();
        }, 1000);
    }

    function pauseTimer() {
        if (!timerRunning) return;

        timerRunning = false;
        clearInterval(timerInterval);

        startTimerButton.disabled = false;
        pauseTimerButton.disabled = true;
    }

    function stopTimer() {
        if (!timerInterval && timerSeconds === 0) return;

        timerRunning = false;
        clearInterval(timerInterval);

        // Convert seconds to hours and update the time input
        const hours = timerSeconds / 3600;
        timeInput.value = parseFloat(timeInput.value || 0) + hours;

        // Reset timer
        timerSeconds = 0;
        updateTimerDisplay();

        // Reset buttons
        startTimerButton.disabled = false;
        pauseTimerButton.disabled = true;
        stopTimerButton.disabled = true;
    }

    function updateTimerDisplay() {
        const hours = Math.floor(timerSeconds / 3600);
        const minutes = Math.floor((timerSeconds % 3600) / 60);
        const seconds = timerSeconds % 60;

        timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // ===== Tags Functionality =====
    function addTag(tagContainer, tagsArray, tagText) {
        if (!tagText) return;

        // Split by comma and process each tag
        const newTags = tagText.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag && !tagsArray.includes(tag));

        // Add new tags to the array and display
        newTags.forEach(tag => {
            if (tag && !tagsArray.includes(tag)) {
                tagsArray.push(tag);

                const tagElement = document.createElement('span');
                tagElement.className = 'tag';
                tagElement.innerHTML = `
                    ${tag}
                    <button class="tag-remove" data-tag="${tag}">×</button>
                `;
                tagContainer.appendChild(tagElement);
            }
        });

        // Clear input
        return '';
    }

    function removeTag(tagContainer, tagsArray, tagText) {
        const index = tagsArray.indexOf(tagText);
        if (index > -1) {
            tagsArray.splice(index, 1);
            renderTags(tagContainer, tagsArray);
        }
    }

    function renderTags(tagContainer, tagsArray) {
        tagContainer.innerHTML = '';
        tagsArray.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.innerHTML = `
                ${tag}
                <button class="tag-remove" data-tag="${tag}">×</button>
            `;
            tagContainer.appendChild(tagElement);
        });
    }

    // ===== Mastery Tracking =====
    function updateMasteryMeter() {
        const percentage = Math.min((totalHours / targetHours) * 100, 100);
        masteryMeterBar.style.width = `${percentage}%`;
        totalHoursElement.textContent = totalHours.toFixed(2);
        masteryPercentageElement.textContent = `${percentage.toFixed(1)}%`;
        hoursRemainingElement.textContent = Math.max(0, targetHours - totalHours).toFixed(2);
    }

    function calculateTimeToMastery() {
        // If no entries, return default message
        if (workEntries.length === 0) {
            return {
                projectionText: "<span>not enough data</span>",
                hoursPerMonth: 0,
                hoursPerWeek: 0
            };
        }

        const currentDate = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Filter entries from the last 30 days
        const recentEntries = workEntries.filter(entry => {
            return entry.date >= thirtyDaysAgo && entry.date <= currentDate;
        });

        // If no recent entries, return default message
        if (recentEntries.length === 0) {
            return {
                projectionText: "<span>not enough recent data</span>",
                hoursPerMonth: 0,
                hoursPerWeek: 0
            };
        }

        // Calculate total hours in the last 30 days
        const recentHours = recentEntries.reduce((total, entry) => total + entry.hours, 0);

        // Calculate averages
        const hoursPerMonth = recentHours;
        const hoursPerWeek = recentHours / (30 / 7);

        // Calculate daily average
        const dailyAverage = recentHours / 30;

        // Calculate hours remaining
        const hoursRemaining = Math.max(targetHours - totalHours, 0);

        // Calculate days to mastery
        const daysToMastery = dailyAverage > 0 ? hoursRemaining / dailyAverage : Infinity;

        // Convert to years with 1 decimal place
        const yearsToMastery = daysToMastery / 365;

        let projectionText;
        if (yearsToMastery === Infinity || isNaN(yearsToMastery)) {
            projectionText = "<span>not enough progress yet</span>";
        } else if (yearsToMastery <= 0) {
            projectionText = "<span>achieved!</span>";
        } else {
            projectionText = `<span>${yearsToMastery.toFixed(1)} years</span>`;
        }

        return {
            projectionText,
            hoursPerMonth,
            hoursPerWeek
        };
    }

    function updateMasteryProjection() {
        const results = calculateTimeToMastery();
        masteryTimeProjection.innerHTML = `At your current rate, you will achieve mastery in ${results.projectionText}`;

        // Update work rate metrics
        hoursPerMonthElement.textContent = results.hoursPerMonth.toFixed(1);
        hoursPerWeekElement.textContent = results.hoursPerWeek.toFixed(1);
    }

    // ===== Work Entry Management =====
    function addWorkEntry() {
        const date = dateInput.value;
        const hours = parseFloat(timeInput.value);
        const category = categorySelect.value;
        const description = descriptionInput.value.trim();
        const tags = [...currentTags];

        if (!date || isNaN(hours) || hours <= 0 || !description) {
            alert('Please fill in all required fields');
            return;
        }

        // Create new entry
        const newEntry = {
            id: Date.now().toString(), // Unique ID based on timestamp
            date: new Date(date),
            hours,
            category,
            description,
            tags
        };

        // Add to beginning of array
        workEntries.unshift(newEntry);

        // Update total hours
        totalHours += hours;

        // Update displays
        updateMasteryMeter();
        updateMasteryProjection();
        renderWorkEntries();

        // Clear the form
        resetForm();

        // Save to localStorage
        saveToLocalStorage();

        // Update chart data if on analytics tab
        if (document.getElementById('analytics-tab').classList.contains('active')) {
            updateCharts();
        }
    }

    function deleteWorkEntry(id) {
        const index = workEntries.findIndex(entry => entry.id === id);

        if (index !== -1) {
            // Subtract hours from total
            totalHours -= workEntries[index].hours;
            if (totalHours < 0) totalHours = 0;

            // Remove entry
            workEntries.splice(index, 1);

            // Update displays
            updateMasteryMeter();
            updateMasteryProjection();
            renderWorkEntries();

            // Save to localStorage
            saveToLocalStorage();

            // Update chart data if on analytics tab
            if (document.getElementById('analytics-tab').classList.contains('active')) {
                updateCharts();
            }
        }
    }

    function editWorkEntry(id) {
        const entry = workEntries.find(entry => entry.id === id);

        if (entry) {
            // Convert date to YYYY-MM-DD format for input
            const formattedDate = entry.date.toISOString().split('T')[0];

            // Reset edit tags
            editTags = [...entry.tags];

            // Fill the edit form with entry data
            editDateInput.value = formattedDate;
            editTimeInput.value = entry.hours;
            editCategorySelect.value = entry.category;
            editDescriptionInput.value = entry.description;
            renderTags(editTagsDisplay, editTags);
            editEntryIndexInput.value = id;

            // Show the modal
            editModal.style.display = 'block';
        }
    }

    function saveEditedEntry() {
        const id = editEntryIndexInput.value;
        const date = editDateInput.value;
        const hours = parseFloat(editTimeInput.value);
        const category = editCategorySelect.value;
        const description = editDescriptionInput.value.trim();

        if (!date || isNaN(hours) || hours <= 0 || !description) {
            alert('Please fill in all required fields');
            return;
        }

        const index = workEntries.findIndex(entry => entry.id === id);

        if (index !== -1) {
            // Adjust total hours
            totalHours = totalHours - workEntries[index].hours + hours;

            // Update entry
            workEntries[index] = {
                ...workEntries[index],
                date: new Date(date),
                hours,
                category,
                description,
                tags: [...editTags]
            };

            // Update displays
            updateMasteryMeter();
            updateMasteryProjection();
            renderWorkEntries();

            // Close the modal
            editModal.style.display = 'none';

            // Save to localStorage
            saveToLocalStorage();

            // Update chart data if on analytics tab
            if (document.getElementById('analytics-tab').classList.contains('active')) {
                updateCharts();
            }
        }
    }

    function renderWorkEntries() {
        // Get filter values
        const searchText = searchEntriesInput ? searchEntriesInput.value.toLowerCase() : '';
        const categoryFilter = filterCategorySelect ? filterCategorySelect.value : '';

        // Filter entries
        let filteredEntries = [...workEntries];

        if (searchText) {
            filteredEntries = filteredEntries.filter(entry =>
                entry.description.toLowerCase().includes(searchText) ||
                (entry.category && entry.category.toLowerCase().includes(searchText)) ||
                entry.tags.some(tag => tag.toLowerCase().includes(searchText))
            );
        }

        if (categoryFilter) {
            filteredEntries = filteredEntries.filter(entry => entry.category === categoryFilter);
        }

        // Clear table
        workHistory.innerHTML = '';

        // Render entries
        filteredEntries.forEach(entry => {
            const row = document.createElement('tr');

            // Format date
            const formattedDate = formatDate(entry.date);

            // Format tags
            const tagsHtml = entry.tags.length
                ? entry.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')
                : '';

            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${entry.hours}</td>
                <td>${entry.category || ''}</td>
                <td>${entry.description}</td>
                <td>${tagsHtml}</td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-btn" data-id="${entry.id}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" data-id="${entry.id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;

            workHistory.appendChild(row);
        });

        // Add event listeners to buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editWorkEntry(btn.dataset.id));
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this entry?')) {
                    deleteWorkEntry(btn.dataset.id);
                }
            });
        });
    }

    function resetForm() {
        // Keep the date but reset other fields
        timeInput.value = '0';
        descriptionInput.value = '';
        currentTags = [];
        tagsDisplay.innerHTML = '';
    }

    // ===== Category Management =====
    function populateCategorySelects() {
        // Clear options except first one
        while (categorySelect.options.length > 1) {
            categorySelect.remove(1);
        }

        while (editCategorySelect.options.length > 1) {
            editCategorySelect.remove(1);
        }

        if (filterCategorySelect) {
            while (filterCategorySelect.options.length > 1) {
                filterCategorySelect.remove(1);
            }
        }

        // Add categories
        categories.forEach(category => {
            const option1 = document.createElement('option');
            option1.value = category;
            option1.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            categorySelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = category;
            option2.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            editCategorySelect.appendChild(option2);

            if (filterCategorySelect) {
                const option3 = document.createElement('option');
                option3.value = category;
                option3.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                filterCategorySelect.appendChild(option3);
            }
        });
    }

    // ===== Date Formatting =====
    function formatDate(dateObj) {
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // ===== Set today's date =====
    function setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    // ===== Time Control Buttons =====
    function setupTimeControls() {
        decreaseTimeButton.addEventListener('click', () => {
            const currentValue = parseFloat(timeInput.value) || 0;
            if (currentValue >= 0.25) {
                timeInput.value = (currentValue - 0.25).toFixed(2);
            }
        });

        increaseTimeButton.addEventListener('click', () => {
            const currentValue = parseFloat(timeInput.value) || 0;
            timeInput.value = (currentValue + 0.25).toFixed(2);
        });
    }

    // ===== Initialize Application =====
    function initApp() {
        // Set today's date
        setTodayDate();

        // Setup theme
        initTheme();

        // Initialize timer display
        updateTimerDisplay();

        // Load data from localStorage
        loadFromLocalStorage();

        // Setup time controls
        setupTimeControls();

        // Populate category selects
        populateCategorySelects();

        // Setup event listeners
        setupEventListeners();
    }

    // ===== Event Listeners =====
    function setupEventListeners() {
        // Theme toggle
        themeToggle.addEventListener('click', toggleTheme);

        // Tab navigation
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                switchTab(button.dataset.tab);

                // If switching to analytics tab, update charts
                if (button.dataset.tab === 'analytics') {
                    updateCharts();
                }
            });
        });

        // Timer controls
        startTimerButton.addEventListener('click', startTimer);
        pauseTimerButton.addEventListener('click', pauseTimer);
        stopTimerButton.addEventListener('click', stopTimer);

        // Log work button
        logWorkButton.addEventListener('click', addWorkEntry);

        // Save edited entry
        saveButton.addEventListener('click', saveEditedEntry);

        // Tags input
        tagsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                tagsInput.value = addTag(tagsDisplay, currentTags, tagsInput.value);
            }
        });

        tagsInput.addEventListener('blur', () => {
            tagsInput.value = addTag(tagsDisplay, currentTags, tagsInput.value);
        });

        // Tag removal
        tagsDisplay.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-remove')) {
                removeTag(tagsDisplay, currentTags, e.target.dataset.tag);
            }
        });

        // Edit tags
        if (editTagsInput) {
            editTagsInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    editTagsInput.value = addTag(editTagsDisplay, editTags, editTagsInput.value);
                }
            });

            editTagsInput.addEventListener('blur', () => {
                editTagsInput.value = addTag(editTagsDisplay, editTags, editTagsInput.value);
            });

            editTagsDisplay.addEventListener('click', (e) => {
                if (e.target.classList.contains('tag-remove')) {
                    removeTag(editTagsDisplay, editTags, e.target.dataset.tag);
                }
            });
        }

        // Search and filter
        if (searchEntriesInput) {
            searchEntriesInput.addEventListener('input', renderWorkEntries);
        }

        if (filterCategorySelect) {
            filterCategorySelect.addEventListener('change', renderWorkEntries);
        }

        // Keyboard shortcuts
        keyboardShortcutsBtn.addEventListener('click', () => {
            shortcutsModal.style.display = 'block';
        });

        // Close modals
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                button.closest('.modal').style.display = 'none';
            });
        });

        cancelButtons.forEach(button => {
            button.addEventListener('click', () => {
                button.closest('.modal').style.display = 'none';
            });
        });

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // General keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl + D: Toggle dark mode
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                toggleTheme();
            }

            // Ctrl + 1-3: Switch tabs
            if (e.ctrlKey && e.key >= '1' && e.key <= '3') {
                e.preventDefault();
                const tabIndex = parseInt(e.key) - 1;
                if (tabButtons[tabIndex]) {
                    switchTab(tabButtons[tabIndex].dataset.tab);
                }
            }

            // Ctrl + T: Start/pause timer
            if (e.ctrlKey && e.key === 't') {
                e.preventDefault();
                if (timerRunning) {
                    pauseTimer();
                } else {
                    startTimer();
                }
            }

            // Ctrl + Enter: Submit form
            if (e.ctrlKey && e.key === 'Enter') {
                if (document.getElementById('log-tab').classList.contains('active')) {
                    addWorkEntry();
                }
            }

            // Escape: Close modals
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(modal => {
                    if (modal.style.display === 'block') {
                        modal.style.display = 'none';
                    }
                });

                if (commandPalette.style.display === 'block') {
                    commandPalette.style.display = 'none';
                }
            }
        });

        // Import/Export
        if (exportDataButton) {
            exportDataButton.addEventListener('click', exportData);
        }

        if (importDataButton) {
            importDataButton.addEventListener('click', importData);
        }

        if (clearDataButton) {
            clearDataButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                    clearData();
                }
            });
        }
    }

    // ===== Data Import/Export =====
    function exportData() {
        const data = {
            workEntries,
            totalHours,
            categories,
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `mastery-app-data-${new Date().toISOString().slice(0, 10)}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    function importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = readerEvent => {
                try {
                    const content = readerEvent.target.result;
                    const data = JSON.parse(content);

                    if (data.workEntries && Array.isArray(data.workEntries)) {
                        if (confirm('This will replace your current data. Continue?')) {
                            // Convert date strings back to Date objects
                            workEntries = data.workEntries.map(entry => ({
                                ...entry,
                                date: new Date(entry.date)
                            }));

                            totalHours = data.totalHours || 0;
                            categories = data.categories || [...defaultCategories];

                            // Update displayed data
                            updateMasteryMeter();
                            updateMasteryProjection();
                            populateCategorySelects();
                            renderWorkEntries();

                            // Save to localStorage
                            saveToLocalStorage();

                            alert('Data imported successfully!');
                        }
                    } else {
                        alert('Invalid data format');
                    }
                } catch (error) {
                    alert('Error parsing file');
                    console.error(error);
                }
            };

            reader.readAsText(file);
        };

        input.click();
    }

    function clearData() {
        workEntries = [];
        totalHours = 0;
        categories = [...defaultCategories];

        // Update displayed data
        updateMasteryMeter();
        updateMasteryProjection();
        populateCategorySelects();
        renderWorkEntries();

        // Save to localStorage
        saveToLocalStorage();

        alert('All data has been cleared.');
    }

    // ===== Local Storage =====
    function saveToLocalStorage() {
        const data = {
            workEntries,
            totalHours,
            categories
        };
        localStorage.setItem('masteryAppData', JSON.stringify(data));
    }

    function loadFromLocalStorage() {
        const savedData = localStorage.getItem('masteryAppData');
        if (savedData) {
            const data = JSON.parse(savedData);

            // Convert date strings back to Date objects
            if (data.workEntries) {
                workEntries = data.workEntries.map(entry => ({
                    ...entry,
                    date: new Date(entry.date)
                }));
                totalHours = data.totalHours || 0;
                categories = data.categories || [...defaultCategories];

                // Update displayed data
                updateMasteryMeter();
                updateMasteryProjection();
                populateCategorySelects();
                renderWorkEntries();
            }
        }
    }

    // ===== Analytics and Charts =====
    function updateCharts() {
        updateCategoryChart();
        updateWeeklyChart();
        updateHeatmap();
        updateInsights();
    }

    function updateCategoryChart() {
        const ctx = document.getElementById('category-chart');

        // If chart already exists, destroy it
        if (window.categoryChart) {
            window.categoryChart.destroy();
        }

        // Get category data
        const categoryData = {};
        workEntries.forEach(entry => {
            const category = entry.category || 'Uncategorized';
            categoryData[category] = (categoryData[category] || 0) + entry.hours;
        });

        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);

        // Generate colors
        const backgroundColors = labels.map((_, index) => {
            const hue = (index * 137) % 360; // Golden angle approximation for nice distribution
            return `hsl(${hue}, 70%, 60%)`;
        });

        // Create chart
        window.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value.toFixed(1)} hours (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    function updateWeeklyChart() {
        const ctx = document.getElementById('weekly-chart');

        // If chart already exists, destroy it
        if (window.weeklyChart) {
            window.weeklyChart.destroy();
        }

        // Get last 4 weeks of data
        const today = new Date();
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

        // Initialize weeks array (4 weeks)
        const weeks = [];
        for (let i = 0; i < 4; i++) {
            const weekStart = new Date(fourWeeksAgo);
            weekStart.setDate(weekStart.getDate() + (i * 7));
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);

            weeks.push({
                start: weekStart,
                end: weekEnd,
                label: `Week ${i + 1}`,
                hours: 0
            });
        }

        // Calculate hours for each week
        workEntries.forEach(entry => {
            weeks.forEach(week => {
                if (entry.date >= week.start && entry.date <= week.end) {
                    week.hours += entry.hours;
                }
            });
        });

        // Create chart
        window.weeklyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: weeks.map(w => w.label),
                datasets: [{
                    label: 'Hours',
                    data: weeks.map(w => w.hours),
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--chart-grid')
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    function updateHeatmap() {
        const heatmapContainer = document.getElementById('heatmap-container');
        heatmapContainer.innerHTML = '';

        // Create month labels
        const monthsRow = document.createElement('div');
        monthsRow.className = 'heatmap-months';

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        months.forEach(month => {
            const monthLabel = document.createElement('div');
            monthLabel.className = 'heatmap-month-label';
            monthLabel.textContent = month;
            monthsRow.appendChild(monthLabel);
        });

        heatmapContainer.appendChild(monthsRow);

        // Get current year's data
        const currentYear = new Date().getFullYear();
        const startDate = new Date(currentYear, 0, 1); // Jan 1
        const endDate = new Date(currentYear, 11, 31); // Dec 31

        // Create day labels
        const daysRow = document.createElement('div');
        daysRow.className = 'heatmap-days';

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(day => {
            const dayLabel = document.createElement('div');
            dayLabel.className = 'heatmap-day-label';
            dayLabel.textContent = day;
            daysRow.appendChild(dayLabel);
        });

        const heatmapGrid = document.createElement('div');
        heatmapGrid.className = 'heatmap-grid';

        heatmapGrid.appendChild(daysRow);

        // Create day cells for each day of the year
        const hoursPerDay = {};

        // Calculate hours per day - Make sure we check all entries, regardless of date
        workEntries.forEach(entry => {
            const dateKey = entry.date.toISOString().split('T')[0];
            hoursPerDay[dateKey] = (hoursPerDay[dateKey] || 0) + entry.hours;
        });

        // Create grid
        const gridContainer = document.createElement('div');
        gridContainer.className = 'heatmap-cells';

        // Fill in days
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateKey = currentDate.toISOString().split('T')[0];
            const hours = hoursPerDay[dateKey] || 0;

            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            cell.dataset.date = dateKey;
            cell.dataset.hours = hours;

            // Set intensity based on hours (0-5) - Adjust thresholds to be more sensitive
            let intensity = 0;
            if (hours > 0 && hours < 0.5) intensity = 1;
            else if (hours >= 0.5 && hours < 1) intensity = 2;
            else if (hours >= 1 && hours < 2) intensity = 3;
            else if (hours >= 2 && hours < 4) intensity = 4;
            else if (hours >= 4) intensity = 5;

            cell.classList.add(`heatmap-level-${intensity}`);

            // Add tooltip
            cell.title = `${dateKey}: ${hours.toFixed(2)} hours`;

            gridContainer.appendChild(cell);

            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        heatmapGrid.appendChild(gridContainer);
        heatmapContainer.appendChild(heatmapGrid);

        // Remove any existing heatmap styles before adding new ones
        const existingStyle = document.getElementById('heatmap-style');
        if (existingStyle) {
            existingStyle.remove();
        }

        // Add CSS for heatmap with more visible colors
        const heatmapStyle = document.createElement('style');
        heatmapStyle.id = 'heatmap-style';
        heatmapStyle.textContent = `
            .heatmap-grid {
                display: flex;
                margin-top: 10px;
            }
            
            .heatmap-days {
                display: flex;
                flex-direction: column;
                margin-right: 10px;
            }
            
            .heatmap-day-label {
                height: 12px;
                font-size: 9px;
                color: var(--text-secondary);
                text-align: right;
                margin-bottom: 3px;
                padding-top: 2px;
            }
            
            .heatmap-months {
                display: flex;
                justify-content: space-around;
                margin-bottom: 5px;
            }
            
            .heatmap-month-label {
                font-size: 10px;
                color: var(--text-secondary);
            }
            
            .heatmap-cells {
                display: grid;
                grid-template-columns: repeat(53, 12px);
                grid-template-rows: repeat(7, 12px);
                gap: 3px;
            }
            
            .heatmap-cell {
                width: 12px;
                height: 12px;
                background-color: var(--bg-tertiary);
                border-radius: 2px;
            }
            
            /* Light theme colors - more saturated */
            .heatmap-level-0 { background-color: var(--bg-tertiary); }
            .heatmap-level-1 { background-color: #9be9a8; }
            .heatmap-level-2 { background-color: #40c463; }
            .heatmap-level-3 { background-color: #30a14e; }
            .heatmap-level-4 { background-color: #216e39; }
            .heatmap-level-5 { background-color: #00441b; }
            
            /* Dark theme colors - brighter */
            [data-theme="dark"] .heatmap-level-0 { background-color: var(--bg-tertiary); }
            [data-theme="dark"] .heatmap-level-1 { background-color: #0e4429; }
            [data-theme="dark"] .heatmap-level-2 { background-color: #006d32; }
            [data-theme="dark"] .heatmap-level-3 { background-color: #26a641; }
            [data-theme="dark"] .heatmap-level-4 { background-color: #39d353; }
            [data-theme="dark"] .heatmap-level-5 { background-color: #4ae168; }
        `;

        document.head.appendChild(heatmapStyle);

        // Debug log to check if data is being displayed
        console.log('Hours per day:', hoursPerDay);
        console.log('Work entries for heatmap:', workEntries);
    }

    function updateInsights() {
        const trendInsight = document.getElementById('trend-insight');
        const achievementsInsight = document.getElementById('achievements-insight');
        const suggestionsInsight = document.getElementById('suggestions-insight');

        // Calculate recent trend
        if (workEntries.length < 2) {
            trendInsight.textContent = 'Log more entries to see productivity trends.';
        } else {
            // Compare last two weeks
            const today = new Date();
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const twoWeeksAgo = new Date();
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

            const lastWeekEntries = workEntries.filter(entry =>
                entry.date >= oneWeekAgo && entry.date <= today
            );

            const previousWeekEntries = workEntries.filter(entry =>
                entry.date >= twoWeeksAgo && entry.date < oneWeekAgo
            );

            const lastWeekHours = lastWeekEntries.reduce((sum, entry) => sum + entry.hours, 0);
            const previousWeekHours = previousWeekEntries.reduce((sum, entry) => sum + entry.hours, 0);

            if (lastWeekHours > previousWeekHours) {
                const increase = ((lastWeekHours - previousWeekHours) / previousWeekHours * 100).toFixed(0);
                trendInsight.textContent = `Your productivity increased by ${increase}% compared to the previous week.`;
            } else if (lastWeekHours < previousWeekHours) {
                const decrease = ((previousWeekHours - lastWeekHours) / previousWeekHours * 100).toFixed(0);
                trendInsight.textContent = `Your productivity decreased by ${decrease}% compared to the previous week.`;
            } else {
                trendInsight.textContent = `Your productivity remained consistent with the previous week.`;
            }
        }

        // Achievements
        const achievements = [];

        if (totalHours >= 100) achievements.push('Century: 100+ hours logged');
        if (totalHours >= 1000) achievements.push('Milestone: 1,000+ hours logged');
        if (workEntries.length >= 10) achievements.push('Consistent: 10+ entries logged');
        if (workEntries.length >= 50) achievements.push('Dedicated: 50+ entries logged');

        // Check for streak (consecutive days)
        const dates = workEntries.map(entry => entry.date.toISOString().split('T')[0]);
        const uniqueDates = [...new Set(dates)].sort();

        let currentStreak = 1;
        let maxStreak = 1;

        for (let i = 1; i < uniqueDates.length; i++) {
            const prev = new Date(uniqueDates[i - 1]);
            const curr = new Date(uniqueDates[i]);

            const diffTime = Math.abs(curr - prev);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }

        if (maxStreak >= 3) achievements.push(`Streak: ${maxStreak} consecutive days`);

        if (achievements.length > 0) {
            achievementsInsight.innerHTML = achievements.map(a => `<div class="achievement">🏆 ${a}</div>`).join('');
        } else {
            achievementsInsight.textContent = 'Keep logging work to earn achievements!';
        }

        // Suggestions
        const suggestions = [];

        // If not many entries
        if (workEntries.length < 5) {
            suggestions.push('Log your work regularly to build better insights.');
        }

        // If low average hours
        const avgHoursPerEntry = totalHours / workEntries.length;
        if (avgHoursPerEntry < 1 && workEntries.length > 5) {
            suggestions.push('Consider longer, focused work sessions to build deeper skills.');
        }

        // If high variance in categories
        const categoryCount = {};
        workEntries.forEach(entry => {
            const category = entry.category || 'Uncategorized';
            categoryCount[category] = (categoryCount[category] || 0) + 1;
        });

        const categories = Object.keys(categoryCount);
        if (categories.length > 5 && workEntries.length > 10) {
            suggestions.push('You\'re working across many categories. Consider focusing on fewer areas for deeper mastery.');
        }

        // Time to mastery suggestion
        const results = calculateTimeToMastery();
        if (typeof results.projectionText === 'string' && results.projectionText.includes('years')) {
            const yearsMatch = results.projectionText.match(/(\d+\.\d+)/);
            if (yearsMatch && parseFloat(yearsMatch[1]) > 5) {
                suggestions.push('At your current pace, mastery will take several years. Consider increasing your weekly hours.');
            }
        }

        if (suggestions.length > 0) {
            suggestionsInsight.innerHTML = suggestions.map(s => `<div class="suggestion">💡 ${s}</div>`).join('');
        } else {
            suggestionsInsight.textContent = 'Keep up the good work! You\'re on track to mastery.';
        }
    }

    // ===== Initialize Application =====
    initApp();
}); 