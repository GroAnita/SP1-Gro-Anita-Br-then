// Cart object to store items
let cart = [];
let totalAmount = 0;

// Function to update total display
function updateTotal() {
    const totalElement = document.querySelector('.total-ticket h3');
    if (totalElement) {
        totalElement.textContent = `Your total: $${totalAmount.toFixed(2)}`;
    }
}

// Quantity button functionality
const plusButtons = document.querySelectorAll('.qty-btn.plus');
const minusButtons = document.querySelectorAll('.qty-btn.minus');

plusButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const display = button.previousElementSibling;
        let currentValue = parseInt(display.textContent);
        if (currentValue < 10) { // Max 10 tickets
            display.textContent = currentValue + 1;
        }
    });
});

minusButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const display = button.nextElementSibling;
        let currentValue = parseInt(display.textContent);
        if (currentValue > 0) {
            display.textContent = currentValue - 1;
        }
    });
});

// Add to cart functionality
const ticketButtons = document.querySelectorAll('.ticket-buy button');
ticketButtons.forEach((button) => {
    button.addEventListener('click', () => {
        // Get all grid cells
        const gridCells = Array.from(document.querySelectorAll('#cssportal-grid > div'));
        
        // Find which cell contains this button
        const buttonCell = button.closest('.ticket-buy');
        const buttonIndex = gridCells.indexOf(buttonCell);
        
        // Calculate which row this is (accounting for 5 columns and header row)
        const rowIndex = Math.floor((buttonIndex - 5) / 5);
        const rowStart = 5 + (rowIndex * 5);
        
        // Get data from the same row
        const groupName = gridCells[rowStart].textContent;
        const ticketType = gridCells[rowStart + 1].textContent;
        const priceText = gridCells[rowStart + 2].textContent;
        const quantityDisplay = gridCells[rowStart + 3].querySelector('.qty-display');
        
        const price = parseFloat(priceText.replace('$', ''));
        const quantity = parseInt(quantityDisplay.textContent);
        
        if (quantity < 1) {
            alert('Please select a quantity greater than 0');
            return;
        }
        
        const subtotal = price * quantity;
        
        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(item => 
            item.name === groupName && item.type === ticketType
        );
        
        if (existingItemIndex > -1) {
            // Update existing item
            cart[existingItemIndex].quantity += quantity;
            cart[existingItemIndex].subtotal += subtotal;
        } else {
            // Add new item
            cart.push({
                name: groupName,
                type: ticketType,
                price: price,
                quantity: quantity,
                subtotal: subtotal
            });
        }
        
        // Update total
        totalAmount += subtotal;
        
        // Update display
        updateTotal();
        
        // Reset quantity display
        quantityDisplay.textContent = '0';
        
    });
});

// Checkout button
const checkoutBtn = document.querySelector('.checkout-button');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        // Store cart data in sessionStorage for checkout page
        sessionStorage.setItem('cart', JSON.stringify(cart));
        sessionStorage.setItem('total', totalAmount);
        
        // Show what's in cart
        let cartSummary = 'Your cart:\n\n';
        cart.forEach(item => {
            cartSummary += `${item.quantity}x ${item.name} - $${item.subtotal.toFixed(2)}\n`;
        });
        cartSummary += `\nTotal: $${totalAmount.toFixed(2)}`;
        alert(cartSummary);
        
        // Uncomment when you have a checkout page:
        // window.location.href = 'checkout.html';
    });
}

const cartItems = document.querySelector('.cart-items');
if (cartItems) {
    cartItems.innerHTML = '<h3>Cart Items:</h3>\
    <p class="empty-cart">Your cart is empty.</p>';
}
function renderCart() {
    if (cartItems) {
        cartItems.innerHTML = '<h3>Cart Items:</h3>';
        if (cart.length === 0) {
            cartItems.innerHTML += '<p class="empty-cart">Your cart is empty.</p>';
            return;
        }
        cart.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('cart-item');
            itemDiv.innerHTML = `
                <span>${item.quantity}x ${item.name} (${item.type}) - $${item.subtotal.toFixed(2)}</span>
                <div class="empty-cart"><i class="fa-solid fa-trash"></i></div>
            `;
            cartItems.appendChild(itemDiv);
        });
    }
}

// Initial render
renderCart();

// Update cart display whenever an item is added
ticketButtons.forEach((button) => {
    button.addEventListener('click', () => {
        renderCart();
    });
}); 

// Delete item from cart functionality
cartItems.addEventListener('click', (e) => {
    if (e.target.classList.contains('fa-trash')) {
        const itemDiv = e.target.closest('.cart-item');
        const itemText = itemDiv.querySelector('span').textContent;
        const itemNameType = itemText.split(' - ')[0]; // Get "quantity x name (type)"
        
        // Find and remove item from cart
        const itemIndex = cart.findIndex(item => 
            `${item.quantity}x ${item.name} (${item.type})` === itemNameType
        );
        
        if (itemIndex > -1) {
            // Update total amount
            totalAmount -= cart[itemIndex].subtotal;
            cart.splice(itemIndex, 1);
            updateTotal();
            renderCart();
        }
    }
});