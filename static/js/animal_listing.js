// animal_listing.js - Handles animal listing and management

let currentPage = 1;
let totalPages = 1;
let perPage = 10;
let currentAnimalId = null;

// Load statistics
function loadStatistics() {
    fetch('/animals/api/statistics/')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const stats = data.statistics;
                
                // Update statistics cards
                document.getElementById('totalAnimals').textContent = stats.total_animals;
                
                // Calculate healthy animals
                const healthyCount = stats.health_distribution.find(item => item.health_status === 'healthy')?.count || 0;
                document.getElementById('healthyAnimals').textContent = healthyCount;
                
                // Update milk statistics
                document.getElementById('todayMilk').textContent = stats.today_milk_total.toFixed(1) + ' L';
                document.getElementById('avgYield').textContent = stats.average_milk_yield.toFixed(1) + ' L';
            }
        })
        .catch(error => {
            console.error('Error loading statistics:', error);
        });
}

// Load animals with pagination
function loadAnimals(page = 1) {
    showLoadingOverlay();
    
    // Get filter values
    const search = document.getElementById('searchInput').value;
    const species = document.getElementById('speciesFilter').value;
    const healthStatus = document.getElementById('healthFilter').value;
    const status = document.getElementById('statusFilter').value;
    
    // Build query string
    const params = new URLSearchParams({
        page: page,
        per_page: perPage,
        search: search,
        species: species,
        health_status: healthStatus,
        status: status
    });
    
    fetch(`/animals/api/animals/?${params}`)
        .then(response => response.json())
        .then(data => {
            hideLoadingOverlay();
            
            if (data.success) {
                renderAnimals(data.animals);
                updatePagination(data.page, data.total_pages, data.total);
                currentPage = data.page;
                totalPages = data.total_pages;
                
                // Show/hide empty state
                const emptyState = document.getElementById('emptyState');
                const animalsList = document.getElementById('animalsList');
                const pagination = document.getElementById('pagination');
                
                if (data.animals.length === 0) {
                    emptyState.style.display = 'block';
                    animalsList.style.display = 'none';
                    pagination.style.display = 'none';
                } else {
                    emptyState.style.display = 'none';
                    animalsList.style.display = 'block';
                    pagination.style.display = 'block';
                }
            } else {
                showError(data.error || 'Failed to load animals');
            }
        })
        .catch(error => {
            hideLoadingOverlay();
            showError('Network error. Please try again.');
            console.error('Error:', error);
        });
}

// Render animals list
function renderAnimals(animals) {
    const container = document.getElementById('animalsList');
    container.innerHTML = '';
    
    animals.forEach(animal => {
        const animalCard = createAnimalCard(animal);
        container.appendChild(animalCard);
    });
}

// Create animal card HTML
function createAnimalCard(animal) {
    const card = document.createElement('div');
    card.className = `animal-card ${animal.health_status}`;
    
    // Get species icon
    const speciesIcon = getSpeciesIcon(animal.species);
    
    // Format last milk log
    let lastMilkHtml = '<span class="text-muted">No milk logs</span>';
    if (animal.latest_milk_log && animal.latest_milk_log.date) {
        const log = animal.latest_milk_log;
        lastMilkHtml = `
            <div class="yield-badge">
                <div class="fw-bold text-primary">${log.total_yield.toFixed(1)} L</div>
                <div class="text-xsmall text-muted">${log.date}</div>
                <span class="quality-badge ${log.quality}">${log.quality}</span>
            </div>
        `;
    }
    
    card.innerHTML = `
        <div class="row align-items-center">
            <!-- Checkbox -->
            <div class="col-auto">
                <input type="checkbox" class="form-check-input animal-checkbox" 
                       data-animal-id="${animal.animal_id}">
            </div>
            
            <!-- Animal Info -->
            <div class="col-md-2">
                <div class="d-flex align-items-center">
                    <div class="animal-photo me-3">
                        ${animal.photo_url ? 
                            `<img src="${animal.photo_url}" alt="${animal.name}">` : 
                            `<i class="bi ${speciesIcon}"></i>`
                        }
                    </div>
                    <div>
                        <h6 class="mb-0 fw-bold">${animal.name}</h6>
                        <div class="text-small text-muted">${animal.animal_id}</div>
                        <div class="text-xsmall">
                            <span class="badge bg-light text-dark">${animal.species}</span>
                            <span class="badge bg-light text-dark">${animal.breed}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Health Status -->
            <div class="col-md-2">
                <span class="health-badge ${animal.health_status}">
                    ${animal.health_status_display}
                </span>
                <div class="text-xsmall text-muted mt-1">
                    <i class="bi bi-gender-${animal.gender === 'female' ? 'female' : 'male'}"></i>
                    ${animal.gender}
                </div>
            </div>
            
            <!-- Age & Weight -->
            <div class="col-md-2">
                <div class="text-small">
                    <div><strong>Age:</strong> ${animal.age_years}y ${animal.age_months}m</div>
                    ${animal.weight ? `<div><strong>Weight:</strong> ${animal.weight} kg</div>` : ''}
                    ${animal.color ? `<div><strong>Color:</strong> ${animal.color}</div>` : ''}
                </div>
            </div>
            
            <!-- Status & Location -->
            <div class="col-md-2">
                <span class="status-badge ${animal.status}">
                    ${animal.status_display}
                </span>
                ${animal.location ? `
                    <div class="text-xsmall text-muted mt-1">
                        <i class="bi bi-geo-alt"></i> ${animal.location}
                    </div>
                ` : ''}
            </div>
            
            <!-- Last Milk Production -->
            <div class="col-md-2">
                ${lastMilkHtml}
            </div>
            
            <!-- Actions -->
            <div class="col-md-2 text-end">
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="viewMilkLogs('${animal.animal_id}', '${animal.name}')">
                        <i class="bi bi-droplet"></i> Milk
                    </button>
                    <button class="btn btn-outline-secondary" onclick="editAnimal('${animal.animal_id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteAnimal('${animal.animal_id}', '${animal.name}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
                <div class="text-xsmall text-muted mt-1">
                    Added: ${animal.created_at}
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// Get species icon
function getSpeciesIcon(species) {
    const icons = {
        'Cow': 'bi-emoji-cow',
        'Buffalo': 'bi-emoji-waterbuffalo',
        'Goat': 'bi-emoji-goat',
        'Sheep': 'bi-emoji-sheep'
    };
    return icons[species] || 'bi-emoji-animal';
}

// Update pagination
function updatePagination(currentPage, totalPages, totalItems) {
    const pagination = document.getElementById('pagination');
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');
    
    // Clear page numbers
    const pageNumbers = pagination.querySelectorAll('.page-number');
    pageNumbers.forEach(el => el.remove());
    
    // Update prev/next buttons
    prevPage.classList.toggle('disabled', currentPage === 1);
    nextPage.classList.toggle('disabled', currentPage === totalPages);
    
    // Update click handlers
    prevPage.onclick = currentPage > 1 ? () => loadAnimals(currentPage - 1) : null;
    nextPage.onclick = currentPage < totalPages ? () => loadAnimals(currentPage + 1) : null;
    
    // Add page numbers
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item page-number ${i === currentPage ? 'active' : ''}`;
        
        const pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.href = '#';
        pageLink.textContent = i;
        pageLink.onclick = (e) => {
            e.preventDefault();
            loadAnimals(i);
        };
        
        pageItem.appendChild(pageLink);
        nextPage.parentNode.insertBefore(pageItem, nextPage);
    }
    
    // Show item count
    const itemCount = document.createElement('div');
    itemCount.className = 'text-center text-muted mt-2';
    itemCount.textContent = `Showing ${((currentPage - 1) * perPage) + 1}-${Math.min(currentPage * perPage, totalItems)} of ${totalItems} animals`;
    
    // Remove existing item count
    const existingCount = pagination.querySelector('.item-count');
    if (existingCount) existingCount.remove();
    
    itemCount.className = 'item-count text-center text-muted mt-2';
    pagination.appendChild(itemCount);
}

// Reset filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('speciesFilter').value = '';
    document.getElementById('healthFilter').value = '';
    document.getElementById('statusFilter').value = '';
    loadAnimals(1);
}

// View milk logs
function viewMilkLogs(animalId, animalName) {
    currentAnimalId = animalId;
    document.getElementById('animalInfo').textContent = `${animalName} (${animalId})`;
    
    // Load milk logs
    loadMilkLogs(animalId);
    
    // Show modal
    milkLogModal.show();
}

function loadMilkLogs(animalId) {
    // In a real implementation, you would fetch milk logs from API
    // For now, we'll show a placeholder
    const tableBody = document.getElementById('milkLogsTable');
    tableBody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center py-4">
                <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                Loading milk logs...
            </td>
        </tr>
    `;
    
    // Simulate API call
    setTimeout(() => {
        // This would be replaced with actual API call
        // fetch(`/animals/api/milk-logs/${animalId}/`)
        //     .then(response => response.json())
        //     .then(data => renderMilkLogs(data.logs));
        
        // For demo, show empty state
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <i class="bi bi-droplet text-muted" style="font-size: 2rem;"></i>
                    <p class="text-muted mt-2">No milk logs found</p>
                    <button class="btn btn-sm btn-outline-primary" onclick="addMilkLog()">
                        <i class="bi bi-plus-circle me-1"></i>Add First Milk Log
                    </button>
                </td>
            </tr>
        `;
    }, 1000);
}

function addMilkLog() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('logDate').value = today;
    
    // Reset form
    document.getElementById('morningYield').value = '0';
    document.getElementById('eveningYield').value = '0';
    document.getElementById('logQuality').value = 'good';
    document.getElementById('logNotes').value = '';
    calculateTotalYield();
    
    // Show modal
    addMilkLogModal.show();
}

function saveMilkLog() {
    const date = document.getElementById('logDate').value;
    const morningYield = parseFloat(document.getElementById('morningYield').value) || 0;
    const eveningYield = parseFloat(document.getElementById('eveningYield').value) || 0;
    const quality = document.getElementById('logQuality').value;
    const notes = document.getElementById('logNotes').value;
    
    if (!date) {
        showError('Please select a date');
        return;
    }
    
    if (!currentAnimalId) {
        showError('No animal selected');
        return;
    }
    
    showLoading('Saving milk log...');
    
    // Make API call
    fetch('/animals/api/milk-logs/create/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            animal_id: currentAnimalId,
            date: date,
            morning_yield: morningYield,
            evening_yield: eveningYield,
            quality: quality,
            notes: notes
        })
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        
        if (data.success) {
            addMilkLogModal.hide();
            showSuccess(data.message);
            loadMilkLogs(currentAnimalId);
        } else {
            showError(data.error || 'Failed to save milk log');
        }
    })
    .catch(error => {
        hideLoading();
        showError('Network error. Please try again.');
        console.error('Error:', error);
    });
}

// Edit animal
function editAnimal(animalId) {
    // Redirect to edit page
    window.location.href = `/animals/edit/${animalId}/`;
}

// Delete animal
function deleteAnimal(animalId, animalName) {
    if (confirm(`Are you sure you want to delete "${animalName}" (${animalId})?\n\nThis action cannot be undone.`)) {
        showLoading('Deleting animal...');
        
        // Make API call
        fetch(`/animals/api/animals/${animalId}/delete/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            
            if (data.success) {
                showSuccess(data.message);
                // Reload animals list
                setTimeout(() => {
                    loadAnimals(currentPage);
                    loadStatistics();
                }, 1000);
            } else {
                showError(data.error || 'Failed to delete animal');
            }
        })
        .catch(error => {
            hideLoading();
            showError('Network error. Please try again.');
            console.error('Error:', error);
        });
    }
}

// Loading overlay
function showLoadingOverlay() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoadingOverlay() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// Utility functions
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function showSuccess(message) {
    document.getElementById('successMessage').textContent = message;
    successModal.show();
}

function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    errorModal.show();
}