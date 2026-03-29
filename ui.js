/**
 * UI.js
 * Handles DOM manipulation, UI rendering, sorting, and state management.
 */

const ui = {
    state: {
        allRooms: [],
        view: 'grid', // 'grid' | 'table'
        filterType: 'all',
        filterStatus: 'all',
        sort: 'room-no'
    },

    init() {
        console.log('UI Initialized.');
        this.setupEventListeners();
        
        // Auto-detect page and render
        if (document.getElementById('rooms-grid-container') || document.getElementById('rooms-table-body')) {
            this.loadAndRenderRooms();
            this.setupRoomsControls();
        }
        
        if (document.getElementById('booking-form')) {
            this.setupBookingForm();
            this.populateRoomSelect();
        }
    },

    setupEventListeners() {
        // Shared event listeners (e.g., sidebar toggling)
    },

    setupRoomsControls() {
        // Toggle view
        const btnGrid = document.getElementById('view-grid');
        const btnTable = document.getElementById('view-table');

        if (btnGrid && btnTable) {
            btnGrid.addEventListener('click', () => {
                this.state.view = 'grid';
                btnGrid.classList.replace('text-gray-600', 'text-gray-800');
                btnGrid.classList.add('bg-gray-100', 'shadow-sm');
                btnTable.classList.replace('bg-gray-100', 'hover:bg-gray-50');
                btnTable.classList.replace('text-gray-800', 'text-gray-600');
                btnTable.classList.remove('shadow-sm');
                document.getElementById('rooms-grid-container').classList.remove('hidden');
                document.getElementById('rooms-table-container').classList.add('hidden');
                this.renderCurrentRoomsView();
            });

            btnTable.addEventListener('click', () => {
                this.state.view = 'table';
                btnTable.classList.replace('text-gray-600', 'text-gray-800');
                btnTable.classList.add('bg-gray-100', 'shadow-sm');
                btnGrid.classList.replace('bg-gray-100', 'hover:bg-gray-50');
                btnGrid.classList.replace('text-gray-800', 'text-gray-600');
                btnGrid.classList.remove('shadow-sm');
                document.getElementById('rooms-table-container').classList.remove('hidden');
                document.getElementById('rooms-grid-container').classList.add('hidden');
                this.renderCurrentRoomsView();
            });
        }

        // Filters and Sort
        const filterType = document.getElementById('filter-type');
        const filterStatus = document.getElementById('filter-status');
        const sortRooms = document.getElementById('sort-rooms');

        if (filterType) {
            filterType.addEventListener('change', (e) => {
                this.state.filterType = e.target.value;
                this.renderCurrentRoomsView();
            });
        }
        
        if (filterStatus) {
            filterStatus.addEventListener('change', (e) => {
                this.state.filterStatus = e.target.value;
                this.renderCurrentRoomsView();
            });
        }
        
        if (sortRooms) {
            sortRooms.addEventListener('change', (e) => {
                this.state.sort = e.target.value;
                this.renderCurrentRoomsView();
            });
        }
    },

    async loadAndRenderRooms() {
        const gridContainer = document.getElementById('rooms-grid-container');
        const tableBody = document.getElementById('rooms-table-body');
        
        if (gridContainer) gridContainer.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500">Loading rooms...</div>';
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">Loading rooms...</td></tr>';
        
        try {
            this.state.allRooms = await window.api.fetchRooms();
            this.renderCurrentRoomsView();
        } catch (error) {
            const errorMsg = 'Failed to fetch rooms from server. Make sure the backend is running.';
            if (gridContainer) gridContainer.innerHTML = `<div class="col-span-full text-center py-8 text-red-500">${errorMsg}</div>`;
            if (tableBody) tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-red-500 py-4">${errorMsg}</td></tr>`;
            this.showToast('Error loading rooms from server', 'error');
        }
    },

    renderCurrentRoomsView() {
        let processedRooms = [...this.state.allRooms];

        // 1. Filter
        if (this.state.filterType !== 'all') {
            processedRooms = processedRooms.filter(r => r.type === this.state.filterType);
        }
        if (this.state.filterStatus !== 'all') {
            const isAvail = this.state.filterStatus === 'available';
            processedRooms = processedRooms.filter(r => r.isAvailable === isAvail);
        }

        // 2. Sort
        processedRooms.sort((a, b) => {
            switch (this.state.sort) {
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'availability':
                    // true (available) comes first
                    return (a.isAvailable === b.isAvailable) ? 0 : a.isAvailable ? -1 : 1;
                case 'room-no':
                default:
                    // Alpha-numeric sort just in case
                    return a.roomNumber.localeCompare(b.roomNumber, undefined, {numeric: true});
            }
        });

        // 3. Render
        if (this.state.view === 'grid') {
            this.renderRoomsGrid(processedRooms);
        } else {
            this.renderRoomsTable(processedRooms);
        }
    },

    getRoomImage(type) {
        const typelower = type.toLowerCase();
        if (typelower.includes('suite')) {
            return 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
        } else if (typelower.includes('deluxe')) {
            return 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
        } else {
            // Standard
            return 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
        }
    },

    getCapacity(type) {
        const typelower = type.toLowerCase();
        if (typelower.includes('suite')) return '4 Persons';
        if (typelower.includes('deluxe')) return '3 Persons';
        return '2 Persons';
    },

    renderRoomsGrid(rooms) {
        const container = document.getElementById('rooms-grid-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (rooms.length === 0) {
            container.innerHTML = '<div class="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-200"><p class="text-gray-500 font-medium">No rooms match your filters.</p></div>';
            return;
        }

        rooms.forEach(room => {
            const statusClass = room.isAvailable ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';
            const statusText = room.isAvailable ? 'Available' : 'Booked';
            const imgSrc = this.getRoomImage(room.type);
            
            const card = document.createElement('div');
            card.className = 'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col group';
            
            // Re-direct to booking page on button click by using location assignment with prepopulated hash/param or just navigating. (For purely decoupled, let's just alert or map to booking.html?room=xxx)
            card.innerHTML = `
                <div class="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
                    <img src="${imgSrc}" alt="${room.type} Room" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
                    <div class="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-sm backdrop-blur-md ${statusClass}">
                        ${statusText}
                    </div>
                </div>
                <div class="p-5 flex-1 flex flex-col">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h3 class="text-lg font-bold text-gray-900">Room ${room.roomNumber}</h3>
                            <p class="text-sm text-gray-500 font-medium">${room.type}</p>
                        </div>
                        <div class="text-right">
                            <span class="block text-xl font-bold text-gray-900">$${parseFloat(room.price).toFixed(2)}</span>
                            <span class="text-xs text-gray-500">/ night</span>
                        </div>
                    </div>
                    
                    <div class="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-sm text-gray-600 mb-6">
                        <div class="flex items-center gap-1.5 flex-1 text-center justify-center bg-gray-50 py-1.5 rounded-md">
                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            ${this.getCapacity(room.type)}
                        </div>
                    </div>
                    
                    <div class="mt-auto">
                        <button onclick="window.location.href='booking.html'" class="w-full py-2.5 rounded-lg font-semibold transition-colors flex justify-center items-center gap-2 ${room.isAvailable ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}" ${room.isAvailable ? '' : 'disabled'}>
                            ${room.isAvailable ? 'Book this Room' : 'Currently Unavailable'}
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    },

    renderRoomsTable(rooms) {
        const tableBody = document.getElementById('rooms-table-body');
        if (!tableBody) return;
        
        tableBody.innerHTML = ''; 
        
        if (rooms.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-6 text-gray-500">No rooms match your filters.</td></tr>';
            return;
        }
        
        rooms.forEach(room => {
            const statusClass = room.isAvailable ? 'status-success' : 'status-danger';
            const statusText = room.isAvailable ? 'Available' : 'Occupied';
            
            const row = `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="font-medium w-32 py-3">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                <img src="${this.getRoomImage(room.type)}" class="w-full h-full object-cover">
                            </div>
                            <span>${room.roomNumber}</span>
                        </div>
                    </td>
                    <td class="py-3 font-medium text-gray-700">${room.type}</td>
                    <td class="py-3 text-gray-600">${this.getCapacity(room.type)}</td>
                    <td class="py-3 font-semibold text-gray-900">$${parseFloat(room.price).toFixed(2)}</td>
                    <td class="py-3"><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td class="py-3">
                        <button onclick="window.location.href='booking.html'" class="text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${room.isAvailable ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}" ${room.isAvailable ? '' : 'disabled'}>
                            ${room.isAvailable ? 'Book' : 'Booked'}
                        </button>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
        });
    },

    async populateRoomSelect() {
        const select = document.getElementById('room-select');
        if (!select) return;
        
        select.innerHTML = '<option value="">Loading rooms...</option>';
        
        try {
            // Also update global state
            this.state.allRooms = await window.api.fetchRooms();
            const rooms = this.state.allRooms;
            
            select.innerHTML = '<option value="">Select a Room...</option>';
            rooms.forEach(room => {
                const option = document.createElement('option');
                option.value = room.roomNumber;
                option.textContent = `Room ${room.roomNumber} - ${room.type} ($${parseFloat(room.price).toFixed(2)}/night)${room.isAvailable ? '' : ' (Occupied)'}`;
                if (!room.isAvailable) option.disabled = true;
                select.appendChild(option);
            });
        } catch (error) {
            select.innerHTML = '<option value="">Failed to load rooms</option>';
            console.error('Failed to populate room select:', error);
        }
    },

    setupBookingForm() {
        const form = document.getElementById('booking-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = document.getElementById('submit-booking-btn');
            const originalText = btn.textContent;
            
            // Extract values
            const fName = document.getElementById('first-name').value.trim();
            const lName = document.getElementById('last-name').value.trim();
            const roomNumber = document.getElementById('room-select').value;
            const checkInInput = document.getElementById('check-in').value;
            const checkOutInput = document.getElementById('check-out').value;
            
            if (!fName || !lName || !roomNumber || !checkInInput || !checkOutInput) {
                this.showToast('Please fill all required fields.', 'error');
                return;
            }
            
            const checkIn = new Date(checkInInput);
            const checkOut = new Date(checkOutInput);
            
            const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            if (days <= 0) {
                this.showToast('Check-out date must be after check-in date.', 'error');
                return;
            }
            
            const bookingData = {
                customerName: `${fName} ${lName}`,
                roomNumber: roomNumber,
                days: days
            };
            
            // Loading state
            btn.disabled = true;
            btn.textContent = 'Processing...';
            
            try {
                const result = await window.api.bookRoom(bookingData);
                this.showToast(`Booking Successful! ID: ${result.bookingId}, Total: $${result.totalAmount.toFixed(2)}`, 'success');
                form.reset();
                this.populateRoomSelect(); // refresh availability
            } catch (error) {
                this.showToast(error.message, 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        });
    },
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 p-4 rounded-md text-white font-medium shadow-lg transition-all duration-300 transform translate-y-10 opacity-0 z-50 ${type === 'error' ? 'bg-red-500' : 'bg-green-500'}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        void toast.offsetWidth;
        toast.classList.remove('translate-y-10', 'opacity-0');
        
        setTimeout(() => {
            toast.classList.add('translate-y-10', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ui.init();
});

window.ui = ui;
