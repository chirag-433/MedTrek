// MedTrek Remind - Medicine Reminder App
// Global application state
const AppState = {
    currentUser: null,
    currentScreen: 'dashboard',
    medicines: [],
    reminders: [],
    history: [],
    aiTips: {
        adherence: [
            "Based on your patterns, you tend to miss evening doses. Try setting a dinner reminder!",
            "You're more consistent with morning medications. Consider moving doses to AM when possible.",
            "Your weekend adherence drops by 15%. Set special weekend reminders to stay on track.",
            "Linking medicine time to daily routines improves adherence by 40%. Try pairing with meals."
        ],
        reminder: [
            "Consider taking your morning medication with breakfast for better absorption and routine building.",
            "Place medications next to your toothbrush for a visual reminder during your daily routine.",
            "Use a pill organizer to prepare doses weekly and reduce daily decision fatigue.",
            "Set phone alarms with custom medication names instead of generic 'medicine time' alerts."
        ],
        goal: [
            "You're 5% away from your 90% adherence goal this month. Keep up the great work!",
            "Consistency for 7 days straight unlocks better health outcomes. You're halfway there!",
            "Your current 85% adherence rate is above average. Aim for 90% to maximize benefits.",
            "Three consecutive weeks of 90%+ adherence can improve medication effectiveness significantly."
        ],
        health: [
            "Did you know? Taking medications at consistent times can improve their effectiveness by up to 20%.",
            "Proper hydration helps medication absorption. Drink a full glass of water with each dose.",
            "Never stop medications abruptly without consulting your healthcare provider.",
            "Keeping a medication diary helps doctors optimize your treatment plan."
        ]
    }
};

// Sample data initialization
function initializeSampleData() {
    AppState.medicines = [
        {
            id: 1,
            name: 'Lisinopril',
            dosage: '10mg',
            frequency: 'once-daily',
            times: ['08:00'],
            notes: 'Take with water, can be with or without food'
        },
        {
            id: 2,
            name: 'Metformin',
            dosage: '500mg',
            frequency: 'twice-daily',
            times: ['08:00', '20:00'],
            notes: 'Take with meals to reduce stomach upset'
        },
        {
            id: 3,
            name: 'Vitamin D3',
            dosage: '2000 IU',
            frequency: 'once-daily',
            times: ['08:00'],
            notes: 'Take with fat-containing meal for better absorption'
        }
    ];

    // Generate sample history for the last week
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const today = new Date();
    
    AppState.history = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        AppState.medicines.forEach(medicine => {
            medicine.times.forEach(time => {
                const status = Math.random() > 0.2 ? 'taken' : (Math.random() > 0.5 ? 'missed' : 'late');
                AppState.history.push({
                    id: `${medicine.id}-${date.toDateString()}-${time}`,
                    medicineId: medicine.id,
                    medicineName: medicine.name,
                    dosage: medicine.dosage,
                    scheduledTime: time,
                    actualTime: status === 'taken' ? time : (status === 'late' ? addMinutes(time, 30) : null),
                    date: date.toDateString(),
                    status: status
                });
            });
        });
    }

    generateTodaysReminders();
}

// Helper function to add minutes to time string
function addMinutes(time, minutes) {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins + minutes);
    return date.toTimeString().substring(0, 5);
}

// Generate today's reminders
function generateTodaysReminders() {
    AppState.reminders = [];
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    AppState.medicines.forEach(medicine => {
        medicine.times.forEach(time => {
            const [hours, minutes] = time.split(':').map(Number);
            const reminderTime = hours * 100 + minutes;
            
            // Only show future reminders for today
            if (reminderTime >= currentTime - 60) { // Show if within last hour or future
                AppState.reminders.push({
                    id: `${medicine.id}-${time}`,
                    medicineId: medicine.id,
                    medicineName: medicine.name,
                    dosage: medicine.dosage,
                    time: time,
                    status: reminderTime <= currentTime ? 'due' : 'upcoming',
                    notes: medicine.notes
                });
            }
        });
    });
    
    // Sort by time
    AppState.reminders.sort((a, b) => {
        const timeA = parseInt(a.time.replace(':', ''));
        const timeB = parseInt(b.time.replace(':', ''));
        return timeA - timeB;
    });
}

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeSampleData();
    setupEventListeners();
    updateCurrentDate();
    
    // Check if user is logged in (simulate with a flag)
    if (AppState.currentUser) {
        showScreen('app');
    } else {
        showScreen('login');
    }
});

// Event Listeners Setup
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // Navigation buttons
    const navButtons = document.querySelectorAll('.nav-btn[data-screen]');
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const screen = e.target.closest('.nav-btn').dataset.screen;
            showAppScreen(screen);
        });
    });
    
    // Add medicine form
    const addMedicineForm = document.getElementById('add-medicine-form');
    if (addMedicineForm) {
        addMedicineForm.addEventListener('submit', handleAddMedicine);
    }
    
    // Medicine frequency change
    const frequencySelect = document.getElementById('medicine-frequency');
    if (frequencySelect) {
        frequencySelect.addEventListener('change', updateTimeInputs);
    }
    
    // Initialize the app content
    updateDashboard();
    updateMedicinesDisplay();
    updateHistoryDisplay();
    initializeChart();
}

// Screen Management
function showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenName === 'app' ? 'app-screen' : 'login-screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

function showAppScreen(screenName) {
    AppState.currentScreen = screenName;
    
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeNavBtn = document.querySelector(`.nav-btn[data-screen="${screenName}"]`);
    if (activeNavBtn) {
        activeNavBtn.classList.add('active');
    }
    
    // Hide all app content
    document.querySelectorAll('.app-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show target content
    const targetContent = document.getElementById(screenName);
    if (targetContent) {
        targetContent.classList.add('active');
    }
    
    // Update screen-specific content
    switch (screenName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'medicines':
            updateMedicinesDisplay();
            break;
        case 'history':
            updateHistoryDisplay();
            initializeChart();
            break;
        case 'ai-tips':
            // AI tips are static but could be updated here
            break;
        case 'info':
            // Info is static
            break;
    }
}

// Authentication Functions
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Simulate login (in real app, this would validate credentials)
    AppState.currentUser = {
        email: email,
        name: email.split('@')[0] // Simple name extraction
    };
    
    document.getElementById('user-name').textContent = `Welcome, ${AppState.currentUser.name}`;
    showScreen('app');
    showAppScreen('dashboard');
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    // Simulate signup (in real app, this would create account)
    AppState.currentUser = {
        email: email,
        name: name
    };
    
    document.getElementById('user-name').textContent = `Welcome, ${AppState.currentUser.name}`;
    showScreen('app');
    showAppScreen('dashboard');
}

function logout() {
    AppState.currentUser = null;
    showScreen('login');
}

// Tab Management
function showTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.form-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const targetTab = document.getElementById(`${tabName}-form`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
}

function showHistoryTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.history-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.history-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const targetTab = document.getElementById(`${tabName}-view`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    if (tabName === 'chart') {
        // Reinitialize chart when switching to chart view
        setTimeout(initializeChart, 100);
    }
}

// Dashboard Functions
function updateDashboard() {
    updateAdherenceStats();
    updateRemindersDisplay();
    updateDailyTip();
}

function updateCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', options);
}

function updateAdherenceStats() {
    const thisWeekHistory = AppState.history.filter(entry => {
        const entryDate = new Date(entry.date);
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        return entryDate >= weekStart;
    });
    
    const totalDoses = thisWeekHistory.length;
    const takenDoses = thisWeekHistory.filter(entry => entry.status === 'taken').length;
    const adherencePercentage = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
    
    document.getElementById('adherence-percentage').textContent = `${adherencePercentage}%`;
    document.getElementById('doses-taken').textContent = `${takenDoses}/${totalDoses}`;
}

function updateRemindersDisplay() {
    const remindersList = document.getElementById('reminders-list');
    if (!remindersList) return;
    
    if (AppState.reminders.length === 0) {
        remindersList.innerHTML = `
            <div class="card">
                <div class="card__body">
                    <p class="text-center">No upcoming reminders for today. Great job staying on track!</p>
                </div>
            </div>
        `;
        return;
    }
    
    remindersList.innerHTML = AppState.reminders.map(reminder => `
        <div class="reminder-item">
            <div class="reminder-info">
                <div class="medicine-icon">💊</div>
                <div class="reminder-details">
                    <h4>${reminder.medicineName}</h4>
                    <div class="reminder-time">${formatTime(reminder.time)} - ${reminder.dosage}</div>
                    ${reminder.notes ? `<div class="reminder-notes">${reminder.notes}</div>` : ''}
                </div>
            </div>
            <div class="reminder-actions">
                <button class="btn btn--sm btn--outline" onclick="snoozeReminder('${reminder.id}')">Snooze</button>
                <button class="btn btn--sm btn--secondary" onclick="skipDose('${reminder.id}')">Skip</button>
                <button class="btn btn--sm btn--primary" onclick="confirmDose('${reminder.id}')">Taken</button>
            </div>
        </div>
    `).join('');
}

function updateDailyTip() {
    const tips = [
        "Great job maintaining your schedule this week! Consider setting up medicine near your morning coffee for better routine.",
        "Your consistency is improving! Try using a pill organizer to make daily management easier.",
        "Remember: Taking medications at the same time daily improves effectiveness by up to 20%.",
        "Excellent adherence pattern! Link your evening doses to dinner time for better memory."
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    document.getElementById('daily-tip').textContent = randomTip;
}

// Reminder Actions
function snoozeReminder(reminderId) {
    // In a real app, this would reschedule the reminder
    alert('Reminder snoozed for 10 minutes');
    // Remove from current display temporarily
    AppState.reminders = AppState.reminders.filter(r => r.id !== reminderId);
    updateRemindersDisplay();
}

function skipDose(reminderId) {
    const reminder = AppState.reminders.find(r => r.id === reminderId);
    if (reminder) {
        // Add to history as missed
        AppState.history.push({
            id: `${reminder.medicineId}-${new Date().toDateString()}-${reminder.time}`,
            medicineId: reminder.medicineId,
            medicineName: reminder.medicineName,
            dosage: reminder.dosage,
            scheduledTime: reminder.time,
            actualTime: null,
            date: new Date().toDateString(),
            status: 'missed'
        });
        
        // Remove from reminders
        AppState.reminders = AppState.reminders.filter(r => r.id !== reminderId);
        updateRemindersDisplay();
        
        // Show AI tip for missed dose
        showMissedDoseAITip();
    }
}

function confirmDose(reminderId) {
    const reminder = AppState.reminders.find(r => r.id === reminderId);
    if (reminder) {
        const now = new Date();
        const currentTime = now.toTimeString().substring(0, 5);
        
        // Add to history as taken
        AppState.history.push({
            id: `${reminder.medicineId}-${new Date().toDateString()}-${reminder.time}`,
            medicineId: reminder.medicineId,
            medicineName: reminder.medicineName,
            dosage: reminder.dosage,
            scheduledTime: reminder.time,
            actualTime: currentTime,
            date: new Date().toDateString(),
            status: 'taken'
        });
        
        // Remove from reminders
        AppState.reminders = AppState.reminders.filter(r => r.id !== reminderId);
        updateRemindersDisplay();
        updateAdherenceStats();
        
        alert('Dose confirmed! Keep up the great work!');
    }
}

function showMissedDoseAITip() {
    const tip = "Don't worry about the missed dose! Try setting an additional reminder 30 minutes before your usual time to build a stronger routine.";
    
    // Create temporary notification
    const notification = document.createElement('div');
    notification.className = 'insight-card';
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '1001';
    notification.style.maxWidth = '300px';
    notification.innerHTML = `
        <div class="insight-content">
            <p><strong>AI Tip:</strong> ${tip}</p>
            <button class="btn btn--sm btn--outline" onclick="this.parentElement.parentElement.remove()">Dismiss</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 10000);
}

// Medicine Management
function showAddMedicine() {
    document.getElementById('add-medicine-modal').classList.add('active');
    updateTimeInputs(); // Initialize time inputs
}

function hideAddMedicine() {
    document.getElementById('add-medicine-modal').classList.remove('active');
    document.getElementById('add-medicine-form').reset();
}

function updateTimeInputs() {
    const frequency = document.getElementById('medicine-frequency').value;
    const timeInputsContainer = document.getElementById('time-inputs');
    
    if (!timeInputsContainer) return;
    
    let numInputs = 1;
    switch (frequency) {
        case 'twice-daily':
            numInputs = 2;
            break;
        case 'three-times':
            numInputs = 3;
            break;
        case 'once-daily':
        case 'as-needed':
        default:
            numInputs = 1;
            break;
    }
    
    timeInputsContainer.innerHTML = '';
    for (let i = 0; i < numInputs; i++) {
        const input = document.createElement('input');
        input.type = 'time';
        input.className = 'form-control time-input';
        input.required = true;
        
        // Set default times
        if (i === 0) input.value = '08:00';
        else if (i === 1) input.value = '20:00';
        else if (i === 2) input.value = '14:00';
        
        timeInputsContainer.appendChild(input);
    }
}

function handleAddMedicine(e) {
    e.preventDefault();
    
    const name = document.getElementById('medicine-name').value;
    const dosage = document.getElementById('medicine-dosage').value;
    const frequency = document.getElementById('medicine-frequency').value;
    const notes = document.getElementById('medicine-notes').value;
    
    const timeInputs = document.querySelectorAll('.time-input');
    const times = Array.from(timeInputs).map(input => input.value).filter(time => time);
    
    if (times.length === 0) {
        alert('Please specify at least one time for the medicine.');
        return;
    }
    
    const newMedicine = {
        id: Date.now(), // Simple ID generation
        name,
        dosage,
        frequency,
        times,
        notes
    };
    
    AppState.medicines.push(newMedicine);
    hideAddMedicine();
    updateMedicinesDisplay();
    generateTodaysReminders();
    updateRemindersDisplay();
    
    alert('Medicine added successfully!');
}

function updateMedicinesDisplay() {
    const medicinesList = document.getElementById('medicines-list');
    if (!medicinesList) return;
    
    if (AppState.medicines.length === 0) {
        medicinesList.innerHTML = `
            <div class="card">
                <div class="card__body">
                    <p class="text-center">No medicines added yet. Click "Add Medicine" to get started.</p>
                </div>
            </div>
        `;
        return;
    }
    
    medicinesList.innerHTML = AppState.medicines.map(medicine => `
        <div class="card medicine-card">
            <div class="card__body">
                <div class="medicine-info">
                    <div class="medicine-icon">💊</div>
                    <div class="medicine-details">
                        <h4>${medicine.name}</h4>
                        <div class="medicine-dosage">${medicine.dosage}</div>
                        <div class="medicine-frequency">${formatFrequency(medicine.frequency)} at ${medicine.times.map(formatTime).join(', ')}</div>
                        ${medicine.notes ? `<div class="medicine-notes">${medicine.notes}</div>` : ''}
                    </div>
                </div>
                <div class="medicine-actions">
                    <button class="btn btn--sm btn--outline" onclick="editMedicine(${medicine.id})">Edit</button>
                    <button class="btn btn--sm btn--secondary" onclick="deleteMedicine(${medicine.id})">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function editMedicine(medicineId) {
    alert('Edit functionality would be implemented here');
}

function deleteMedicine(medicineId) {
    if (confirm('Are you sure you want to delete this medicine?')) {
        AppState.medicines = AppState.medicines.filter(med => med.id !== medicineId);
        updateMedicinesDisplay();
        generateTodaysReminders();
        updateRemindersDisplay();
    }
}

// History Functions
function updateHistoryDisplay() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    const sortedHistory = [...AppState.history].sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.scheduledTime);
        const dateB = new Date(b.date + ' ' + b.scheduledTime);
        return dateB - dateA; // Most recent first
    });
    
    historyList.innerHTML = sortedHistory.map(entry => `
        <div class="history-item">
            <div class="history-details">
                <div class="medicine-icon">💊</div>
                <div>
                    <strong>${entry.medicineName}</strong> - ${entry.dosage}<br>
                    <small>${new Date(entry.date).toLocaleDateString()} at ${formatTime(entry.scheduledTime)}</small>
                    ${entry.actualTime && entry.actualTime !== entry.scheduledTime ? `<br><small>Taken at ${formatTime(entry.actualTime)}</small>` : ''}
                </div>
            </div>
            <div class="history-status status--${entry.status}">
                ${entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
            </div>
        </div>
    `).join('');
}

function filterHistory(filterType) {
    const allHistory = [...AppState.history];
    let filteredHistory = allHistory;
    
    switch (filterType) {
        case 'taken':
            filteredHistory = allHistory.filter(entry => entry.status === 'taken');
            break;
        case 'missed':
            filteredHistory = allHistory.filter(entry => entry.status === 'missed');
            break;
        case 'late':
            filteredHistory = allHistory.filter(entry => entry.status === 'late');
            break;
        case 'all':
        default:
            filteredHistory = allHistory;
            break;
    }
    
    const historyList = document.getElementById('history-list');
    const sortedHistory = filteredHistory.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.scheduledTime);
        const dateB = new Date(b.date + ' ' + b.scheduledTime);
        return dateB - dateA;
    });
    
    historyList.innerHTML = sortedHistory.map(entry => `
        <div class="history-item">
            <div class="history-details">
                <div class="medicine-icon">💊</div>
                <div>
                    <strong>${entry.medicineName}</strong> - ${entry.dosage}<br>
                    <small>${new Date(entry.date).toLocaleDateString()} at ${formatTime(entry.scheduledTime)}</small>
                    ${entry.actualTime && entry.actualTime !== entry.scheduledTime ? `<br><small>Taken at ${formatTime(entry.actualTime)}</small>` : ''}
                </div>
            </div>
            <div class="history-status status--${entry.status}">
                ${entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
            </div>
        </div>
    `).join('');
}

// Chart Functions
let adherenceChart = null;

function initializeChart() {
    const canvas = document.getElementById('adherence-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (adherenceChart) {
        adherenceChart.destroy();
    }
    
    // Prepare data for the last 7 days
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const scheduledData = [];
    const takenData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toDateString();
        
        const dayHistory = AppState.history.filter(entry => entry.date === dateString);
        const scheduled = dayHistory.length;
        const taken = dayHistory.filter(entry => entry.status === 'taken').length;
        
        scheduledData.push(scheduled);
        takenData.push(taken);
    }
    
    adherenceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'Scheduled',
                    data: scheduledData,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    tension: 0.1,
                    pointBackgroundColor: '#1FB8CD',
                    pointBorderColor: '#1FB8CD',
                    pointRadius: 6
                },
                {
                    label: 'Taken',
                    data: takenData,
                    borderColor: '#FFC185',
                    backgroundColor: 'rgba(255, 193, 133, 0.1)',
                    tension: 0.1,
                    pointBackgroundColor: '#FFC185',
                    pointBorderColor: '#FFC185',
                    pointRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Weekly Medicine Adherence',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: Math.max(3, Math.max(...scheduledData) + 1),
                    title: {
                        display: true,
                        text: 'Number of Doses'
                    },
                    ticks: {
                        stepSize: 1
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Day of Week'
                    }
                }
            }
        }
    });
}

// AI Tips Functions
function generateNewTip(category) {
    const tips = AppState.aiTips[category];
    if (!tips || tips.length === 0) return;
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    document.getElementById(`${category}-${category === 'adherence' ? 'insight' : 'tip'}`).textContent = randomTip;
}

// FAQ Functions
function toggleFAQ(button) {
    const answer = button.nextElementSibling;
    const isOpen = answer.classList.contains('active');
    
    // Close all FAQ answers
    document.querySelectorAll('.faq-answer').forEach(ans => {
        ans.classList.remove('active');
    });
    
    // Reset all question marks
    document.querySelectorAll('.faq-question span').forEach(span => {
        span.textContent = '+';
    });
    
    // Toggle current answer
    if (!isOpen) {
        answer.classList.add('active');
        button.querySelector('span').textContent = '−';
    }
}

// Utility Functions
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

function formatFrequency(frequency) {
    const frequencies = {
        'once-daily': 'Once daily',
        'twice-daily': 'Twice daily',
        'three-times': 'Three times daily',
        'as-needed': 'As needed'
    };
    return frequencies[frequency] || frequency;
}

// Initialize click outside modal to close
document.addEventListener('click', function(e) {
    const modal = document.getElementById('add-medicine-modal');
    if (e.target === modal) {
        hideAddMedicine();
    }
});

// Keyboard support for accessibility
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('add-medicine-modal');
        if (modal && modal.classList.contains('active')) {
            hideAddMedicine();
        }
    }
});