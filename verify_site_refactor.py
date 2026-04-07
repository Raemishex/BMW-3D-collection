from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Get absolute path to index.html
        path = os.path.abspath("index.html")
        page.goto(f"file://{path}")

        # 1. Take screenshot of index.html
        page.wait_for_timeout(1000) # Wait for animations
        page.screenshot(path="verification_index.png")

        # 2. Check specs page for counters
        path_specs = os.path.abspath("specs.html")
        page.goto(f"file://{path_specs}")
        page.wait_for_timeout(2500) # Wait for counter animation to finish
        page.screenshot(path="verification_specs.png")

        # 3. Check M5 experience page
        path_m5 = os.path.abspath("m5.html")
        page.goto(f"file://{path_m5}")
        page.wait_for_timeout(1000)
        page.screenshot(path="verification_m5.png")

        browser.close()

if __name__ == "__main__":
    run()
