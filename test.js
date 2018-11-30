const data = require('./data.json');

test('check data', () => {
    expect(Array.isArray(data)).toBe(true);
    expect(data.length > 0).toBe(true);
});
