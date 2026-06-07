const allRestaurants = [
    { id: 1, name: "Warung Koh Ray", distance: 0.8, rating: 2.0, sold: 26, menuSold: 25, food: "Mie Ayam Spesial", price: 18000, imgResto: "../kohray.png", imgFood: "../mieayam.png" },
    { id: 2, name: "Warung Bu Tini", distance: 12.0, rating: 3.0, sold: 78, menuSold: 12, food: "Ayam Geprek", price: 28000, imgResto: "../butini.png", imgFood: "../ayamgeprek.png" },
    { id: 3, name: "Ristorante Italiano", distance: 2.5, rating: 5.0, sold: 210, menuSold: 85, food: "Margherita Pizza", price: 118000, imgResto: "../Ristorante Italiano.png", imgFood: "../margheritta pizza.png" },
    { id: 4, name: "Ristorante Italiano", distance: 2.5, rating: 5.0, sold: 210, menuSold: 42, food: "Pepperoni Pizza", price: 128000, imgResto: "../Ristorante Italiano.png", imgFood: "../pepperoni pizza.png" },
    { id: 5, name: "Ristorante Italiano", distance: 2.5, rating: 5.0, sold: 210, menuSold: 56, food: "Spaghetti Bolognese", price: 30000, imgResto: "../Ristorante Italiano.png", imgFood: "../Spagetti bolognese.png" },
    { id: 6, name: "Ristorante Italiano", distance: 2.5, rating: 5.0, sold: 210, menuSold: 27, food: "Gnocchi", price: 18000, imgResto: "../Ristorante Italiano.png", imgFood: "../gnocchi.png" },
    { id: 7, name: "Burger Bar", distance: 1.2, rating: 4.0, sold: 120, menuSold: 80, food: "Special Burger", price: 28000, imgResto: "../Burger Bar.png", imgFood: "../Special burger.png" },
    { id: 8, name: "Burger Bar", distance: 1.2, rating: 4.0, sold: 120, menuSold: 40, food: "French Fries", price: 28000, imgResto: "../Burger Bar.png", imgFood: "../French fries.png" },
    { id: 9, name: "Warkop Tjap Cobra", distance: 0.5, rating: 3.5, sold: 86, menuSold: 50, food: "Indomie Telur Pedas", price: 15000, imgResto: "../Warkop Tjap Cobra.png", imgFood: "../indomie telur pedas.png" },
    { id: 10, name: "Warkop Tjap Cobra", distance: 0.5, rating: 3.5, sold: 86, menuSold: 36, food: "Kopi Hitam", price: 8000, imgResto: "../Warkop Tjap Cobra.png", imgFood: "../Kopi hitam.png" }
];

let cart = {}; 
let isPromoApplied = false;
let selectedPayment = 'tunai';
let currentDetailId = null; 
let activeFilters = { terdekat: false, rating: null, harga: null };
let currentCheckoutResto = null; 

let notifData = [];
let unreadNotifCount = 0;
let lastPageSebelumNotif = 'page-activity';
let userLat = -6.2020; 
let userLng = 106.7810;
let trackingMap;
let trackingDriverMarker;
let trackingAnimationInterval;
let userName = '';
let userPhone = '';
let correctOTP = '';
let selectedService = '';
let typeInterval;
let typeTimeout;
let resendInterval;
let timeLeft = 10; 

let isOrderActive = false;

window.onload = () => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        userName = localStorage.getItem('userName') || 'Pengguna';
        userPhone = localStorage.getItem('userPhone') || '';
        showPage('page-activity');
        startTypewriter();
    } else {
        userName = '';
        userPhone = '';
        showPage('page-login');
    }
    renderHomeList(allRestaurants);
};

function openPrivacyModal() { document.getElementById('privacy-modal').style.display = 'flex'; }
function closePrivacyModal() { document.getElementById('privacy-modal').style.display = 'none'; }

function goToProfil() {
    document.getElementById('profil-name-display').innerText = userName || 'Pengguna';
    document.getElementById('profil-phone-display').innerText = userPhone ? ('+62 ' + userPhone) : '+62';
    showPage('page-profil');
}

function goBackToActivity() {
    showPage('page-activity');
    startTypewriter(); 
}

function logoutApp() {
    if(confirm("Apakah Anda yakin ingin logout? (Ini akan mengeluarkan akun dari sistem)")) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('userPhone');
        location.reload(); 
    }
}

function goBackToActivityFromHome() {
    showPage('page-activity');
    startTypewriter(); 
}

function requestOTP() {
    userName = document.getElementById('login-name').value.trim();
    userPhone = document.getElementById('login-phone').value.trim();
    
    if(!userName) { alert('Silakan masukkan nama panggilan Anda.'); return; }
    if(!userPhone || userPhone.length < 8) { alert('Silakan masukkan nomor telepon yang valid.'); return; }

    document.getElementById('otp-phone-display').innerText = '+62 ' + userPhone;
    correctOTP = Math.floor(1000 + Math.random() * 9000).toString();
    
    showPage('page-otp');
    document.getElementById('otp1').value = '';
    document.getElementById('otp2').value = '';
    document.getElementById('otp3').value = '';
    document.getElementById('otp4').value = '';
    document.getElementById('otp1').focus();

    document.getElementById('generated-otp').innerText = correctOTP;
    document.getElementById('otp-popup').style.display = 'block';
    
    setTimeout(() => { document.getElementById('otp-popup').style.display = 'none'; }, 10000); 
    startResendTimer();
}

function startResendTimer() {
    clearInterval(resendInterval);
    timeLeft = 10; 
    document.getElementById('resend-text').style.display = 'block';
    document.getElementById('resend-btn').style.display = 'none';
    document.getElementById('resend-timer').innerText = timeLeft;

    resendInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('resend-timer').innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(resendInterval);
            document.getElementById('resend-text').style.display = 'none';
            document.getElementById('resend-btn').style.display = 'block';
        }
    }, 1000);
}

function resendOTP() {
    correctOTP = Math.floor(1000 + Math.random() * 9000).toString();
    document.getElementById('generated-otp').innerText = correctOTP;
    document.getElementById('otp-popup').style.display = 'block';
    
    document.getElementById('otp1').value = '';
    document.getElementById('otp2').value = '';
    document.getElementById('otp3').value = '';
    document.getElementById('otp4').value = '';
    document.getElementById('otp1').focus();
    startResendTimer();

    setTimeout(() => { document.getElementById('otp-popup').style.display = 'none'; }, 10000);
}

function moveToNext(current, nextFieldID) {
    if (current.value.length >= current.maxLength) {
        if(nextFieldID) { document.getElementById(nextFieldID).focus(); } 
        else { verifyOTP(); }
    }
}

function verifyOTP() {
    let input1 = document.getElementById('otp1').value;
    let input2 = document.getElementById('otp2').value;
    let input3 = document.getElementById('otp3').value;
    let input4 = document.getElementById('otp4').value;
    let enteredOTP = input1 + input2 + input3 + input4;
    
    if(enteredOTP.length === 4) {
        if(enteredOTP === correctOTP) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', userName);
            localStorage.setItem('userPhone', userPhone); 

            document.getElementById('otp-popup').style.display = 'none';
            showPage('page-activity');
            startTypewriter();
        } else {
            alert('Kode OTP salah. Silakan coba lagi.');
            document.getElementById('otp1').value = '';
            document.getElementById('otp2').value = '';
            document.getElementById('otp3').value = '';
            document.getElementById('otp4').value = '';
            document.getElementById('otp1').focus();
        }
    }
}

function startTypewriter() {
    const text = userName ? `Hallo ${userName}! Apa yang ingin kamu lakukan hari ini?` : `Hallo! Apa yang ingin kamu lakukan hari ini?`;
    const targetElement = document.getElementById('typewriter-text');
    targetElement.innerHTML = '';
    let i = 0;
    
    if(typeInterval) clearInterval(typeInterval);
    if(typeTimeout) clearTimeout(typeTimeout);
    if(!document.getElementById('page-activity').classList.contains('active')) return;

    typeInterval = setInterval(() => {
        if (i < text.length) {
            targetElement.innerHTML += text.charAt(i);
            i++;
        } else {
            clearInterval(typeInterval);
            typeTimeout = setTimeout(() => { startTypewriter(); }, 3000);
        }
    }, 50);
}

function selectActivity(serviceName, element) {
    if (serviceName !== 'Food') { alert('Untuk simulasi ini, hanya layanan "Food" yang bisa dipilih.'); return; }
    document.querySelectorAll('.activity-btn').forEach(btn => btn.classList.remove('selected'));
    element.classList.add('selected');
    selectedService = serviceName;
    const btnMemesan = document.getElementById('btn-memesan');
    btnMemesan.style.opacity = '1';
    btnMemesan.style.pointerEvents = 'auto';
}

function goToMaximFood() {
    if(selectedService === 'Food') {
        showPage('page-home');
        renderHomeList(allRestaurants);
        updateCartBadge();
    }
}

function showPage(pageId) {
    if(pageId !== 'page-notifikasi' && pageId !== 'page-peta' && pageId !== 'page-login' && pageId !== 'page-otp' && pageId !== 'page-activity' && pageId !== 'page-profil') {
        lastPageSebelumNotif = pageId;
    }
    document.querySelectorAll('.page').forEach(page => { page.classList.remove('active'); });
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0, 0);
}

function goToHome() { 
    showPage('page-home'); 
    updateCartBadge(); 
    document.querySelectorAll('#stars-driver span, #stars-resto span').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tip-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('search-input-home').value = '';
    document.getElementById('search-input').value = '';
    resetFilter();

    const banner = document.getElementById('active-order-banner');
    if (isOrderActive) {
        banner.style.display = 'flex';
    } else {
        banner.style.display = 'none';
    }
}

function returnToTracking() {
    showPage('tracking-page');
}

function goToCart() { 
    showPage('cart-page'); renderCartPage(); 
}

function goToCheckout(restoName) { 
    if(restoName) currentCheckoutResto = restoName;
    showPage('checkout-page'); renderCheckoutPage(); 
}
function goToLokasi() { showPage('page-lokasi'); }
function goToPromo() { showPage('page-promo'); }

function goToNotifikasi() {
    showPage('page-notifikasi');
    unreadNotifCount = 0;
    updateNotifBadge();
    renderNotifikasi();
}

function goBackFromNotif() { showPage(lastPageSebelumNotif); }

function pushNotif(text, icon) {
    const now = new Date();
    const time = String(now.getHours()).padStart(2, '0') + '.' + String(now.getMinutes()).padStart(2, '0');
    notifData.unshift({ text, icon, time }); 
    unreadNotifCount++;
    updateNotifBadge();
    if (document.getElementById('page-notifikasi').classList.contains('active')) {
        renderNotifikasi(); unreadNotifCount = 0; updateNotifBadge();
    }
}

function renderNotifikasi() {
    const container = document.getElementById('notif-list-container');
    container.innerHTML = '';
    if (notifData.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px;">Belum ada notifikasi.</p>'; return;
    }
    notifData.forEach(notif => {
        container.innerHTML += `<div class="notif-card"><div class="notif-icon">${notif.icon}</div><div class="notif-info"><span class="notif-time">${notif.time}</span><span class="notif-text">${notif.text}</span></div></div>`;
    });
}

function updateNotifBadge() {
    const badges = document.querySelectorAll('.notif-badge');
    badges.forEach(badge => {
        if (unreadNotifCount > 0) { badge.style.display = 'flex'; badge.innerText = unreadNotifCount; } 
        else { badge.style.display = 'none'; }
    });
}

function pilihLokasi(alamatText, lat = null, lng = null) {
    if(lat !== null && lng !== null){ userLat = lat; userLng = lng; }
    document.getElementById('checkout-address-text').innerText = "Antar ke " + alamatText;
    document.getElementById('input-cari-lokasi').value = ''; 
    document.getElementById('lokasi-suggestions').style.display = 'none'; 
    showPage('checkout-page');
}

function searchLokasiInput(event) {
    if (event.key === 'Enter') {
        const val = event.target.value;
        if(val.trim() !== '') pilihLokasi(val);
    }
}

function handleSearchHome(event) {
    if (event.key === 'Enter') {
        let val = document.getElementById('search-input-home').value;
        document.getElementById('search-input').value = val;
        showPage('page-search');
        filterProduk();
    }
}

function toggleFilter(type) {
    if (document.getElementById('page-home').classList.contains('active')) showPage('page-search');
    if (type === 'terdekat') activeFilters.terdekat = !activeFilters.terdekat;
    else if (type === 'rating-tinggi') activeFilters.rating = (activeFilters.rating === 'tinggi') ? null : 'tinggi';
    else if (type === 'rating-rendah') activeFilters.rating = (activeFilters.rating === 'rendah') ? null : 'rendah';
    else if (type === 'harga-tinggi') activeFilters.harga = (activeFilters.harga === 'tinggi') ? null : 'tinggi';
    else if (type === 'harga-rendah') activeFilters.harga = (activeFilters.harga === 'rendah') ? null : 'rendah';
    updateFilterUI(); filterProduk();
}

function resetFilter() {
    activeFilters = { terdekat: false, rating: null, harga: null };
    updateFilterUI(); filterProduk();
}

function updateFilterUI() {
    document.querySelectorAll('.chip').forEach(btn => btn.classList.remove('active'));
    if (activeFilters.terdekat) document.getElementById('btn-terdekat').classList.add('active');
    if (activeFilters.rating === 'tinggi') document.getElementById('btn-rating-tinggi').classList.add('active');
    if (activeFilters.rating === 'rendah') document.getElementById('btn-rating-rendah').classList.add('active');
    if (activeFilters.harga === 'tinggi') document.getElementById('btn-harga-tinggi').classList.add('active');
    if (activeFilters.harga === 'rendah') document.getElementById('btn-harga-rendah').classList.add('active');
}

function filterProduk() {
    let input = document.getElementById('search-input').value.toLowerCase().trim();
    let filteredData = allRestaurants.filter(r => r.name.toLowerCase().includes(input) || r.food.toLowerCase().includes(input));
    filteredData.sort((a, b) => {
        if (activeFilters.terdekat && a.distance !== b.distance) return a.distance - b.distance; 
        if (activeFilters.rating && a.rating !== b.rating) return activeFilters.rating === 'tinggi' ? b.rating - a.rating : a.rating - b.rating;
        if (activeFilters.harga && a.price !== b.price) return activeFilters.harga === 'tinggi' ? b.price - a.price : a.price - b.price;
        return 0; 
    });
    renderSearchList(filteredData);
}

function renderSearchList(data) {
    const container = document.getElementById('results-wrapper');
    if(!container) return; container.innerHTML = ''; let ada = false;
    data.forEach(resto => {
        ada = true;
        container.innerHTML += `
            <div class="warung-section" onclick="openDetail(${resto.id})">
                <div class="warung-header">
                    <img src="${resto.imgResto}" class="warung-img">
                    <div>
                        <h3 style="margin: 0 0 5px 0; font-size: 16px;">${resto.name}</h3>
                        <p style="color:#aaa; font-size:12px; margin:0;">${resto.distance} km | ⭐ ${resto.rating.toFixed(1)} | <span style="color:#ffeb00;">${resto.sold}</span> terjual</p>
                    </div>
                </div>
                <div class="product-card">
                    <img src="${resto.imgFood}">
                    <h4 style="font-size: 14px; margin-top: 8px; margin-bottom: 4px; color: #fff;">${resto.food}</h4>
                    <p style="color: #ffeb00; font-size: 13px; font-weight: bold; margin:0;">Rp.${resto.price.toLocaleString('id-ID')}</p>
                </div>
            </div>`;
    });
    let noResultEl = document.getElementById('no-result');
    if(noResultEl) noResultEl.style.display = ada ? "none" : "block";
}

function renderHomeList(data) {
    const container = document.getElementById('recommendation-wrapper');
    if(!container) return; container.innerHTML = ''; 
    data.forEach(resto => {
        container.innerHTML += `
            <div class="home-card" onclick="openDetail(${resto.id})">
                <img src="${resto.imgFood}" alt="${resto.food}">
                <div class="home-card-info">
                    <h2>${resto.food}</h2>
                    <span class="resto-name-home">${resto.name}</span>
                    <p>Rp.${resto.price.toLocaleString('id-ID')}</p>
                </div>
            </div>`;
    });
}

function openDetail(id) {
    currentDetailId = id; const resto = allRestaurants.find(r => r.id === id);
    document.getElementById('detail-bg').src = resto.imgResto; document.getElementById('detail-resto-img').src = resto.imgResto;
    document.getElementById('detail-resto-name').innerText = resto.name; document.getElementById('detail-resto-dist').innerText = resto.distance + " km";
    document.getElementById('detail-resto-rating').innerText = resto.rating.toFixed(1); document.getElementById('detail-resto-sold').innerText = resto.sold + " terjual";
    document.getElementById('detail-food-img').src = resto.imgFood; document.getElementById('detail-food-name').innerText = resto.food;
    document.getElementById('detail-food-price').innerText = "Rp." + resto.price.toLocaleString('id-ID');
    updateQtyUI(); showPage('detail-page');
}

function changeQty(amount) {
    let currentQty = cart[currentDetailId] || 0; currentQty += amount;
    if (currentQty <= 0) delete cart[currentDetailId]; else cart[currentDetailId] = currentQty;
    updateQtyUI();
}

function updateQtyUI() {
    const qty = cart[currentDetailId] || 0; const resto = allRestaurants.find(r => r.id === currentDetailId);
    document.getElementById('qty-display').innerText = qty; const checkoutBar = document.getElementById('checkout-bar');
    if (qty > 0) { 
        checkoutBar.style.display = 'block'; 
        checkoutBar.querySelector('.checkout-btn').innerText = `Beli Sekarang - Rp${(qty * resto.price).toLocaleString('id-ID')}`; 
        checkoutBar.querySelector('.checkout-btn').setAttribute('onclick', `goToCheckout('${resto.name}')`);
    } else { checkoutBar.style.display = 'none'; }
}

function updateCartBadge() {
    const totalItems = Object.keys(cart).length;
    const badges = [document.getElementById('cart-badge-home'), document.getElementById('cart-badge-search')];
    badges.forEach(badge => {
        if(badge) {
            if(totalItems > 0) { badge.style.display = 'flex'; badge.innerText = totalItems; } 
            else { badge.style.display = 'none'; }
        }
    });
}

function clearCart() {
    if(Object.keys(cart).length === 0) return;
    if(confirm("Apakah Anda yakin ingin menghapus semua menu di keranjang?")) {
        cart = {}; renderCartPage(); updateCartBadge(); if(currentDetailId) updateQtyUI();
    }
}

function removeFromCart(id) {
    delete cart[id]; renderCartPage(); updateCartBadge(); if(currentDetailId == id) updateQtyUI();
}

function changeQtyCart(id, amount) {
    let currentQty = cart[id] || 0; currentQty += amount;
    if (currentQty <= 0) delete cart[id]; else cart[id] = currentQty;
    renderCartPage(); updateCartBadge(); if(currentDetailId == id) updateQtyUI();
}

function renderCartPage() {
    const container = document.getElementById('cart-list-container'); container.innerHTML = '';
    const cartIds = Object.keys(cart);
    if (cartIds.length === 0) { container.innerHTML = '<p style="text-align:center; margin-top: 50px; color: black;">Keranjang Anda masih kosong.</p>'; return; }

    let groupedCart = {};
    cartIds.forEach(id => {
        const resto = allRestaurants.find(r => r.id == id);
        if (!groupedCart[resto.name]) groupedCart[resto.name] = [];
        groupedCart[resto.name].push({ id, ...resto, qty: cart[id] });
    });

    Object.keys(groupedCart).forEach(restoName => {
        container.innerHTML += `<h3 style="padding: 15px 20px 5px 20px; font-size: 16px; color: black; background: #f0f0f0;">📍 ${restoName}</h3>`;
        let subtotalResto = 0;
        groupedCart[restoName].forEach(item => {
            subtotalResto += (item.price * item.qty);
            container.innerHTML += `
            <div class="cart-item-card" style="margin: 10px 20px; border-radius: 10px;">
                <img src="${item.imgFood}" class="cart-item-img">
                <div class="cart-item-info">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div><h4>${item.food}</h4></div>
                        <button class="btn-hapus-item" onclick="removeFromCart(${item.id})">🗑️</button>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                        <div class="price">Rp.${item.price.toLocaleString('id-ID')}</div>
                        <div class="qty-controls">
                            <button class="btn-qty btn-minus" style="width:24px;height:24px;font-size:14px;" onclick="changeQtyCart(${item.id}, -1)">−</button>
                            <span class="qty-num" style="font-size:14px; color: white;">${item.qty}</span>
                            <button class="btn-qty btn-plus" style="width:24px;height:24px;font-size:14px;" onclick="changeQtyCart(${item.id}, 1)">+</button>
                        </div>
                    </div>
                </div>
            </div>`;
        });
        container.innerHTML += `
            <button class="btn-lanjut-bayar" style="margin: 0 20px 25px 20px; width: calc(100% - 40px);" 
            onclick="goToCheckout('${restoName}')">Pesan dari ${restoName} - Rp${subtotalResto.toLocaleString('id-ID')}</button>
            <div style="height: 5px; background: #ddd; width: 100%;"></div>
        `;
    });
}

function changeQtyCheckout(id, amount) {
    let currentQty = cart[id] || 0; currentQty += amount;
    if (currentQty <= 0) delete cart[id]; else cart[id] = currentQty;
    let adaItemTokoIni = Object.keys(cart).some(cartId => allRestaurants.find(r => r.id == cartId).name === currentCheckoutResto);
    if (!adaItemTokoIni) goToCart(); else renderCheckoutPage(); 
}

function renderCheckoutPage() {
    const itemContainer = document.getElementById('checkout-items'); itemContainer.innerHTML = '';
    let subtotal = 0; let totalItems = 0;
    Object.keys(cart).forEach(id => {
        const resto = allRestaurants.find(r => r.id == id);
        if (resto.name === currentCheckoutResto) {
            const qty = cart[id]; subtotal += (resto.price * qty); totalItems += qty;
            itemContainer.innerHTML += `
            <div class="co-item-card">
                <img src="${resto.imgFood}" class="co-item-img">
                <div class="co-item-info">
                    <h4>${resto.food}</h4><p>${resto.name}</p>
                    <div class="co-item-price-row">
                        <div class="price">Rp ${resto.price.toLocaleString('id-ID')}</div>
                        <div class="qty-controls">
                            <button class="btn-qty btn-minus" style="width:24px;height:24px;font-size:14px;" onclick="changeQtyCheckout(${id}, -1)">−</button>
                            <span class="qty-num" style="font-size:14px; color: black;">${qty}</span>
                            <button class="btn-qty btn-plus" style="width:24px;height:24px;font-size:14px;" onclick="changeQtyCheckout(${id}, 1)">+</button>
                        </div>
                    </div>
                </div>
            </div>`;
        }
    });
    const ongkir = 8000; const diskon = isPromoApplied ? 12000 : 0; const totalBayar = subtotal + ongkir - diskon;
    document.getElementById('co-qty-text').innerText = `Subtotal(${totalItems} item)`; document.getElementById('co-subtotal').innerText = `Rp. ${subtotal.toLocaleString('id-ID')}`;
    document.getElementById('summary-discount').style.display = isPromoApplied ? 'flex' : 'none';
    document.getElementById('co-total-bayar').innerText = `Rp. ${totalBayar.toLocaleString('id-ID')}`;
}

function selectPayment(method) {
    selectedPayment = method; document.getElementById('radio-kaspro').classList.remove('selected'); document.getElementById('radio-tunai').classList.remove('selected'); document.getElementById(`radio-${method}`).classList.add('selected');
}

function applyPromo() {
    const input = document.getElementById('promo-code-input').value.toUpperCase();
    if (input === 'MAXIM20') { isPromoApplied = true; document.getElementById('promo-success-msg').style.display = 'flex'; renderCheckoutPage(); } else { alert("Kode promo tidak valid"); }
}

function initAnimatedTrackingMap() {
    if (trackingMap) trackingMap.remove();
    
    trackingMap = L.map('tracking-map').setView([userLat, userLng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(trackingMap);

    const homeIcon = L.divIcon({ className: 'custom-map-icon', html: '🏠', iconSize: [30, 30] });
    const driverIcon = L.divIcon({ className: 'custom-map-icon', html: '🛵', iconSize: [30, 30] });
    const restoIcon = L.divIcon({ className: 'custom-map-icon', html: '🏪', iconSize: [30, 30] });

    L.marker([userLat, userLng], {icon: homeIcon}).addTo(trackingMap).bindPopup("Lokasi Kamu").openPopup();

    let restoLat = userLat + 0.012;
    let restoLng = userLng + 0.015;

    let waypoints = [
        [restoLat, restoLng],                           
        [restoLat - 0.004, restoLng],                   
        [restoLat - 0.004, restoLng - 0.008],           
        [userLat + 0.003, restoLng - 0.008],            
        [userLat + 0.003, userLng],                     
        [userLat, userLng]                              
    ];

    L.marker([restoLat, restoLng], {icon: restoIcon}).addTo(trackingMap).bindPopup("Restoran");

    let routeLine = L.polyline(waypoints, { color: '#ff1e00', weight: 4, opacity: 0.8 }).addTo(trackingMap);

    trackingDriverMarker = L.marker([restoLat, restoLng], {icon: driverIcon}).addTo(trackingMap).bindPopup("Driver Anda");

    setTimeout(() => {
        trackingMap.invalidateSize();
        let bounds = L.latLngBounds(waypoints);
        trackingMap.fitBounds(bounds, { padding: [20, 20] });
    }, 400);

    if(trackingAnimationInterval) clearInterval(trackingAnimationInterval);

    let currentSegment = 0;
    let framesPerSegment = 50; 
    let currentFrame = 0;
    let intervalTime = 7000 / (framesPerSegment * (waypoints.length - 1));

    trackingAnimationInterval = setInterval(() => {
        if (currentSegment >= waypoints.length - 1) {
            clearInterval(trackingAnimationInterval);
            return;
        }

        let startPt = waypoints[currentSegment];
        let endPt = waypoints[currentSegment + 1];

        let latStep = (endPt[0] - startPt[0]) / framesPerSegment;
        let lngStep = (endPt[1] - startPt[1]) / framesPerSegment;

        currentFrame++;
        let newLat = startPt[0] + (latStep * currentFrame);
        let newLng = startPt[1] + (lngStep * currentFrame);
        
        let currentPos = [newLat, newLng];
        trackingDriverMarker.setLatLng(currentPos);

        let remainingWaypoints = [currentPos].concat(waypoints.slice(currentSegment + 1));
        routeLine.setLatLngs(remainingWaypoints);

        if (currentFrame >= framesPerSegment) {
            currentSegment++;
            currentFrame = 0;
        }
    }, intervalTime);
}

function goToTracking() {
    isOrderActive = true; 
    showPage('tracking-page'); notifData = []; updateNotifBadge();
    const firstCartId = Object.keys(cart).find(id => allRestaurants.find(r => r.id == id).name === currentCheckoutResto);
    const resto = allRestaurants.find(r => r.id == firstCartId);
    const qty = cart[firstCartId] || 1;
    
    document.getElementById('tracking-food-item').innerHTML = `
        <div style="display: flex; gap: 15px; align-items: center; width: 100%;">
            <img src="${resto.imgFood}" style="width: 70px; height: 70px; border-radius: 8px; object-fit: cover;">
            <div style="flex: 1;">
                <h4 style="font-size: 14px; font-weight: bold; margin: 0 0 3px 0; color: #000;">${resto.food}</h4>
                <p style="font-size: 11px; color: #666; margin: 0 0 5px 0;">${resto.name}</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-weight: bold; font-size: 14px; color: #000;">Rp ${resto.price.toLocaleString('id-ID')}</div>
                    <div style="display: flex; align-items: center; gap: 8px;"><span style="font-weight: bold; font-size: 14px; color: #000; margin: 0 5px;">Jumlah: ${qty}</span></div>
                </div>
            </div>
        </div>`;
    document.getElementById('rating-resto-card').innerHTML = `<div class="card-resto"><img src="${resto.imgResto}" alt="${resto.name}" class="img-resto-sm"><div class="resto-info" style="text-align: left;"><h4>${resto.name}</h4><p>${resto.distance} km</p><div class="stars" style="color:#FFFF00;">★★★★★</div></div></div>`;
    
    Object.keys(cart).forEach(id => {
        const itemQty = cart[id];
        const r = allRestaurants.find(rest => rest.id == parseInt(id));
        if (r && r.name === currentCheckoutResto) {
            r.menuSold = (r.menuSold || 0) + itemQty;
            delete cart[id];
        }
    });
    updateCartBadge();  
    
    startTrackingRealtime();
}

function startTrackingRealtime() {
    document.getElementById('tracking-title-text').innerText = "Estimasi";
    document.getElementById('tracking-state-1').style.display = 'block'; 
    document.getElementById('tracking-state-2').style.display = 'none';  
    document.getElementById('prog-step-2').classList.remove('active'); document.getElementById('prog-step-3').classList.remove('active'); document.getElementById('prog-step-4').classList.remove('active');
    document.getElementById('prog-line-2').classList.remove('active'); document.getElementById('prog-line-3').classList.remove('active');
    document.getElementById('tracking-status-text').innerText = "Mencari driver..."; document.getElementById('driver-card').style.display = 'none'; 
    pushNotif('Mencari driver', 'Ⓜ️');

    setTimeout(() => {
        document.getElementById('prog-step-2').classList.add('active'); document.getElementById('prog-line-2').classList.add('active'); 
        document.getElementById('tracking-status-text').innerText = "Menunggu makananmu"; document.getElementById('driver-card').style.display = 'flex'; 
        pushNotif('Mendapatkan driver', '👤');
        setTimeout(() => pushNotif('Driver sampai di resto', '🍴'), 1000);
        setTimeout(() => pushNotif('Menunggu makananmu', '🍳'), 2000);
    }, 7000); 

    setTimeout(() => {
        document.getElementById('tracking-title-text').innerText = "Tepat waktu";
        document.getElementById('tracking-state-1').style.display = 'none'; 
        document.getElementById('tracking-state-2').style.display = 'block'; 
        document.getElementById('tracking-status-text').innerText = "Driver menuju lokasi mu";
        pushNotif('Makananmu sudah selesai', '🛎️'); setTimeout(() => pushNotif('Driver menuju lokasimu', '🛵'), 1000);
        initAnimatedTrackingMap();
    }, 14000); 

    setTimeout(() => { 
        pushNotif('Pesanan selesai', '🏠'); 
        showPage('page-rating-driver'); 
        
        notifData = []; 
        unreadNotifCount = 0; 
        updateNotifBadge();
    }, 21000); 
}

function rateDriver(num) {
    const stars = document.querySelectorAll('#stars-driver span');
    stars.forEach((star, index) => star.classList.toggle('active', index < num));
    setTimeout(() => { showPage('page-tip-driver'); }, 500);
}

function selectPayment(method) {
    selectedPayment = method; document.getElementById('radio-kaspro').classList.remove('selected'); document.getElementById('radio-tunai').classList.remove('selected'); document.getElementById(`radio-${method}`).classList.add('selected');
}

function applyPromo() {
    const input = document.getElementById('promo-code-input').value.toUpperCase();
    if (input === 'MAXIM20') { isPromoApplied = true; document.getElementById('promo-success-msg').style.display = 'flex'; renderCheckoutPage(); } else { alert("Kode promo tidak valid"); }
}

function initAnimatedTrackingMap() {
    if (trackingMap) trackingMap.remove();
    
    trackingMap = L.map('tracking-map').setView([userLat, userLng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(trackingMap);

    const homeIcon = L.divIcon({ className: 'custom-map-icon', html: '🏠', iconSize: [30, 30] });
    const driverIcon = L.divIcon({ className: 'custom-map-icon', html: '🛵', iconSize: [30, 30] });
    const restoIcon = L.divIcon({ className: 'custom-map-icon', html: '🏪', iconSize: [30, 30] });

    L.marker([userLat, userLng], {icon: homeIcon}).addTo(trackingMap).bindPopup("Lokasi Kamu").openPopup();

    let restoLat = userLat + 0.012;
    let restoLng = userLng + 0.015;

    let waypoints = [
        [restoLat, restoLng],                           
        [restoLat - 0.004, restoLng],                   
        [restoLat - 0.004, restoLng - 0.008],           
        [userLat + 0.003, restoLng - 0.008],            
        [userLat + 0.003, userLng],                     
        [userLat, userLng]                              
    ];

    L.marker([restoLat, restoLng], {icon: restoIcon}).addTo(trackingMap).bindPopup("Restoran");

    let routeLine = L.polyline(waypoints, { color: '#ff1e00', weight: 4, opacity: 0.8 }).addTo(trackingMap);

    trackingDriverMarker = L.marker([restoLat, restoLng], {icon: driverIcon}).addTo(trackingMap).bindPopup("Driver Anda");

    setTimeout(() => {
        trackingMap.invalidateSize();
        let bounds = L.latLngBounds(waypoints);
        trackingMap.fitBounds(bounds, { padding: [20, 20] });
    }, 400);

    if(trackingAnimationInterval) clearInterval(trackingAnimationInterval);

    let currentSegment = 0;
    let framesPerSegment = 50; 
    let currentFrame = 0;
    let intervalTime = 7000 / (framesPerSegment * (waypoints.length - 1));

    trackingAnimationInterval = setInterval(() => {
        if (currentSegment >= waypoints.length - 1) {
            clearInterval(trackingAnimationInterval);
            return;
        }

        let startPt = waypoints[currentSegment];
        let endPt = waypoints[currentSegment + 1];

        let latStep = (endPt[0] - startPt[0]) / framesPerSegment;
        let lngStep = (endPt[1] - startPt[1]) / framesPerSegment;

        currentFrame++;
        let newLat = startPt[0] + (latStep * currentFrame);
        let newLng = startPt[1] + (lngStep * currentFrame);
        
        let currentPos = [newLat, newLng];
        trackingDriverMarker.setLatLng(currentPos);

        let remainingWaypoints = [currentPos].concat(waypoints.slice(currentSegment + 1));
        routeLine.setLatLngs(remainingWaypoints);

        if (currentFrame >= framesPerSegment) {
            currentSegment++;
            currentFrame = 0;
        }
    }, intervalTime);
}

function goToTracking() {
    isOrderActive = true; 
    showPage('tracking-page'); notifData = []; updateNotifBadge();
    const firstCartId = Object.keys(cart).find(id => allRestaurants.find(r => r.id == id).name === currentCheckoutResto);
    const resto = allRestaurants.find(r => r.id == firstCartId);
    const qty = cart[firstCartId] || 1;
    
    document.getElementById('tracking-food-item').innerHTML = `
        <div style="display: flex; gap: 15px; align-items: center; width: 100%;">
            <img src="${resto.imgFood}" style="width: 70px; height: 70px; border-radius: 8px; object-fit: cover;">
            <div style="flex: 1;">
                <h4 style="font-size: 14px; font-weight: bold; margin: 0 0 3px 0; color: #000;">${resto.food}</h4>
                <p style="font-size: 11px; color: #666; margin: 0 0 5px 0;">${resto.name}</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-weight: bold; font-size: 14px; color: #000;">Rp ${resto.price.toLocaleString('id-ID')}</div>
                    <div style="display: flex; align-items: center; gap: 8px;"><span style="font-weight: bold; font-size: 14px; color: #000; margin: 0 5px;">Jumlah: ${qty}</span></div>
                </div>
            </div>
        </div>`;
    document.getElementById('rating-resto-card').innerHTML = `<div class="card-resto"><img src="${resto.imgResto}" alt="${resto.name}" class="img-resto-sm"><div class="resto-info" style="text-align: left;"><h4>${resto.name}</h4><p>${resto.distance} km</p><div class="stars" style="color:#FFFF00;">★★★★★</div></div></div>`;
    
    Object.keys(cart).forEach(id => {
        const itemQty = cart[id];
        const r = allRestaurants.find(rest => rest.id == parseInt(id));
        if (r && r.name === currentCheckoutResto) {
            r.menuSold = (r.menuSold || 0) + itemQty;
            delete cart[id];
        }
    });
    updateCartBadge();  
    
    startTrackingRealtime();
}

function startTrackingRealtime() {
    document.getElementById('tracking-title-text').innerText = "Estimasi";
    document.getElementById('tracking-state-1').style.display = 'block'; 
    document.getElementById('tracking-state-2').style.display = 'none';  
    document.getElementById('prog-step-2').classList.remove('active'); document.getElementById('prog-step-3').classList.remove('active'); document.getElementById('prog-step-4').classList.remove('active');
    document.getElementById('prog-line-2').classList.remove('active'); document.getElementById('prog-line-3').classList.remove('active');
    document.getElementById('tracking-status-text').innerText = "Mencari driver..."; document.getElementById('driver-card').style.display = 'none'; 
    pushNotif('Mencari driver', 'Ⓜ️');

    setTimeout(() => {
        document.getElementById('prog-step-2').classList.add('active'); document.getElementById('prog-line-2').classList.add('active'); 
        document.getElementById('tracking-status-text').innerText = "Menunggu makananmu"; document.getElementById('driver-card').style.display = 'flex'; 
        pushNotif('Mendapatkan driver', '👤');
        setTimeout(() => pushNotif('Driver sampai di resto', '🍴'), 1000);
        setTimeout(() => pushNotif('Menunggu makananmu', '🍳'), 2000);
    }, 7000); 

    setTimeout(() => {
        document.getElementById('tracking-title-text').innerText = "Tepat waktu";
        document.getElementById('tracking-state-1').style.display = 'none'; 
        document.getElementById('tracking-state-2').style.display = 'block'; 
        document.getElementById('tracking-status-text').innerText = "Driver menuju lokasi mu";
        pushNotif('Makananmu sudah selesai', '🛎️'); setTimeout(() => pushNotif('Driver menuju lokasimu', '🛵'), 1000);
        initAnimatedTrackingMap();
    }, 14000); 

    setTimeout(() => { 
        pushNotif('Pesanan selesai', '🏠'); 
        showPage('page-rating-driver'); 
        
        notifData = []; 
        unreadNotifCount = 0; 
        updateNotifBadge();
    }, 21000); 
}

function rateDriver(num) {
    const stars = document.querySelectorAll('#stars-driver span');
    stars.forEach((star, index) => star.classList.toggle('active', index < num));
    setTimeout(() => { showPage('page-tip-driver'); }, 500);
}

function selectTip(element) {
    document.querySelectorAll('.tip-btn').forEach(btn => btn.classList.remove('active')); element.classList.add('active');
}
function submitTip() { showPage('page-rating-resto'); }
function skipTip() { showPage('page-rating-resto'); }
function goBackToTip() { showPage('page-tip-driver'); }

function tampilkanPopupTerimaKasih() {
    let popup = document.createElement('div');
    popup.id = 'thankyou-popup';
    popup.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:#1c212a; color:#fff; padding:25px; border-radius:15px; z-index:9999; box-shadow:0 4px 20px rgba(0,0,0,0.7); text-align:center; width:85%; max-width:320px; border:2px solid #ffeb00; animation: fadein 0.3s;';
    
    popup.innerHTML = `
        <div style="font-size:45px; margin-bottom:15px;">💛</div>
        <h3 style="margin:0 0 10px 0; color:#ffeb00; font-size:20px;">Terima Kasih!</h3>
        <p style="font-size:14px; margin:0 0 20px 0; color:#ccc; line-height:1.5;">Setiap rating dari Anda sangat berarti bagi kami.<br><br>Selamat menikmati pesanannya!</p>
        <button onclick="document.getElementById('thankyou-popup').remove()" style="background:#ffeb00; color:#000; border:none; padding:12px 20px; width: 100%; border-radius:10px; font-weight:bold; font-size: 15px; cursor:pointer;">Tutup</button>
    `;
    
    document.body.appendChild(popup);

    setTimeout(() => {
        let el = document.getElementById('thankyou-popup');
        if(el) el.remove();
    }, 4000);
}

function rateResto(num) {
    const stars = document.querySelectorAll('#stars-resto span');
    stars.forEach((star, index) => star.classList.toggle('active', index < num));
    setTimeout(() => { 
        allRestaurants.forEach(r => { if (r.name === currentCheckoutResto) r.sold += 1; });
        
        isPromoApplied = false; 
        isOrderActive = false; 
        
        notifData = []; 
        unreadNotifCount = 0;
        updateNotifBadge();
        
        currentCheckoutResto = null;
        renderHomeList(allRestaurants); 
        updateCartBadge(); 
        goToHome(); 
        tampilkanPopupTerimaKasih();
    }, 500);
}

let typingTimer;                
const doneTypingInterval = 500;  

function handleLokasiInput(event) {
    clearTimeout(typingTimer);
    const query = event.target.value;
    const suggestionBox = document.getElementById('lokasi-suggestions');

    if (query.length < 3) { suggestionBox.style.display = 'none'; return; }

    typingTimer = setTimeout(() => { cariLokasiOSM(query); }, doneTypingInterval);
}

function cariLokasiOSM(query) {
    const suggestionBox = document.getElementById('lokasi-suggestions');
    suggestionBox.innerHTML = '<div style="padding: 15px; color: #aaa; text-align: center;">Mencari lokasi...</div>';
    suggestionBox.style.display = 'block';

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=id`)
        .then(res => res.json())
        .then(data => {
            suggestionBox.innerHTML = '';
            if (data.length === 0) { suggestionBox.innerHTML = '<div style="padding: 15px; color: #ff4444; text-align: center;">Lokasi tidak ditemukan</div>'; return; }

            data.forEach(item => {
                let parts = item.display_name.split(', ');
                let mainText = parts[0];
                let subText = parts.slice(1).join(', ');

                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.innerHTML = `
                    <div class="sugg-icon">📍</div>
                    <div class="sugg-text">
                        <h4>${mainText}</h4>
                        <p>${subText}</p>
                    </div>
                `;
                div.onclick = () => {
                    document.getElementById('input-cari-lokasi').value = mainText;
                    suggestionBox.style.display = 'none';
                    pilihLokasi(item.display_name, parseFloat(item.lat), parseFloat(item.lon)); 
                };
                suggestionBox.appendChild(div);
            });
        })
        .catch(err => {
            suggestionBox.innerHTML = '<div style="padding: 15px; color: #ff4444; text-align: center;">Gagal memuat data. Cek koneksi Anda.</div>';
        });
}

function dapatkanLokasiAsli() {
    const teksLokasi = document.getElementById('teks-lokasi-asli');
    teksLokasi.innerText = "Mendeteksi lokasi...";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(berhasilDapatLokasi, gagalDapatLokasi, {
            enableHighAccuracy: true, timeout: 10000, maximumAge: 0
        });
    } else {
        alert("Geolokasi tidak didukung oleh browser/perangkat Anda.");
        teksLokasi.innerText = "Klik untuk mendeteksi lokasi otomatis...";
    }
}

function berhasilDapatLokasi(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            let alamatPendek = data.display_name.split(',').slice(0, 3).join(', ');
            document.getElementById('teks-lokasi-asli').innerText = alamatPendek;
            pilihLokasi(alamatPendek, lat, lon); 
        })
        .catch(error => {
            let fallbackAlamat = `Koordinat: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
            document.getElementById('teks-lokasi-asli').innerText = fallbackAlamat;
            pilihLokasi(fallbackAlamat, lat, lon);
        });
}

function gagalDapatLokasi(error) {
    let teksLokasi = document.getElementById('teks-lokasi-asli');
    alert("Gagal mendeteksi lokasi. Pastikan GPS/Location aktif.");
    teksLokasi.innerText = "Klik untuk mendeteksi lokasi otomatis...";
}

let map;
let marker;

function bukaPeta() {
    showPage('page-peta');
    
    setTimeout(() => {
        if (!map) {
            map = L.map('map').setView([-6.1754, 106.8272], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(pos => {
                    map.setView([pos.coords.latitude, pos.coords.longitude], 16);
                });
            }

            map.on('click', function(e) {
                let lat = e.latlng.lat;
                let lon = e.latlng.lng;
                
                if (marker) map.removeLayer(marker);
                marker = L.marker([lat, lon]).addTo(map);

                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                    .then(res => res.json())
                    .then(data => {
                        let alamatPendek = data.display_name.split(',').slice(0, 3).join(', ');
                        setTimeout(() => {
                            if(confirm("Pilih lokasi ini?\n" + alamatPendek)) { pilihLokasi(alamatPendek, lat, lon); }
                        }, 300);
                    }).catch(err => {
                        let fallback = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
                        setTimeout(() => {
                            if(confirm("Gagal dapat nama jalan. Gunakan koordinat ini?\n" + fallback)) { pilihLokasi(fallback, lat, lon); }
                        }, 300);
                    });
            });
        } else {
            map.invalidateSize();
        }
    }, 100);
}

function tutupPeta() { showPage('page-lokasi'); }