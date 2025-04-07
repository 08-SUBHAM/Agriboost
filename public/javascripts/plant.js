// Function to handle crop form submission
async function handleCropSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        const response = await fetch('/api/crops', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: formData.get('name'),
                type: formData.get('type'),
                plantingDate: formData.get('plantingDate'),
                harvestDate: formData.get('harvestDate'),
                fieldSize: formData.get('fieldSize'),
                location: formData.get('location')
            })
        });

        if (!response.ok) {
            throw new Error('Failed to add crop');
        }

        const result = await response.json();
        console.log('Crop added successfully:', result);
        
        // Close the modal
        closeAddCropModal();
        
        // Refresh the crops list
        loadCrops();
        
        // Show success message
        showNotification('Crop added successfully!', 'success');
    } catch (error) {
        console.error('Error adding crop:', error);
        showNotification('Failed to add crop. Please try again.', 'error');
    }
}

// Function to load crops
async function loadCrops() {
    try {
        const response = await fetch('/api/crops');
        if (!response.ok) {
            throw new Error('Failed to fetch crops');
        }
        
        const crops = await response.json();
        console.log('Fetched crops:', crops);
        
        // Update the crops list in the UI
        const cropsList = document.getElementById('crops-list');
        if (cropsList) {
            if (crops.length === 0) {
                cropsList.innerHTML = `
                    <div class="text-center py-8 text-gray-400">
                        <i class="fas fa-seedling text-2xl mb-2"></i>
                        <p>No crops added yet</p>
                    </div>
                `;
            } else {
                cropsList.innerHTML = crops.map(crop => `
                    <div class="bg-white p-4 rounded-lg shadow-sm border">
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="font-medium text-gray-900">${crop.name}</h3>
                                <p class="text-sm text-gray-500">${crop.type}</p>
                                <p class="text-sm text-gray-500">Location: ${crop.location}</p>
                                <p class="text-sm text-gray-500">Field Size: ${crop.fieldSize} acres</p>
                                <p class="text-sm text-gray-500">Status: ${crop.status}</p>
                                <p class="text-sm text-gray-500">Health: ${crop.health}%</p>
                            </div>
                            <div class="flex space-x-2">
                                <button onclick="editCrop('${crop._id}')" class="text-blue-600 hover:text-blue-800">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteCrop('${crop._id}')" class="text-red-600 hover:text-red-800">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading crops:', error);
        showNotification('Failed to load crops. Please refresh the page.', 'error');
    }
}

// Function to show notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
        'bg-blue-500'
    } text-white`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Function to open add crop modal
function openAddCropModal() {
    const modal = document.getElementById('add-crop-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Function to close add crop modal
function closeAddCropModal() {
    const modal = document.getElementById('add-crop-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Function to delete crop
async function deleteCrop(cropId) {
    if (!confirm('Are you sure you want to delete this crop?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/crops/${cropId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete crop');
        }
        
        showNotification('Crop deleted successfully!', 'success');
        loadCrops();
    } catch (error) {
        console.error('Error deleting crop:', error);
        showNotification('Failed to delete crop. Please try again.', 'error');
    }
}

// Load crops when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadCrops();
}); 