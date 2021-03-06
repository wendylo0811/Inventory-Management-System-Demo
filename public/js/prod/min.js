// Vehicle Alerts
function addVehicleAlert() {
    $('.title').append('<div class="alert alert-success">Vehicle Added Succesfully</div>');
    setTimeout(() => { $('.alert').addClass('js-hide-display'); }, 2000);
}

function removeVehicleAlert() {
    $('.title').append('<div class="alert alert-info">Vehicle Removed Succesfully</div>');
    setTimeout(() => { $('.alert').addClass('js-hide-display'); }, 2000);
}

function editVehicleAlert() {
    $('.title').append('<div class="alert alert-info">Vehicle Updated</div>');
    setTimeout(() => { $('.alert').addClass('js-hide-display'); }, 2000);
}

function vehicleErrorAlert(message) {
    $('#vehicle-form').prepend(`<div class="alert alert-danger">${message}</div>`);
    setTimeout(() => { $('.alert').addClass('js-hide-display'); }, 5000);
}

// Item Alerts
function addItemAlert() {
    $('.title').append('<div class="alert alert-success">Item Added Succesfully</div>');
    setTimeout(() => { $('.alert').addClass('js-hide-display'); }, 2000);
}

function removeItemAlert() {
    $('.title').append('<div class="alert alert-info">Item Removed Succesfully</div>');
    setTimeout(() => { $('.alert').addClass('js-hide-display'); }, 2000);
}

function editItemAlert() {
    $('.title').append('<div class="alert alert-info">Item Updated</div>');
    setTimeout(() => { $('.alert').addClass('js-hide-display'); }, 2000);
}

let isVehicle = true;

// Submit handler for add item/vehicle form modal
function formSubmitHandler(e) {
    e.preventDefault();
    const form = $(this);
    const formData = new FormData(this);

    const keys = Array.from(formData.keys());
    const data = keys.map(key => `${key}=${encodeURIComponent(formData.get(key))}`).join('&');

    if (isVehicle) {
        $.ajax({
            method: 'POST',
            url: '/api/vehicle',
            data,
            success: (data) => {
                $('.noItems').addClass('js-hide-display');
                hideVehicleModal();
                renderNewVehicle(data);
                addVehicleAlert();
            },
            error: (error) => {
                if (error.responseText) {
                    vehicleErrorAlert(error.responseText);
                }
            },
        });
    } else {
        $.ajax({
            method: 'POST',
            url: '/api/inventory',
            data,
            success: (data) => {
                $('.noItems').addClass('js-hide-display');
                hideItemModal();
                clearForm();
                renderNewItem(data);
                isVehicle = true;
                addItemAlert();
            },
        });
    }
}
// Add Vehicle Modal
function showVehicleModal() {
    const modal = document.getElementById('addNewVehicle-modal');
    modal.style.display = 'block';
}

function hideVehicleModal() {
    const modal = document.getElementById('addNewVehicle-modal');
    modal.style.display = 'none';
}

// Add Item modal
function showItemModal() {
    const modal = document.getElementById('addNewItem-modal');
    modal.style.display = 'block';
}

function hideItemModal() {
    const modal = document.getElementById('addNewItem-modal');
    modal.style.display = 'none';
}

// Edit Vehicle Modal
function showEditVehicleModal() {
    const modal = document.getElementById('editVehicle-modal');
    modal.style.display = 'block';
}

function hideEditVehicleModal() {
    const modal = document.getElementById('editVehicle-modal');
    modal.style.display = 'none';
}

// Edit Item Modal
function showEditItemModal() {
    const modal = document.getElementById('editItem-modal');
    modal.style.display = 'block';
}

function hideEditItemModal() {
    const modal = document.getElementById('editItem-modal');
    modal.style.display = 'none';
}

$((document) => {
    selectVehicle();
    runReport();
    addItem();
    addVehicle();
});

// Gets all inventory item from the database
function getInventoryItems(callbackfn, vehicle) {
    $.ajax({
        method: 'GET',
        url: '/api/inventory',
        success: (data) => {
            callbackfn(data, vehicle);
            selectItem();
        },
    });
}

// Displays inventory for chosen vehicle
function displayInventoryItems(data, vehicle) {
    const inventory = [];
    for (index in data) {
        if (data[index].vehicle_id === vehicle) {
            inventory.push(data[index]);
        }
    }
    if (inventory.length === 0) {
        // alert('ohhh nooo');
        $('#results').append('<h2 class="noItems">No items for current vehicle, use "add item" to create one</h2>');
    } else {
        inventory.forEach((item) => {
            renderNewItem(item);
        });
    }
}

// Gets inventory items and displays inventory for a specific vehicle
function getAndDisplayInventoryItems(vehicle) {
    getInventoryItems(displayInventoryItems, vehicle);
}

// Used to render a new item when added
function renderNewItem(itemData) {
    $('#results').append(`<div class="item jsEdit" id="${itemData.id}">
                            <div class="iteminfo">
                                <p class="name">${itemData.item}</p>
                            </div>
                            <div class="iteminfo">
                                <p class="price">$${itemData.listPrice}</p>
                            </div>
                            <div class="iteminfo">
                                <p class="quantity">Quantity: ${itemData.quantityOnHand}</p>
                            </div> 
                        </div>`);
}

// Handles adding an item and displaying the modal
function addItem() {
    $('#add-item').click(() => {
        showItemModal();
        isVehicle = false;
    });
    $('#item-form').submit(formSubmitHandler);
    $('#item-close').click(() => {
        hideItemModal();
    });
}

function clearForm() {
    $('#item-image').val('');
    $('#item-input').val('');
    $('#partnumber-input').val('');
    $('#price-input').val('');
    $('#quantity-input').val('');
    $('#reorder-input').val('');
    $('#vehicle_id').val('');
}
// Click handler for selecting an inventory item, sends GET request for id
function selectItem() {
    let currentItemId = '';
    $('#results').on('click', '.jsEdit', function () {
        currentItemId = $(this).attr('id');
        $.ajax({
            method: 'GET',
            url: `/api/inventory/${currentItemId}`,
            success: (data) => {
                renderItemModal(data);
                editItem(data);
                deleteItem(data);
            },
        });
    });
}
// Displays item modal with all the information from the DB
function renderItemModal(data) {
    $('#editItem-modal').html(`
                                <div class="modal-content width-50">
                                    <span class="close" id="editItem-close">&times;</span>
                                    <div id="modal-form-container"></div>
                                    <div class="item-modal">
                                        <h2>${data.item}</h2>
                                        <div class="iteminfo">
                                            <h3>Part Number:</h3>
                                            <p>${data.partNumber}</p>
                                        </div>
                                        <div class="iteminfo">
                                            <h3>List Price:</h3>
                                            <p>$${data.listPrice}</p>
                                        </div>
                                        <div class="iteminfo">
                                            <h3>Quantity on Hand:</h3>
                                            <p>${data.quantityOnHand}</p>
                                        </div>
                                        <div class="iteminfo">
                                            <h3>Minimum Amount:</h3>
                                            <p>${data.reorderPoint}</p>
                                        </div>
                                        <div class="iteminfo">
                                            <h3>Vehicle Id</h3>
                                            <p>${data.vehicle_id}</p>
                                        </div>
                                        <button id="deleteButton" class="button">DELETE</button>
                                        <button id="editButton" class="button">EDIT</button>
                                    </div>

                                </div>`);
    showEditItemModal();
    $('#editItem-modal').on('click', '#editItem-close', function () {
        hideEditItemModal();
        $('#editItem-modal').empty();
    });
}


function deleteItem(data) {
    $('#editItem-modal').off('click', '#deleteButton').on('click', '#deleteButton', function () {
        if (confirm('Are you sure you want to delete this item?') === true) {
            $.ajax({
                method: 'DELETE',
                url: `/api/inventory/${data.id}`,
                success: () => {
                    $(`#${data.id}`).remove();
                    hideEditItemModal();
                    removeItemAlert();
                },
            });
        } else {
            hideEditItemModal();
        }
    });
}
function editItem(data) {
    const currentItemId = data.id;
    const vehicle = data.vehicle_id;

    $('#editItem-modal').off('click', '#editButton').on('click', '#editButton', function () {
        $('.item-modal').hide();
        const itemForm = $('#item-form')[0].outerHTML;
        $('#modal-form-container').append(itemForm);
        $('#modal-form-container #item-form h2').text('Edit Item');
        $('#modal-form-container #item-input').val(`${data.item}`);
        $('#modal-form-container #partnumber-input').val(`${data.partNumber}`);
        $('#modal-form-container #price-input').val(`${data.listPrice}`);
        $('#modal-form-container #quantity-input').val(`${data.quantityOnHand}`);
        $('#modal-form-container #reorder-input').val(`${data.reorderPoint}`);
        $('#modal-form-container #vehicle_id').val(`${data.vehicle_id}`);
    });

    $('#modal-form-container').on('submit', '#item-form', (e) => {
        e.preventDefault();
        const updatedItem = {
            id: currentItemId,
            image: $(event.target).find('#item-image').val(),
            item: $(event.target).find('#item-input').val(),
            partNumber: $(event.target).find('#partnumber-input').val(),
            listPrice: $(event.target).find('#price-input').val(),
            quantityOnHand: $(event.target).find('#quantity-input').val(),
            reorderPoint: $(event.target).find('#reorder-input').val(),
            vehicle_id: $(event.target).find('#vehicle_id').val(),
        };
        $.ajax({
            method: 'PUT',
            url: `/api/inventory/${currentItemId}`,
            data: updatedItem,
            success: () => {
                hideEditItemModal();
                $('.jsEdit').remove();
                getAndDisplayInventoryItems(vehicle);
                editItemAlert();
            },
        });
    });
}

// Gets all items below reorder point and displays them as a <ol>
function reorderReport(data) {
    const itemsToReorder = [];
    for (index in data) {
        if (data[index].quantityOnHand < data[index].reorderPoint) {
            itemsToReorder.push(data[index]);
        }
    }
    itemsToReorder.sort(sortItem);
    if (itemsToReorder.length === 0) {    
        $('.title').append('<div class="alert alert-info">No Items Below Minimum Amount</div>');
    } else {
        $('.report-title').removeClass('js-hide-display');
        itemsToReorder.forEach(item => $('#reorder-list').append(`<li>${item.item}: Need (${item.reorderPoint-item.quantityOnHand}) to restock the ${item.vehicle_id}</li>`));
    }
}

// Sorts items for reorderReport
function sortItem(a, b) {
    const itemA = a.item.toLowerCase();
    const itemB = b.item.toLowerCase();

    let comparison = 0;
    if (itemA > itemB) {
        comparison = 1;
    } else if (itemA < itemB) {
        comparison = -1;
    }
    return comparison;
}

// Event handler for report selection
function runReport() {
    $('#reorder').click(() => {
        $('.report').addClass('js-hide-display');      
        getInventoryItems(reorderReport);
    });
}

// Initialized in inventory.html onload
function getVehicles(callbackfn) {
    $.ajax({
        method: 'GET',
        url: '/api/vehicle',
        success: (data) => {
            callbackfn(data);
            editVehicle();
            deleteVehicle();
        },
    });
}

// Called initally on inventory.html body load to display all vehicles
function displayVehicle(data) {
    if (data.length === 0 ) {
        $('#results').append('<h2 class="noItems">There are no vehicles, use "Add" to create one</h2>');
    } else {
        for (index in data) {
            renderNewVehicle(data[index]);
        }
    }
}

// Used to render a new vehicle when added
function renderNewVehicle(vehicleData) {
    let vehicleImage;
    if (vehicleData.image === 'truck') {
        vehicleImage = 'https://www.knapheide.com/files/source/knapheide/products/Service-Bodies/Crane-Bodies/6108DLR-38J-Crane-Body-Ram-4500.png';
    } else if (vehicleData.image === 'van') {
        vehicleImage = 'http://st.motortrend.com/uploads/sites/10/2016/10/2017-ram-promaster-2500-high-roof-cargo-van-angular-front.png?interpolation=lanczos-none&fit=around|300:199';
    } else {
        vehicleImage = 'http://wfarm3.dataknet.com/static/resources/icons/set31/b4c44600.png';
    }

    $('#results').append(`<div class="item vehicle" id="${vehicleData.id}">
                            <div class="deleteVehicle">
                                <span class="delete">&times;</span>
                            </div>
                            <div class="picture">
                                <img src="${vehicleImage}">
                            </div>  
                            <div class="name-container">
                                <p>${vehicleData.vehicleName}</p>
                                <span class="edit" data-vehicle="${vehicleData.vehicleName}">&#9998;</span>
                            </div>
                        </div>`);
}

// Selects which vehicle to get inventory on
function selectVehicle() {
    $('#results').on('click', '.vehicle', function () {
        $('.vehicle').addClass('js-hide-display');
        $('#add-item').removeClass('js-hide-display');
        $('#add-vehicle').addClass('js-hide-display');
        $('#item-form #vehicle_id').val($(this).find('p')[0].innerHTML);
        getAndDisplayInventoryItems($(this).find('p')[0].innerHTML);
    });
}

// Handles adding a vehicle and displaying the modal
function addVehicle() {
    $('#add-vehicle').click(() => {
        $('#vehicle-form h2').text('Add Vehicle');
        showVehicleModal();
        isVehicle = true;
        $('#vehicle-form #vehicle-input').val('');
    });
    $('#vehicle-form').submit(formSubmitHandler);

    $('#vehicle-close').click(() => {
        hideVehicleModal();
    });
}
// Deletes Vehicle
function deleteVehicle() {
     $('#results').off('click', '.delete').on('click', '.delete', function (e) {
        e.stopPropagation();
        let currentVehicleId = this.parentNode.parentNode.getAttribute('id');
        if (confirm('Are you sure you want to delete this item?') === true) {
            $.ajax({
                method: 'DELETE',
                url: `/api/vehicle/${currentVehicleId}`,
                success: () => {
                    $(`#${currentVehicleId}`).remove();
                    currentVehicleId = '';
                    removeVehicleAlert();
                },
            });
        }
    });
}

function editVehicle() {
    let currentVehicleId = '';
    // Handles Edit Button
    $('#results').on('click', '.edit', function (e) {
        e.stopPropagation();
        showEditVehicleModal();
        const currentVehicle = $(e.currentTarget).data('vehicle');
        currentVehicleId = this.parentNode.parentNode.getAttribute('id');
        const vehicleModal = $('#addNewVehicle-modal')[0].innerHTML;
        $('#editVehicle-modal').html(vehicleModal);
        $('#vehicle-form h2').text('Edit Vehicle');
        $('#vehicle-form #vehicle-input').val(currentVehicle);
    });
    // Click handler for submit button on form
    $('#editVehicle-modal').off().on('submit', '#vehicle-form', (e) => {
        editSubmitHandler(e, currentVehicleId);
    });
    // Closes edit vehicle modal
    $('#editVehicle-modal').on('click', '#vehicle-close', () => {
        hideEditVehicleModal();
        currentVehicleId = '';
    });
}

function editSubmitHandler(e, currentVehicleId) {
    e.preventDefault();
    const updatedVehicle = {
        id: currentVehicleId,
        image: $(event.target).find('#vehicle-image').val(),
        vehicleName: $(event.target).find('#vehicle-input').val(),
    };
    $.ajax({
        url: `api/vehicle/${currentVehicleId}`,
        method: 'PUT',
        data: updatedVehicle,
        success: () => {
            hideEditVehicleModal();
            $('.vehicle').remove();
            getVehicles(displayVehicle);
            editVehicleAlert();
        },
        error: (error) => {
            if (error.responseJSON.length && error.responseJSON[0].msg) {
                $('#editVehicle-modal').find('#vehicle-form').prepend(`<div class="alert alert-danger">${error.responseJSON[0].msg}</div>`);
                setTimeout(function () { $('.alert').addClass('js-hide-display'); }, 5000);
            }
        },
    });
}
