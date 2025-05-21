import requests
from bs4 import BeautifulSoup
import sys
import json
from recipe_scrapers import scrape_me

def scrape_recipe(slug):
    url = f"https://tasty.co/recipe/{slug}"
    headers = {
        "User-Agent": "Mozilla/5.0"
    }
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return {"error": "Failed to retrieve the recipe."}

    soup = BeautifulSoup(response.text, 'html.parser')

    # Extract recipe title
    title_tag = soup.find('h1', class_='recipe-name')
    title = title_tag.get_text(strip=True) if title_tag else 'No title found'

    # Extract ingredients
    ingredients = []
    ingredients_tags = soup.find_all('li', class_='ingredient')
    for tag in ingredients_tags:
        ingredients.append(tag.get_text(strip=True))

    # Extract instructions
    instructions = []
    instructions_tags = soup.find_all('li', class_='instruction')
    for tag in instructions_tags:
        instructions.append(tag.get_text(strip=True))

    return {
        "title": title,
        "ingredients": ingredients,
        "instructions": instructions
    }
    from recipe_scrapers import scrape_me

def scrape_recipe(url):
    scraper = scrape_me(url)
    return {
        "title": scraper.title(),
        "ingredients": scraper.ingredients(),
        "instructions": scraper.instructions().split('\n')
    }


if __name__ == "__main__":
    slug = sys.argv[1]
    data = scrape_recipe(slug)
    print(json.dumps(data))
