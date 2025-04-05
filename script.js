document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');
    const descriptionInput = document.getElementById('description');
    const logWorkButton = document.getElementById('log-work');
    const decreaseTimeButton = document.getElementById('decrease-time');
    const increaseTimeButton = document.getElementById('increase-time');
    const workHistory = document.getElementById('work-history');
    const masteryMeterBar = document.getElementById('mastery-meter-bar');
    const totalHoursElement = document.getElementById('total-hours');
    const masteryPercentageElement = document.getElementById('mastery-percentage');
    const masteryTimeProjection = document.getElementById('mastery-time-projection');
    const hoursPerMonthElement = document.getElementById('hours-per-month');
    const hoursPerWeekElement = document.getElementById('hours-per-week');
    const hoursPerDayElement = document.getElementById('hours-per-day');

    // Modal elements
    const editModal = document.getElementById('edit-modal');
    const editDateInput = document.getElementById('edit-date');
    const editTimeInput = document.getElementById('edit-time');
    const editDescriptionInput = document.getElementById('edit-description');
    const editEntryIndexInput = document.getElementById('edit-entry-index');
    const closeModalBtn = document.querySelector('.close');
    const cancelBtn = document.querySelector('.cancel-btn');
    const saveBtn = document.querySelector('.save-btn');

    // Track total hours and entries
    let totalHours = 0;
    const targetHours = 10000;
    let workEntries = []; // Array to store date and hours of each entry

    // Function to update the mastery meter
    function updateMasteryMeter() {
        const percentage = Math.min((totalHours / targetHours) * 100, 100);
        masteryMeterBar.style.width = `${percentage}%`;
        totalHoursElement.textContent = totalHours.toFixed(2);
        masteryPercentageElement.textContent = percentage.toFixed(1);
    }

    // Function to calculate time to mastery based on 30-day average
    function calculateTimeToMastery() {
        // If no entries, return default message
        if (workEntries.length === 0) {
            return {
                projectionText: "<span>not enough data</span>",
                hoursPerMonth: 0,
                hoursPerWeek: 0,
                hoursPerDay: 0
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
                hoursPerWeek: 0,
                hoursPerDay: 0
            };
        }

        // Calculate total hours in the last 30 days
        const recentHours = recentEntries.reduce((total, entry) => total + entry.hours, 0);

        // Calculate averages
        const hoursPerMonth = recentHours;
        const hoursPerWeek = recentHours / (30 / 7);
        const hoursPerDay = recentHours / 30;

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
            hoursPerWeek,
            hoursPerDay
        };
    }

    // Function to update mastery projection
    function updateMasteryProjection() {
        const results = calculateTimeToMastery();
        masteryTimeProjection.innerHTML = `At your current rate, you will achieve mastery in ${results.projectionText}`;

        // Update work rate metrics
        hoursPerMonthElement.textContent = results.hoursPerMonth.toFixed(1);
        hoursPerWeekElement.textContent = results.hoursPerWeek.toFixed(1);
        hoursPerDayElement.textContent = results.hoursPerDay.toFixed(1);
    }

    // Function to recalculate total hours
    function recalculateTotalHours() {
        totalHours = workEntries.reduce((total, entry) => total + entry.hours, 0);
        updateMasteryMeter();
        updateMasteryProjection();
    }

    // Function to render all work entries
    function renderWorkEntries() {
        workHistory.innerHTML = '';
        workEntries.forEach((entry, index) => {
            const workEntry = document.createElement('div');
            workEntry.className = 'work-entry';
            workEntry.dataset.index = index;

            // Format date to be more readable
            const formattedDate = entry.date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            workEntry.innerHTML = `
                <div>${formattedDate}</div>
                <div>${entry.hours} hours</div>
                <div>${entry.description}</div>
                <div class="action-buttons">
                    <button class="edit-btn" data-index="${index}">Edit</button>
                    <button class="delete-btn" data-index="${index}">Delete</button>
                </div>
            `;

            workHistory.appendChild(workEntry);
        });

        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', handleEdit);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });
    }

    // Function to handle edit button click
    function handleEdit(e) {
        const index = parseInt(e.target.dataset.index);
        const entry = workEntries[index];

        // Convert date to YYYY-MM-DD format for input
        const formattedDate = entry.date.toISOString().split('T')[0];

        // Fill the edit form with entry data
        editDateInput.value = formattedDate;
        editTimeInput.value = entry.hours;
        editDescriptionInput.value = entry.description;
        editEntryIndexInput.value = index;

        // Show the modal
        editModal.style.display = 'block';
    }

    // Function to handle delete button click
    function handleDelete(e) {
        if (confirm('Are you sure you want to delete this work entry?')) {
            const index = parseInt(e.target.dataset.index);

            // Remove the entry from the array
            workEntries.splice(index, 1);

            // Recalculate and update the display
            recalculateTotalHours();
            renderWorkEntries();
        }
    }

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    // Time control buttons functionality
    decreaseTimeButton.addEventListener('click', () => {
        const currentValue = parseFloat(timeInput.value);
        if (currentValue > 0) {
            timeInput.value = (currentValue - 0.25).toFixed(2);
        }
    });

    increaseTimeButton.addEventListener('click', () => {
        const currentValue = parseFloat(timeInput.value);
        timeInput.value = (currentValue + 0.25).toFixed(2);
    });

    // Modal functionality
    closeModalBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    cancelBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    saveBtn.addEventListener('click', () => {
        const index = parseInt(editEntryIndexInput.value);
        const date = editDateInput.value;
        const hours = parseFloat(editTimeInput.value);
        const description = editDescriptionInput.value.trim();

        if (!date || isNaN(hours) || hours <= 0 || !description) {
            alert('Please fill in all fields correctly');
            return;
        }

        // Update the entry
        const originalHours = workEntries[index].hours;
        workEntries[index] = {
            date: new Date(date),
            hours: hours,
            description: description
        };

        // Close the modal
        editModal.style.display = 'none';

        // Recalculate and update the display
        recalculateTotalHours();
        renderWorkEntries();
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.style.display = 'none';
        }
    });

    // Log work functionality
    logWorkButton.addEventListener('click', () => {
        const date = dateInput.value;
        const time = parseFloat(timeInput.value);
        const description = descriptionInput.value.trim();

        if (!date || isNaN(time) || time <= 0 || !description) {
            alert('Please fill in all fields');
            return;
        }

        // Create new entry object
        const newEntry = {
            date: new Date(date),
            hours: time,
            description: description
        };

        // Add to entries array
        workEntries.unshift(newEntry); // Add to beginning of array

        // Update total hours
        totalHours += time;

        // Update displays
        updateMasteryMeter();
        updateMasteryProjection();
        renderWorkEntries();

        // Clear the form
        descriptionInput.value = '';
        timeInput.value = '0';
    });

    // Initialize displays
    updateMasteryMeter();
    updateMasteryProjection();
}); 