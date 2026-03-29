/**
 * Boilerplate charts.js
 * Handles Chart.js initialization and updates.
 */

const charts = {
    init() {
        console.log('Charts module ready.');
    },

    renderRevenueChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        
        console.log(`Rendering revenue chart on ${canvasId}`);
        // Requires Chart.js to be loaded on the page
        if (typeof Chart !== 'undefined') {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Revenue ($)',
                        data: [12000, 19000, 15000, 22000, 18000, 25000],
                        borderColor: '#0ea5e9',
                        backgroundColor: 'rgba(14, 165, 233, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { 
                        y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }
    },
    
    renderOccupancyChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        
        console.log(`Rendering occupancy chart on ${canvasId}`);
        if (typeof Chart !== 'undefined') {
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Occupied', 'Available', 'Maintenance'],
                    datasets: [{
                        data: [65, 25, 10],
                        backgroundColor: ['#0ea5e9', '#d1d5db', '#fcd34d'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '75%'
                }
            });
        }
    }
};

window.charts = charts;
