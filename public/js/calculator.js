class QuoteCalculator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.loadSavedQuotes();
        this.setDefaultDate();
        this.addItem(); // Add first item by default
    }

    initializeElements() {
        // Forms and containers
        this.quoteForm = document.getElementById('quoteForm');
        this.itemsContainer = document.getElementById('itemsContainer');
        this.quoteItemTemplate = document.getElementById('quoteItemTemplate');
        this.savedQuotesList = document.getElementById('savedQuotesList');

        // Buttons
        this.addItemBtn = document.getElementById('addItem');
        this.newQuoteBtn = document.getElementById('newQuote');
        this.saveQuoteBtn = document.getElementById('saveQuote');
        this.printQuoteBtn = document.getElementById('printQuote');

        // Input fields
        this.clientNameInput = document.getElementById('clientName');
        this.quoteDateInput = document.getElementById('quoteDate');

        // Result elements
        this.subtotalElement = document.getElementById('subtotal');
        this.totalDiscountElement = document.getElementById('totalDiscount');
        this.totalElement = document.getElementById('total');
    }

    bindEvents() {
        this.addItemBtn.addEventListener('click', () => this.addItem());
        this.newQuoteBtn.addEventListener('click', () => this.resetForm());
        this.saveQuoteBtn.addEventListener('click', () => this.saveQuote());
        this.printQuoteBtn.addEventListener('click', () => this.printQuote());
        
        // Live calculation on any input change
        this.itemsContainer.addEventListener('input', (e) => {
            const item = e.target.closest('.quote-item');
            if (item) {
                this.updateItemDisplay(item);
                this.calculateTotal();
            }
        });

        // Live calculation on discount type change
        this.itemsContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('item-discount-type')) {
                const item = e.target.closest('.quote-item');
                if (item) {
                    this.updateItemDisplay(item);
                    this.calculateTotal();
                }
            }
        });
        
        // Delete item event delegation
        this.itemsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-item') || e.target.parentElement.classList.contains('delete-item')) {
                const item = e.target.closest('.quote-item');
                if (item && this.itemsContainer.children.length > 1) {
                    item.remove();
                    this.calculateTotal();
                }
            }
        });
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        this.quoteDateInput.value = today;
    }

    addItem() {
        const itemElement = this.quoteItemTemplate.content.cloneNode(true);
        this.itemsContainer.appendChild(itemElement);
        this.calculateTotal();
    }

    calculateItemTotal(item) {
        const quantity = parseFloat(item.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(item.querySelector('.item-price').value) || 0;
        const discountType = item.querySelector('.item-discount-type').value;
        const discountValue = parseFloat(item.querySelector('.item-discount-value').value) || 0;
        
        const lineTotal = quantity * price;
        let discountAmount = 0;

        if (discountType === 'percentage') {
            discountAmount = (lineTotal * discountValue) / 100;
        } else {
            discountAmount = Math.min(discountValue, lineTotal); // Prevent negative totals
        }

        return {
            lineTotal,
            discountAmount,
            finalTotal: lineTotal - discountAmount
        };
    }

    updateItemDisplay(item) {
        const { lineTotal, discountAmount, finalTotal } = this.calculateItemTotal(item);
        
        // Update or create the total display for this item
        let totalDisplay = item.querySelector('.item-total');
        if (!totalDisplay) {
            totalDisplay = document.createElement('div');
            totalDisplay.className = 'item-total';
            item.querySelector('.row').appendChild(totalDisplay);
        }

        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        const discountType = item.querySelector('.item-discount-type').value;
        const discountValue = parseFloat(item.querySelector('.item-discount-value').value) || 0;
        const discountText = discountType === 'percentage' ? `${discountValue}%` : formatter.format(discountValue);

        totalDisplay.innerHTML = `
            <div class="total-grid">
                <div>
                    <div class="total-value">${formatter.format(lineTotal)}</div>
                    <small class="text-muted">Subtotal</small>
                </div>
                <div>
                    <div class="discount-value">-${formatter.format(discountAmount)}</div>
                    <small class="text-muted">Discount (${discountText})</small>
                </div>
                <div>
                    <div class="final-total">${formatter.format(finalTotal)}</div>
                    <small class="text-muted">Total</small>
                </div>
            </div>
        `;

        // Add a fade-in effect to the total display
        totalDisplay.style.opacity = '0';
        setTimeout(() => {
            totalDisplay.style.transition = 'opacity 0.3s ease-in-out';
            totalDisplay.style.opacity = '1';
        }, 50);
    }

    calculateTotal() {
        let subtotal = 0;
        let totalDiscount = 0;
        const items = this.itemsContainer.getElementsByClassName('quote-item');
        
        // Calculate totals with precision handling
        Array.from(items).forEach(item => {
            const { lineTotal, discountAmount, finalTotal } = this.calculateItemTotal(item);
            // Round to 2 decimal places to avoid floating-point errors
            subtotal = parseFloat((subtotal + lineTotal).toFixed(2));
            totalDiscount = parseFloat((totalDiscount + discountAmount).toFixed(2));
        });

        // Calculate final total
        const total = parseFloat((subtotal - totalDiscount).toFixed(2));

        // Update display
        this.updateDisplay(subtotal, totalDiscount, total);
    }

    updateDisplay(subtotal, totalDiscount, total) {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        // Update the summary table with animations
        const elements = [
            { element: this.subtotalElement, value: subtotal },
            { element: this.totalDiscountElement, value: totalDiscount },
            { element: this.totalElement, value: total }
        ];

        elements.forEach(({ element, value }) => {
            const currentValue = element.textContent;
            const newValue = formatter.format(value);
            
            if (currentValue !== newValue) {
                element.style.transition = 'color 0.3s ease-in-out';
                element.style.color = value < 0 ? 'var(--danger-color)' : 'inherit';
                element.textContent = newValue;
            }
        });
    }

    saveQuote() {
        const quote = {
            id: Date.now(),
            clientName: this.clientNameInput.value,
            date: this.quoteDateInput.value,
            items: Array.from(this.itemsContainer.getElementsByClassName('quote-item')).map(item => ({
                description: item.querySelector('.item-description').value,
                quantity: item.querySelector('.item-quantity').value,
                price: item.querySelector('.item-price').value,
                discountType: item.querySelector('.item-discount-type').value,
                discountValue: item.querySelector('.item-discount-value').value
            }))
        };

        // Save to localStorage
        const savedQuotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
        savedQuotes.push(quote);
        localStorage.setItem('savedQuotes', JSON.stringify(savedQuotes));

        this.loadSavedQuotes();
    }

    loadSavedQuotes() {
        const savedQuotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
        this.savedQuotesList.innerHTML = '';

        savedQuotes.reverse().forEach(quote => {
            const item = document.createElement('a');
            item.href = '#';
            item.className = 'list-group-item list-group-item-action';
            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${quote.clientName}</h6>
                    <small>${quote.date}</small>
                </div>
                <small class="text-muted">${quote.items.length} items</small>
            `;

            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadQuote(quote);
            });

            this.savedQuotesList.appendChild(item);
        });
    }

    loadQuote(quote) {
        this.resetForm();
        
        this.clientNameInput.value = quote.clientName;
        this.quoteDateInput.value = quote.date;

        // Remove default item
        this.itemsContainer.innerHTML = '';

        // Add saved items
        quote.items.forEach(item => {
            const itemElement = this.quoteItemTemplate.content.cloneNode(true);
            itemElement.querySelector('.item-description').value = item.description;
            itemElement.querySelector('.item-quantity').value = item.quantity;
            itemElement.querySelector('.item-price').value = item.price;
            itemElement.querySelector('.item-discount-type').value = item.discountType;
            itemElement.querySelector('.item-discount-value').value = item.discountValue;
            this.itemsContainer.appendChild(itemElement);
            
            // Update the display for this item
            this.updateItemDisplay(this.itemsContainer.lastElementChild);
        });

        this.calculateTotal();
    }

    resetForm() {
        this.quoteForm.reset();
        this.itemsContainer.innerHTML = '';
        this.setDefaultDate();
        this.addItem();
    }

    printQuote() {
        window.print();
    }
}

// Initialize the calculator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuoteCalculator();
});
