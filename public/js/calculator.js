document.getElementById('quoteForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const quantity = parseFloat(document.getElementById('quantity').value);
    const unitPrice = parseFloat(document.getElementById('unitPrice').value);
    const discountPercent = parseFloat(document.getElementById('discount').value);
    
    // Calculate values
    const subtotal = quantity * unitPrice;
    const discountAmount = (subtotal * discountPercent) / 100;
    const total = subtotal - discountAmount;
    
    // Format currency
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });
    
    // Display results
    document.getElementById('subtotal').textContent = formatter.format(subtotal);
    document.getElementById('discountAmount').textContent = formatter.format(discountAmount);
    document.getElementById('total').textContent = formatter.format(total);
    
    // Show results section
    document.getElementById('quoteResult').classList.remove('d-none');
});
