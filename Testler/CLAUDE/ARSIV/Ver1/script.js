// Airtable API taban URL'i
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

// Airtable'dan veri çekme fonksiyonu
async function fetchFromAirtable(tableName) {
  try {
    const response = await fetch(`${AIRTABLE_API_URL}/${tableName}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Airtable API hatası: ' + response.status);
    }
    
    const data = await response.json();
    return data.records;
  } catch (error) {
    console.error('Veri çekme hatası:', error);
    return [];
  }
}

// Airtable'a veri gönderme fonksiyonu
async function postToAirtable(tableName, data) {
  try {
    const response = await fetch(`${AIRTABLE_API_URL}/${tableName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: data
      })
    });
    
    if (!response.ok) {
      throw new Error('Airtable API hatası: ' + response.status);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Veri gönderme hatası:', error);
    return null;
  }
}

// Airtable'da veri güncelleme fonksiyonu
async function updateAirtableRecord(tableName, recordId, data) {
  try {
    const response = await fetch(`${AIRTABLE_API_URL}/${tableName}/${recordId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: data
      })
    });
    
    if (!response.ok) {
      throw new Error('Airtable API hatası: ' + response.status);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Veri güncelleme hatası:', error);
    return null;
  }
}