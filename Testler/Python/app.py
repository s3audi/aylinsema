from flask import Flask, jsonify
from playwright.sync_api import sync_playwright

app = Flask(__name__)

@app.route('/api/finish-products')
def get_finish_products():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('https://www.n11.com/magaza/n11?m=Finish', timeout=60000)
        page.wait_for_selector('.productName', timeout=10000)
        items = page.query_selector_all('.columnContent .pro')

        products = []
        for item in items:
            try:
                title = item.query_selector('.productName').inner_text()
                price = item.query_selector('.newPrice').inner_text()
                image = item.query_selector('img').get_attribute('data-original')
                link = item.get_attribute('href')
                products.append({
                    'title': title,
                    'price': price,
                    'image': image,
                    'link': link
                })
            except:
                continue

        browser.close()
        return jsonify(products)

if __name__ == '__main__':
    app.run(debug=True)