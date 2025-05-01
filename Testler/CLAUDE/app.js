// Orijinal app.js içeriği burada aynen kalacak

// Sadece DOMContentLoaded event listener'ını güncelliyoruz
document.addEventListener('DOMContentLoaded', async function() {
    // Önce API bağlantısını kontrol et
    const isConnected = await checkApiConnection();
    
    if (isConnected) {
        // Bağlantı varsa uygulamayı başlat
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
    } else {
        // Bağlantı yoksa kullanıcıyı ayarlara yönlendir
        document.getElementById('settings').click();
    }
});

// API bağlantı kontrol fonksiyonu (HTML tarafına taşındı)
// Diğer tüm fonksiyonlar orijinal halleriyle kalacak