const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Serve static files for Swagger UI
app.use('/swagger-ui', express.static(path.join(__dirname, 'node_modules/swagger-ui-dist')));

// Serve the swagger.json file
app.get('/swagger.json', (req, res) => {
  const swaggerPath = path.join(__dirname, 'swagger.json');
  if (fs.existsSync(swaggerPath)) {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(swaggerPath);
  } else {
    res.status(404).json({ error: 'swagger.json not found' });
  }
});

// Serve the main HTML page
app.get('/', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Volunteer Network API Documentation</title>
    <link rel="stylesheet" type="text/css" href="/swagger-ui/swagger-ui.css" />
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin:0;
            background: #fafafa;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="/swagger-ui/swagger-ui-bundle.js"></script>
    <script src="/swagger-ui/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/swagger.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
        };
    </script>
</body>
</html>`;
  
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`📚 Swagger UI Documentation Server running on http://localhost:${PORT}`);
  console.log(`🔗 API Documentation: http://localhost:${PORT}`);
  console.log(`📋 Swagger JSON: http://localhost:${PORT}/swagger.json`);
  console.log(`🚀 Your API Server: http://localhost:5000`);
}); 