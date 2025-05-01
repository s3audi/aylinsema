from flask import Flask, render_template
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

@app.route('/')
def index():
    # n11 sayfasının URL'si
    url = "https://www.n11.com/elektronik"  # Örnek kategori URL'si

    # Sayfayı almak
    response = requests.get(url)

    # Sayfa içeriğini parse et
    soup = BeautifulSoup(response.text, 'html.parser')

    # Ürün başlıklarını ve fiyatlarını bulma
    products = soup.find_all('li', class_='productItem')

    product_list = []

    for product in products:
        # Ürün ismini çekme
        name = product.find('h3', class_='productName')
        if name:
            name = name.text.strip()
        else:
            continue
        
        # Fiyatı çekme
        price = product.find('div', class_='price')
        if price:
            price = price.text.strip()
        else:
            continue
        
        product_list.append({'name': name, 'price': price})

    # Şablonu render et ve verileri gönder
    return render_template('index.html', products=product_list)

if __name__ == '__main__':
    app.run(debug=True)
