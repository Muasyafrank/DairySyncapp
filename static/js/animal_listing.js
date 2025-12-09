// animal_listing.js - Handles animal listing and management with Django templates

// Since we're using Django templates with server-side rendering,
// most functionality will be handled by Django views.
// This JS file provides client-side enhancements.

function initializeAnimalListing() {
    // Add event listeners for filters
    const searchInput = document.getElementById('searchInput');
    const speciesFilter = document.getElementById('speciesFilter');
    const healthFilter = document.getElementById('healthFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    // Apply filters on change (with debounce for search)
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                applyFilters();
            }, 300);
        });
    }
    
    // Apply filters immediately for dropdowns
    if (speciesFilter) {
        speciesFilter.addEventListener('change', applyFilters);
    }
    
    if (healthFilter) {
        healthFilter.addEventListener('change', applyFilters);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    
    // Add click handlers for action buttons
    document.addEventListener('click', function(event) {
        // Handle view details button
        if (event.target.closest('[data-action="view-details"]')) {
            const animalId = event.target.closest('[data-animal-id]').dataset.animalId;
            viewAnimalDetails(animalId);
        }
        
        // Handle edit button
        if (event.target.closest('[data-action="edit"]')) {
            const animalId = event.target.closest('[data-animal-id]').dataset.animalId;
            editAnimal(animalId);
        }
        
        // Handle delete button
        if (event.target.closest('[data-action="delete"]')) {
            const animalId = event.target.closest('[data-animal-id]').dataset.animalId;
            const animalName = event.target.closest('[data-animal-name]').dataset.animalName;
            deleteAnimal(animalId, animalName);
        }
        
        // Handle milk log button
        if (event.target.closest('[data-action="add-milk"]')) {
            const animalId = event.target.closest('[data-animal-id]').dataset.animalId;
            addMilkLog(animalId);
        }
        
        // Handle bulk select
        if (event.target.closest('#selectAll')) {
            const checkboxes = document.querySelectorAll('.animal-checkbox');
            const selectAll = document.getElementById('selectAll').checked;
            
            checkboxes.forEach(checkbox => {
                checkbox.checked = selectAll;
            });
            updateBulkActions();
        }
        
        // Handle individual checkbox selection
        if (event.target.classList.contains('animal-checkbox')) {
            updateBulkActions();
        }
    });
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize modals
    initializeModals();
}

// Apply filters and reload page
function applyFilters() {
    const search = document.getElementById('searchInput').value;
    const species = document.getElementById('speciesFilter').value;
    const healthStatus = document.getElementById('healthFilter').value;
    const status = document.getElementById('statusFilter').value;
    
    // Build query parameters
    const params = new URLSearchParams();
    
    if (search) params.append('search', search);
    if (species) params.append('species', species);
    if (healthStatus) params.append('health_status', healthStatus);
    if (status) params.append('status', status);
    
    // Reload page with filters
    window.location.href = `?${params.toString()}`;
}

// Reset all filters
function resetFilters() {
    // Clear all filter inputs
    document.getElementById('searchInput').value = '';
    document.getElementById('speciesFilter').value = '';
    document.getElementById('healthFilter').value = '';
    document.getElementById('statusFilter').value = '';
    
    // Reload page without filters
    window.location.href = window.location.pathname;
}

// View animal details
function viewAnimalDetails(animalId) {
    // Navigate to animal detail page
    window.location.href = `/animals/${animalId}/`;
}

// Edit animal
function editAnimal(animalId) {
    // Navigate to edit page
    window.location.href = `/animals/${animalId}/edit/`;
}

// Delete animal with confirmation
function deleteAnimal(animalId, animalName) {
    // Show confirmation modal or use browser confirm
    if (confirm(`Are you sure you want to delete "${animalName}" (${animalId})?\n\nThis action cannot be undone.`)) {
        // Submit delete form
        const deleteForm = document.getElementById(`delete-form-${animalId}`);
        if (deleteForm) {
            deleteForm.submit();
        } else {
            // Fallback: navigate to delete URL
            window.location.href = `/animals/${animalId}/delete/`;
        }
    }
}

// Add milk log for animal
function addMilkLog(animalId) {
    // Navigate to milk log creation page
    window.location.href = `/milk/add/?animal=${animalId}`;
}

// Bulk actions
function updateBulkActions() {
    const selectedCount = document.querySelectorAll('.animal-checkbox:checked').length;
    const bulkActions = document.getElementById('bulkActions');
    
    if (bulkActions) {
        if (selectedCount > 0) {
            bulkActions.style.display = 'flex';
            document.getElementById('selectedCount').textContent = selectedCount;
        } else {
            bulkActions.style.display = 'none';
        }
    }
}

// Perform bulk action
function performBulkAction(action) {
    const selectedAnimals = [];
    const checkboxes = document.querySelectorAll('.animal-checkbox:checked');
    
    checkboxes.forEach(checkbox => {
        selectedAnimals.push(checkbox.dataset.animalId);
    });
    
    if (selectedAnimals.length === 0) {
        alert('Please select at least one animal.');
        return;
    }
    
    // Confirm action
    let message = '';
    switch(action) {
        case 'delete':
            message = `Are you sure you want to delete ${selectedAnimals.length} selected animal(s)?\n\nThis action cannot be undone.`;
            break;
        case 'status':
            message = `Update status for ${selectedAnimals.length} selected animal(s)?`;
            break;
        case 'health':
            message = `Update health status for ${selectedAnimals.length} selected animal(s)?`;
            break;
    }
    
    if (!confirm(message)) {
        return;
    }
    
    // Create and submit form for bulk action
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/animals/bulk/${action}/`;
    
    // Add CSRF token
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
    if (csrfToken) {
        form.appendChild(csrfToken.cloneNode(true));
    }
    
    // Add selected animals
    selectedAnimals.forEach(animalId => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'animals';
        input.value = animalId;
        form.appendChild(input);
    });
    
    // If updating status or health, prompt for value
    if (action === 'status' || action === 'health') {
        const value = prompt(`Enter new ${action}:`);
        if (value) {
            const valueInput = document.createElement('input');
            valueInput.type = 'hidden';
            valueInput.name = 'value';
            valueInput.value = value;
            form.appendChild(valueInput);
        } else {
            return; // User cancelled
        }
    }
    
    document.body.appendChild(form);
    form.submit();
}

// Export data
function exportData(format) {
    const params = new URLSearchParams(window.location.search);
    params.append('format', format);
    params.append('export', 'true');
    
    // Submit export form or navigate to export URL
    window.location.href = `/animals/export/?${params.toString()}`;
}

// Quick status update
function quickUpdateStatus(animalId, newStatus) {
    // Show confirmation
    if (confirm(`Update status to "${newStatus}"?`)) {
        // Submit form
        const form = document.getElementById(`status-form-${animalId}`);
        if (form) {
            const statusInput = form.querySelector('input[name="status"]');
            if (statusInput) {
                statusInput.value = newStatus;
                form.submit();
            }
        }
    }
}

// Quick health status update
function quickUpdateHealth(animalId, newHealthStatus) {
    // Show confirmation
    if (confirm(`Update health status to "${newHealthStatus}"?`)) {
        // Submit form
        const form = document.getElementById(`health-form-${animalId}`);
        if (form) {
            const healthInput = form.querySelector('input[name="health_status"]');
            if (healthInput) {
                healthInput.value = newHealthStatus;
                form.submit();
            }
        }
    }
}

// Search functionality with instant results (if implemented with AJAX)
function instantSearch(query) {
    // This would be used if you want to implement AJAX-based search
    // For now, we're using form submission
}

// Initialize modals
function initializeModals() {
    // Initialize any modals if needed
    const quickEditModal = document.getElementById('quickEditModal');
    if (quickEditModal) {
        window.quickEditModal = new bootstrap.Modal(quickEditModal);
    }
}

// Show quick edit modal
function showQuickEditModal(animalId, animalName, currentStatus, currentHealth) {
    const modalTitle = document.getElementById('quickEditModalLabel');
    const animalIdField = document.getElementById('modalAnimalId');
    const statusSelect = document.getElementById('modalStatus');
    const healthSelect = document.getElementById('modalHealthStatus');
    
    if (modalTitle) modalTitle.textContent = `Edit: ${animalName}`;
    if (animalIdField) animalIdField.value = animalId;
    if (statusSelect) statusSelect.value = currentStatus;
    if (healthSelect) healthSelect.value = currentHealth;
    
    if (window.quickEditModal) {
        quickEditModal.show();
    }
}

// Save quick edit
function saveQuickEdit() {
    const animalId = document.getElementById('modalAnimalId').value;
    const status = document.getElementById('modalStatus').value;
    const healthStatus = document.getElementById('modalHealthStatus').value;
    
    // Submit form
    const form = document.getElementById('quickEditForm');
    if (form) {
        form.submit();
    }
}

// Refresh data (reload page)
function refreshData() {
    window.location.reload();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimalListing();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Ctrl/Cmd + F for search
        if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
            event.preventDefault();
            document.getElementById('searchInput').focus();
        }
        
        // Ctrl/Cmd + R for refresh
        if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
            event.preventDefault();
            refreshData();
        }
        
        // Escape to clear search
        if (event.key === 'Escape') {
            const searchInput = document.getElementById('searchInput');
            if (document.activeElement === searchInput && searchInput.value) {
                searchInput.value = '';
                applyFilters();
            }
        }
    });
    
    // Add pagination click handlers (if using AJAX pagination)
    // Otherwise, pagination is handled by Django template links
    const paginationLinks = document.querySelectorAll('.page-link[data-page]');
    paginationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            const url = new URL(window.location);
            url.searchParams.set('page', page);
            window.location.href = url.toString();
        });
    });
});