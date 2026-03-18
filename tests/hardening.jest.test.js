
const graph = require('../index');
const request = require('request');

// Mock request
jest.mock('request');

describe('Hardening JSON Parsing (Jest)', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('GET request with malformed JSON (starting with {) should return error', (done) => {
    const mockRes = { headers: { 'content-type': 'text/html' } };
    const mockBody = '{ malformed json';

    request.get.mockImplementation((options, callback) => {
      setImmediate(() => callback(null, mockRes, mockBody));
      return { on: jest.fn().mockReturnThis() };
    });

    graph.get('/me', (err, res) => {
      try {
        expect(err).not.toBeNull();
        expect(err.message).toBe('Error parsing JSON response');
        expect(err.body).toBe(mockBody);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  test('GET request with non-JSON string (like HTML) should be handled by end()', (done) => {
    const mockRes = { headers: { 'content-type': 'text/html', 'x-test': 'header' } };
    const mockBody = '<html><body>HTML</body></html>';

    request.get.mockImplementation((options, callback) => {
      setImmediate(() => callback(null, mockRes, mockBody));
      return { on: jest.fn().mockReturnThis() };
    });

    graph.get('/me', (err, res) => {
      try {
        expect(err).toBeNull();
        expect(res).toBeDefined();
        expect(res.data).toContain('<html>');
        expect(res.headers).toBeDefined();
        expect(res.headers['x-test']).toBe('header');
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  test('Image response should be handled before parsing', (done) => {
    const mockRes = { headers: { 'content-type': 'image/jpeg' } };
    const mockBody = 'binary-data';

    request.get.mockImplementation((options, callback) => {
      setImmediate(() => callback(null, mockRes, mockBody));
      return { on: jest.fn().mockReturnThis() };
    });

    graph.get('/me/picture', (err, res) => {
      try {
        expect(err).toBeNull();
        expect(res.image).toBe(true);
        expect(res.headers).toBeDefined();
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});
