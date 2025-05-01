// Airtable bağlantı ayarları
const AIRTABLE_API_KEY = localStorage.getItem('airtableApiKey') || 'keyXXXXXXXXXXXXXX';
const AIRTABLE_BASE_ID = localStorage.getItem('airtableBaseId') || 'appXXXXXXXXXXXXXX';

// Tablolar
const TABLES = {
    VEHICLES: 'Araçlar',
    CHARGING: 'Şarj İşlemleri',
    PRICING: 'Fiyatlandırma'
};

// DOM yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    initForms();
    loadInitialData();
    
    // API ayarlarını yükle
    if (localStorage.getItem('airtableApiKey')) {
        document.getElementById('airtableApiKey').value = localStorage.getItem('airtableApiKey');
    }
    if (localStorage.getItem('airtableBaseId')) {
        document.getElementById('airtableBaseId').value = localStorage.getItem('airtableBaseId');
    }
});

// Tab işlemleri
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            const tabName = e.target.getAttribute('onclick').split("'")[1];
            openTab(tabName);
        });
    });
}

function openTab(tabName) {
    // Tüm tab içeriklerini gizle
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Tüm tabları pasif yap
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // İlgili tab içeriğini göster
    document.getElementById(tabName).classList.add('active');
    
    // Aktif tabı işaretle
    document.querySelector(`.tab[onclick*="${tabName}"]`).classList.add('active');
    
    // Tab değiştiğinde verileri yenile
    refreshTabData(tabName);
}

// Form işlemleri
function initForms() {
    // Araç ekleme formu
    document.getElementById('addVehicleBtn').addEventListener('click', function() {
        document.getElementById('addVehicleForm').style.display = 'block';
    });
    
    document.getElementById('cancelVehicleBtn').addEventListener('click', function() {
        document.getElementById('addVehicleForm').style.display = 'none';
    });

    // Toplam fiyat hesaplama
    document.getElementById('kWh').addEventListener('input', calculateTotal);
    document.getElementById('price').addEventListener('input', calculateTotal);

    // Form gönderme olayları
    document.getElementById('chargingForm').addEventListener('submit', saveCharging);
    document.getElementById('vehicleForm').addEventListener('submit', saveVehicle);
    document.getElementById('pricingForm').addEventListener('submit', savePricing);
    document.getElementById('apiSettingsForm').addEventListener('submit', saveApiSettings);

    // Rapor işlemleri
    document.getElementById('generateReport').addEventListener('click', generateReport);
    document.getElementById('sendPaymentRequests').addEventListener('click', sendPaymentRequests);
}

// Veri yükleme fonksiyonları
function loadInitialData() {
    loadVehicles();
    loadChargingHistory();
    loadPricing();
}

async function loadVehicles() {
    try {
        const vehicles = await fetchAirtableData(TABLES.VEHICLES);
        populateSelect('vehicle', vehicles);
        populateSelect('filterVehicle', vehicles);
        populateSelect('reportVehicle', vehicles);
        renderVehiclesTable(vehicles);
    } catch (error) {
        console.error('Araçlar yüklenirken hata:', error);
    }
}

async function loadChargingHistory(filters = {}) {
    try {
        const history = await fetchAirtableData(TABLES.CHARGING, filters);
        renderChargingHistoryTable(history);
    } catch (error) {
        console.error('Şarj geçmişi yüklenirken hata:', error);
    }
}

async function loadPricing() {
    try {
        const pricing = await fetchAirtableData(TABLES.PRICING);
        if (pricing.length > 0) {
            document.getElementById('kwhPrice').value = pricing[0].fields.kwhPrice || '';
            document.getElementById('validFrom').value = pricing[0].fields.validFrom || '';
        }
    } catch (error) {
        console.error('Fiyatlandırma yüklenirken hata:', error);
    }
}

// Airtable API fonksiyonları
async function fetchAirtableData(table, filters = {}) {
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
        throw new Error('API anahtarı veya Base ID tanımlı değil');
    }

    let url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}`;
    
    // Filtre varsa ekle
    const filterFormula = buildFilterFormula(filters);
    if (filterFormula) {
        url += `?filterByFormula=${encodeURIComponent(filterFormula)}`;
    }

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`
        }
    });

    if (!response.ok) {
        throw new Error(`Airtable hatası: ${response.status}`);
    }

    const data = await response.json();
    return data.records;
}

function buildFilterFormula(filters) {
    const formulas = [];
    
    if (filters.vehicle) {
        formulas.push(`{Araç} = '${filters.vehicle}'`);
    }
    
    if (filters.dateFrom && filters.dateTo) {
        formulas.push(`IS_AFTER({Tarih}, '${filters.dateFrom}')`);
        formulas.push(`IS_BEFORE({Tarih}, '${filters.dateTo}')`);
    }
    
    if (filters.status) {
        formulas.push(`{Ödeme Durumu} = '${filters.status}'`);
    }
    
    return formulas.join(' AND ');
}

// Render fonksiyonları
function renderVehiclesTable(vehicles) {
    const tbody = document.getElementById('vehiclesTable');
    tbody.innerHTML = '';
    
    if (vehicles.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Kayıtlı araç bulunamadı</td></tr>';
        return;
    }
    
    vehicles.forEach(vehicle => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${vehicle.fields.Plaka || ''}</td>
            <td>${vehicle.fields.Model || ''}</td>
            <td>${vehicle.fields.Sahip || ''}</td>
            <td>${vehicle.fields.İletişim || ''}</td>
            <td>
                <button class="edit-btn" data-id="${vehicle.id}">Düzenle</button>
                <button class="delete-btn" data-id="${vehicle.id}">Sil</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderChargingHistoryTable(history) {
    const tbody = document.getElementById('chargingHistoryTable');
    tbody.innerHTML = '';
    
    if (history.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">Kayıtlı şarj işlemi bulunamadı</td></tr>';
        return;
    }
    
    history.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(record.fields.Tarih)}</td>
            <td>${record.fields.Araç || ''}</td>
            <td>${formatDateTime(record.fields.Başlangıç)}</td>
            <td>${formatDateTime(record.fields.Bitiş)}</td>
            <td>${record.fields['Tüketim (kWh)'] || 0}</td>
            <td>${record.fields.Tutar || 0} ₺</td>
            <td>${record.fields['Ödeme Durumu'] || 'Beklemede'}</td>
            <td>
                <button class="edit-btn" data-id="${record.id}">Düzenle</button>
                <button class="delete-btn" data-id="${record.id}">Sil</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Yardımcı fonksiyonlar
function calculateTotal() {
    const kwh = parseFloat(document.getElementById('kWh').value) || 0;
    const price = parseFloat(document.getElementById('price').value) || 0;
    document.getElementById('totalPrice').value = (kwh * price).toFixed(2);
}

function populateSelect(selectId, data, fieldName = 'Plaka') {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Seçiniz...</option>';
    
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.fields[fieldName] || item.id;
        option.textContent = item.fields[fieldName] || '';
        select.appendChild(option);
    });
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
}

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString('tr-TR');
}

// Kayıt fonksiyonları
async function saveCharging(e) {
    e.preventDefault();
    
    try {
        const formData = {
            fields: {
                Araç: document.getElementById('vehicle').value,
                Başlangıç: document.getElementById('startTime').value,
                Bitiş: document.getElementById('endTime').value,
                'Tüketim (kWh)': parseFloat(document.getElementById('kWh').value),
                'Birim Fiyat': parseFloat(document.getElementById('price').value),
                Tutar: parseFloat(document.getElementById('totalPrice').value),
                'Ödeme Durumu': 'Beklemede',
                Tarih: new Date().toISOString()
            }
        };
        
        await saveAirtableRecord(TABLES.CHARGING, formData);
        alert('Şarj işlemi kaydedildi!');
        e.target.reset();
        loadChargingHistory();
    } catch (error) {
        console.error('Şarj kaydedilirken hata:', error);
        alert('Hata: ' + error.message);
    }
}

async function saveVehicle(e) {
    e.preventDefault();
    
    try {
        const formData = {
            fields: {
                Plaka: document.getElementById('plate').value,
                Model: document.getElementById('model').value,
                Sahip: document.getElementById('owner').value,
                İletişim: document.getElementById('contact').value
            }
        };
        
        await saveAirtableRecord(TABLES.VEHICLES, formData);
        alert('Araç kaydedildi!');
        e.target.reset();
        document.getElementById('addVehicleForm').style.display = 'none';
        loadVehicles();
    } catch (error) {
        console.error('Araç kaydedilirken hata:', error);
        alert('Hata: ' + error.message);
    }
}

async function savePricing(e) {
    e.preventDefault();
    
    try {
        const formData = {
            fields: {
                kwhPrice: parseFloat(document.getElementById('kwhPrice').value),
                validFrom: document.getElementById('validFrom').value
            }
        };
        
        await saveAirtableRecord(TABLES.PRICING, formData);
        alert('Fiyatlandırma güncellendi!');
        loadPricing();
    } catch (error) {
        console.error('Fiyatlandırma kaydedilirken hata:', error);
        alert('Hata: ' + error.message);
    }
}

async function saveApiSettings(e) {
    e.preventDefault();
    
    const apiKey = document.getElementById('airtableApiKey').value;
    const baseId = document.getElementById('airtableBaseId').value;
    
    if (!apiKey || !baseId) {
        alert('Lütfen tüm alanları doldurun!');
        return;
    }
    
    localStorage.setItem('airtableApiKey', apiKey);
    localStorage.setItem('airtableBaseId', baseId);
    
    alert('API ayarları kaydedildi!');
    location.reload(); // Ayarların etkili olması için sayfayı yenile
}

async function saveAirtableRecord(table, data) {
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
        throw new Error('API anahtarı veya Base ID tanımlı değil');
    }

    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`Kayıt işlemi başarısız: ${response.status}`);
    }

    return await response.json();
}

// Rapor fonksiyonları
async function generateReport() {
    const month = document.getElementById('reportMonth').value;
    const vehicle = document.getElementById('reportVehicle').value;
    
    if (!month) {
        alert('Lütfen ay seçin!');
        return;
    }
    
    try {
        const filters = {
            dateFrom: `${month}-01`,
            dateTo: `${month}-31`
        };
        
        if (vehicle) {
            filters.vehicle = vehicle;
        }
        
        const history = await fetchAirtableData(TABLES.CHARGING, filters);
        
        // Raporu oluştur
        let reportHtml = `<h4>${month} Dönemi Raporu</h4>`;
        
        if (vehicle) {
            const vehicleData = history.find(h => h.fields.Araç === vehicle);
            reportHtml += `<p>Araç: ${vehicle}</p>`;
        }
        
        const totalKwh = history.reduce((sum, record) => sum + (parseFloat(record.fields['Tüketim (kWh)']) || 0), 0);
        const totalAmount = history.reduce((sum, record) => sum + (parseFloat(record.fields.Tutar) || 0), 0);
        
        reportHtml += `
            <table>
                <thead>
                    <tr>
                        <th>Toplam Şarj Sayısı</th>
                        <th>Toplam kWh</th>
                        <th>Toplam Tutar</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${history.length}</td>
                        <td>${totalKwh.toFixed(2)} kWh</td>
                        <td>${totalAmount.toFixed(2)} ₺</td>
                    </tr>
                </tbody>
            </table>
            <button id="downloadReport" style="margin-top: 15px;">Raporu İndir (PDF)</button>
        `;
        
        document.getElementById('reportResults').innerHTML = reportHtml;
    } catch (error) {
        console.error('Rapor oluşturulurken hata:', error);
        alert('Hata: ' + error.message);
    }
}

async function sendPaymentRequests() {
    const month = document.getElementById('reportMonth').value;
    
    if (!month) {
        alert('Lütfen ay seçin!');
        return;
    }
    
    try {
        // Burada gerçekte bir e-posta servisi kullanılmalı
        alert(`${month} dönemi için ödeme talepleri gönderildi! (Simülasyon)`);
    } catch (error) {
        console.error('Ödeme talepleri gönderilirken hata:', error);
        alert('Hata: ' + error.message);
    }
}

// Tab değiştiğinde verileri yenile
function refreshTabData(tabName) {
    switch(tabName) {
        case 'vehicles':
            loadVehicles();
            break;
        case 'charging-history':
            loadChargingHistory();
            break;
        case 'dashboard':
            // Dashboard verilerini yenile
            break;
    }
}