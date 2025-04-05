document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');
    const descriptionInput = document.getElementById('description');
    const logWorkButton = document.getElementById('log-work');
    const decreaseTimeButton = document.getElementById('decrease-time');
    const increaseTimeButton = document.getElementById('increase-time');
    const workHistory = document.getElementById('work-history');

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

    // Log work functionality
    logWorkButton.addEventListener('click', () => {
        const date = dateInput.value;
        const time = timeInput.value;
        const description = descriptionInput.value.trim();

        if (!date || !time || !description) {
            alert('Please fill in all fields');
            return;
        }

        // Create new work entry
        const workEntry = document.createElement('div');
        workEntry.className = 'work-entry';

        // Format date to be more readable
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        workEntry.innerHTML = `
            <div>${formattedDate}</div>
            <div>${time} hours</div>
            <div>${description}</div>
        `;

        // Add new entry at the top of the history
        workHistory.insertBefore(workEntry, workHistory.firstChild);

        // Clear the form
        descriptionInput.value = '';
        timeInput.value = '0';
    });
}); 