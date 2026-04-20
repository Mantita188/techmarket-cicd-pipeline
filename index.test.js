const { greet } = require('./index');

test('debe saludar correctamente', () => {
    expect(greet('Constanza')).toBe('Hola, Constanza! Bienvenido a TechMarket. (Entorno: Mundo)');
});
