let rowCounter = 0; // Global counter to ensure unique IDs for each row

/**
 * Creates and appends a new row to the calculation table.
 */
function addRow() {
    rowCounter++;
    const rowId = `row-${rowCounter}`;
    const tableBody = document.getElementById('calculation-body');

    // HTML template for a new row (Running Total column removed)
    const newRowHTML = `
        <tr id="${rowId}">
            <td data-label="Height (in)"><input type="number" id="heightInches-${rowCounter}" data-row-id="${rowId}" 
                       class="trigger-new-row" oninput="calculateRow('${rowId}')" value=""></td>
            <td data-label="Width (in)"><input type="number" id="widthInches-${rowCounter}" data-row-id="${rowId}" 
                       class="trigger-new-row" oninput="calculateRow('${rowId}')" value=""></td>
            <td data-label="H (ft)"><output id="heightFeet-${rowCounter}"></output></td>
            <td data-label="W (ft)"><output id="widthFeet-${rowCounter}"></output></td>
            <td data-label="H (Rnd)"><output id="heightRounded-${rowCounter}"></output></td>
            <td data-label="W (Rnd)"><output id="widthRounded-${rowCounter}"></output></td>
            <td data-label="Square ft" class="square-ft-cell"><output id="squareFeet-${rowCounter}" data-sqft-value="0"></output></td>
            <td data-label="Delete"><button onclick="deleteRow('${rowId}')" class="delete-btn">🗑️ Delete</button></td>
        </tr>
    `;

    tableBody.insertAdjacentHTML('beforeend', newRowHTML);
    
    // Attach the auto-add listener to the newly created inputs
    const newHeightInput = document.getElementById(`heightInches-${rowCounter}`);
    const newWidthInput = document.getElementById(`widthInches-${rowCounter}`);
    
    newHeightInput.addEventListener('input', checkAndAddRow);
    newWidthInput.addEventListener('input', checkAndAddRow);

    calculateRow(rowId); 
}

/**
 * Checks if the last row is being typed into and adds a new row if necessary.
 */
function checkAndAddRow() {
    const tableBody = document.getElementById('calculation-body');
    const lastRow = tableBody.lastElementChild; 

    if (lastRow && this.getAttribute('data-row-id') === lastRow.id) {
        
        const heightInput = document.getElementById(`heightInches-${rowCounter}`);
        const widthInput = document.getElementById(`widthInches-${rowCounter}`);
        
        if (parseFloat(heightInput.value) > 0 || parseFloat(widthInput.value) > 0) {
             // Detach listener to prevent multiple rows being added
             heightInput.removeEventListener('input', checkAndAddRow);
             widthInput.removeEventListener('input', checkAndAddRow);
             
             addRow();
        }
    }
}


/**
 * Deletes a specific row and recalculates the totals.
 */
function deleteRow(rowId) {
    const rowToDelete = document.getElementById(rowId);
    if (rowToDelete) {
        rowToDelete.remove();
        calculateGrandTotal(); 
    }
}


/**
 * Calculates all values for a single row based on its unique ID.
 */
function calculateRow(rowId) {
    const counter = rowId.split('-')[1];

    const heightInches = parseFloat(document.getElementById(`heightInches-${counter}`).value) || 0;
    const widthInches = parseFloat(document.getElementById(`widthInches-${counter}`).value) || 0;

    // --- Calculation Logic ---
    let squareFeetValue = 0;
    let squareFeetText = '0.00';
    let heightFeet = 0;
    let widthFeet = 0;
    let heightRounded = '0.00';
    let widthRounded = '0.00';

    if (heightInches > 0 && widthInches > 0) {
        heightFeet = heightInches / 12;
        widthFeet = widthInches / 12;

        heightRounded = heightFeet.toFixed(2); // ROUND(Value, 2)
        widthRounded = widthFeet.toFixed(2); // ROUND(Value, 2)

        squareFeetValue = parseFloat(heightRounded) * parseFloat(widthRounded);
        squareFeetText = squareFeetValue.toFixed(2);
    }

    // --- Update Outputs ---
    updateOutput(`heightFeet-${counter}`, heightFeet > 0 ? heightFeet.toFixed(6) : '');
    updateOutput(`widthFeet-${counter}`, widthFeet > 0 ? widthFeet.toFixed(6) : '');
    updateOutput(`heightRounded-${counter}`, heightFeet > 0 ? heightRounded : '0.00');
    updateOutput(`widthRounded-${counter}`, widthFeet > 0 ? widthRounded : '0.00');
    
    updateOutput(`squareFeet-${counter}`, squareFeetText, squareFeetValue);

    calculateGrandTotal();
}


/**
 * Helper function to update the content of an HTML output element.
 */
function updateOutput(id, textValue, numericValue) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = textValue;
        if (numericValue !== undefined) {
            element.setAttribute('data-sqft-value', numericValue);
        }
    }
}


/**
 * Calculates the sum of all 'Square ft' fields (Grand Total only).
 */
function calculateGrandTotal() {
    let grandTotal = 0;
    
    // Select all output elements that hold the individual Square Ft value
    const sqFtOutputs = document.querySelectorAll('output[id^="squareFeet-"]');
    
    sqFtOutputs.forEach(output => {
        const sqft = parseFloat(output.getAttribute('data-sqft-value')) || 0;
        grandTotal += sqft;
    });

    // Update the final total display
    document.getElementById('grandTotalSqFt').textContent = grandTotal.toFixed(2);
}


// Initialize the worksheet by adding the first row when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.getElementById('addRowButton');
    if (addButton) {
        addButton.style.display = 'none';
    }
    addRow(); 
});