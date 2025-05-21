// server.js
const express = require("express");
const axios = require("axios");
const path = require("path");
const bodyParser = require("body-parser");
require("dotenv").config();
const cheerio = require("cheerio");
const https = require("https"); // Native Node module (no need to install)

const app = express();

// Set the view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Define the root route
app.get('/', (req, res) => {
  res.render('index'); // Ensure 'index.ejs' exists in the 'views' directory
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


// Routes
app.post("/get_recipes", async (req, res) => {
  const ingredients = req.body.ingredients;
  const diet = req.body.diet;

  // Adjust query based on diet
  let query = ingredients;
  if (diet === "vegetarian") {
    query += ", vegetarian";
  } else if (diet === "non-vegetarian") {
    query += ", chicken, egg, fish, meat"; // boost meat-based results
  }

  try {
    const response = await axios.get("https://tasty.p.rapidapi.com/recipes/list", {
      params: { from: "0", size: "4", q: query },
      headers: {
        "X-RapidAPI-Key": process.env.RAPID_API_KEY,
        "X-RapidAPI-Host": "tasty.p.rapidapi.com"
      }
    });

    const recipes = response.data.results;
    res.render("results", { recipes });
  } catch (error) {
    console.error("Error fetching recipes:", error.message);
    res.send("An error occurred while fetching recipes.");
  }
});
//Recipes
app.get("/recipe/:slug", async (req, res) => {
  const slug = req.params.slug;
  const url = `https://tasty.co/recipe/${slug}`;

  try {
    https.get(url, (response) => {
      let html = "";

      response.on("data", (chunk) => (html += chunk));
      response.on("end", () => {
        const $ = cheerio.load(html);

        const title = $("h1").first().text();
        const image = $("meta[property='og:image']").attr("content");
        const description = $("meta[name='description']").attr("content");

        const ingredients = [];
        $(".ingredient").each((i, el) => {
          ingredients.push($(el).text().trim());
        });

        const instructions = [];
        $(".prep-step").each((i, el) => {
          instructions.push($(el).text().trim());
        });

        res.render("recipe", {
          recipe: {
            title,
            image,
            description,
            ingredients,
            instructions,
          }
        });
      });
    });
  } catch (err) {
    console.error(err.message);
    res.send("Failed to fetch recipe.");
  }
});



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});