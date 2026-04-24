const express = require('express');
const app = express();
const port = 3000;

/**
 * Función central: saluda y muestra el color del entorno.
 */
function greet(name) {
    // Aquí usamos la variable que inyectaremos desde el pipeline
    const appColor = process.env.APP_COLOR || "Mundo"; 

    if (!name) {
        return `Hola! Soy TechMarket operando en modo: ${appColor}`;
    }
    return `Hola, ${name}! Bienvenido a TechMarket. (Entorno: ${appColor})`;
}

app.get('/', (req, res) => {
    const greeting = greet(req.query.name);
    res.send(greeting);
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Servidor de TechMarket en http://localhost:${port}`);
    });
}

module.exports = { greet };
