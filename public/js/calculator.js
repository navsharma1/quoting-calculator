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
        this.taxRateInput = document.getElementById('taxRate');
        this.discountTypeSelect = document.getElementById('discountType');
        this.discountValueInput = document.getElementById('discountValue');

        // Result elements
        this.subtotalElement = document.getElementById('subtotal');
        this.discountElement = document.getElementById('discountAmount');
        this.taxElement = document.getElementById('taxAmount');
        this.totalElement = document.getElementById('total');
    }

    bindEvents() {
        this.addItemBtn.addEventListener('click', () => this.addItem());
        this.newQuoteBtn.addEventListener('click', () => this.resetForm());
        this.saveQuoteBtn.addEventListener('click', () => this.saveQuote());
        this.printQuoteBtn.addEventListener('click', () => this.printQuote());
        
        // Live calculation on any input change
        this.quoteForm.addEventListener('input', () => this.calculateTotal());
        
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

    calculateTotal() {
        let subtotal = 0;
        const items = this.itemsContainer.getElementsByClassName('quote-item');
        
        // Calculate subtotal
        Array.from(items).forEach(item => {
            const quantity = parseFloat(item.querySelector('.item-quantity').value) || 0;
            const price = parseFloat(item.querySelector('.item-price').value) || 0;
            subtotal += quantity * price;
        });

        // Calculate discount
        const discountType = this.discountTypeSelect.value;
        const discountValue = parseFloat(this.discountValueInput.value) || 0;
        let discountAmount = 0;

        if (discountType === 'percentage') {
            discountAmount = (subtotal * discountValue) / 100;
        } else {
            discountAmount = discountValue;
        }

        // Calculate tax
        const taxRate = parseFloat(this.taxRateInput.value) || 0;
        const taxableAmount = subtotal - discountAmount;
        const taxAmount = (taxableAmount * taxRate) / 100;

        // Calculate total
        const total = taxableAmount + taxAmount;

        // Update display
        this.updateDisplay(subtotal, discountAmount, taxAmount, total);
    }

    updateDisplay(subtotal, discount, tax, total) {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        });

        this.subtotalElement.textContent = formatter.format(subtotal);
        this.discountElement.textContent = formatter.format(discount);
        this.taxElement.textContent = formatter.format(tax);
        this.totalElement.textContent = formatter.format(total);
    }

    saveQuote() {
        const quote = {
            id: Date.now(),
            clientName: this.clientNameInput.value,
            date: this.quoteDateInput.value,
            items: Array.from(this.itemsContainer.getElementsByClassName('quote-item')).map(item => ({
                description: item.querySelector('.item-description').value,
                quantity: item.querySelector('.item-quantity').value,
                price: item.querySelector('.item-price').value
            })),
            taxRate: this.taxRateInput.value,
            discountType: this.discountTypeSelect.value,
            discountValue: this.discountValueInput.value
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
        this.taxRateInput.value = quote.taxRate;
        this.discountTypeSelect.value = quote.discountType;
        this.discountValueInput.value = quote.discountValue;

        // Remove default item
        this.itemsContainer.innerHTML = '';

        // Add saved items
        quote.items.forEach(item => {
            const itemElement = this.quoteItemTemplate.content.cloneNode(true);
            itemElement.querySelector('.item-description').value = item.description;
            itemElement.querySelector('.item-quantity').value = item.quantity;
            itemElement.querySelector('.item-price').value = item.price;
            this.itemsContainer.appendChild(itemElement);
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
