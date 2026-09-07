<!-- OVERLAY -->
<div id="overlay" class="overlay" style="display:none;"></div>

<!-- CHECKOUT MODAL -->
<div id="checkout-modal" class="modal" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:#fff; padding:25px; z-index:1000; width:90%; max-width:500px; border-radius:8px; max-height:90vh; overflow-y:auto;">
    <span class="close-btn" onclick="closeAllModals()" style="float:right; cursor:pointer; font-weight:bold;">&times;</span>
    <h3 style="margin-top:0;">Complete Your Order</h3>
    
    <form id="checkout-form" onsubmit="event.preventDefault();">
        <label style="display:block; margin-top:10px; font-size:12px; font-weight:bold;">Full Name</label>
        <input type="text" id="checkout-name" placeholder="e.g. Jane Doe" style="width:100%; padding:8px; margin-top:4px;" required>

        <label style="display:block; margin-top:10px; font-size:12px; font-weight:bold;">Email Address</label>
        <input type="email" id="checkout-email" placeholder="e.g. jane@gmail.com" style="width:100%; padding:8px; margin-top:4px;" required>

        <label style="display:block; margin-top:10px; font-size:12px; font-weight:bold;">SA Phone Number</label>
        <input type="tel" id="checkout-phone" placeholder="e.g. 0815385051 or +27815385051" style="width:100%; padding:8px; margin-top:4px;" required>

        <label style="display:block; margin-top:10px; font-size:12px; font-weight:bold;">Delivery Method</label>
        <select id="checkout-delivery-method" onchange="updateCheckoutTotals()" style="width:100%; padding:8px; margin-top:4px;" required>
            <option value="">-- Select Delivery Option --</option>
            <option value="pudo_locker">Pudo Locker-to-Locker (R60.00)</option>
            <option value="pudo_door">Pudo Door Courier (R80.00 - R150.00)</option>
            <option value="paxi">Paxi Store-to-Store (R60.00 - R110.00)</option>
            <option value="pickup">Local Pick Up (Free)</option>
        </select>

        <label style="display:block; margin-top:10px; font-size:12px; font-weight:bold;">Delivery Address / Locker Store Code</label>
        <textarea id="checkout-address" placeholder="Street address or Paxi/Pudo point details..." style="width:100%; padding:8px; margin-top:4px;" rows="2"></textarea>

        <!-- SUMMARY -->
        <div style="margin-top:15px; padding:12px; background:#f9f9f9; border-radius:6px; font-size:13px;">
            <div>Shipping Fee: <strong id="checkout-shipping-cost">R0.00</strong></div>
            <div style="font-size:15px; margin-top:5px;">Grand Total: <strong id="checkout-grand-total">R0.00</strong></div>
        </div>

        <!-- PAYMENT OPTIONS -->
        <div style="margin-top:20px; display:flex; gap:10px;">
            <button type="button" class="btn-dark" style="flex:1; padding:10px; background:#222; color:#fff;" onclick="payWithPaystack()">Pay via Card / Paystack</button>
            <button type="button" class="btn-dark" style="flex:1; padding:10px; background:#555; color:#fff;" onclick="toggleEftDetails()">Pay via Bank EFT</button>
        </div>

        <!-- EFT INSTRUCTIONS -->
        <div id="eft-details" style="display:none; margin-top:15px; padding:12px; border:1px solid #ddd; background:#fff border-radius:6px; font-size:12px;">
            <p style="margin:0 0 8px;"><strong>Bank Transfer Details:</strong><br>Bank: FNB<br>Account: 62000000000<br>Branch Code: 250655</p>
            <button type="button" style="width:100%; padding:8px; background:#2e7d32; color:#fff; border:none; cursor:pointer;" onclick="completeEftOrder()">Confirm EFT Order</button>
        </div>
    </form>
</div>
