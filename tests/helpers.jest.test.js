
const graph = require('../index');

describe('Internal Helper Methods', () => {
    describe('wrapCallbackWithHeaders', () => {
        test('should attach headers to response data object', (done) => {
            const mockHeaders = { 'x-fb-debug': '12345' };
            const mockRes = { headers: mockHeaders };
            const originalData = { id: 'me' };
            
            const self = {
                callback: (err, data) => {
                    try {
                        expect(err).toBeNull();
                        expect(data).toEqual({
                            id: 'me',
                            headers: mockHeaders
                        });
                        done();
                    } catch (e) {
                        done(e);
                    }
                }
            };

            graph.__test__.wrapCallbackWithHeaders(self, mockRes);
            
            // Trigger the wrapped callback
            self.callback(null, originalData);
        });

        test('should attach headers to error object if it exists', (done) => {
            const mockHeaders = { 'x-fb-error': 'true' };
            const mockRes = { headers: mockHeaders };
            const mockError = { message: 'OAuth Error' };
            
            const self = {
                callback: (err, data) => {
                    try {
                        expect(err.message).toBe('OAuth Error');
                        expect(err.headers).toEqual(mockHeaders);
                        done();
                    } catch (e) {
                        done(e);
                    }
                }
            };

            graph.__test__.wrapCallbackWithHeaders(self, mockRes);
            
            // Trigger with error
            self.callback(mockError, null);
        });

        test('should preserve "this" binding of the original callback', (done) => {
            const mockRes = { headers: {} };
            const self = {
                someValue: 'preserved'
            };
            
            self.callback = function(err, data) {
                try {
                    expect(this.someValue).toBe('preserved');
                    done();
                } catch (e) {
                    done(e);
                }
            };

            graph.__test__.wrapCallbackWithHeaders(self, mockRes);
            
            // Trigger the wrapped callback
            self.callback(null, {});
        });
    });

    describe('handleRequestError', () => {
        test('should call callback if it has not been called', (done) => {
            const mockError = { message: 'test error' };
            const self = {
                callback: (err) => {
                    try {
                        expect(err).toEqual(mockError);
                        done();
                    } catch (e) {
                        done(e);
                    }
                }
            };

            graph.__test__.handleRequestError(self, false, mockError);
        });

        test('should not call callback if it has already been called', () => {
            const mockError = { message: 'test error' };
            const callback = jest.fn();
            const self = { callback };

            graph.__test__.handleRequestError(self, true, mockError);
            expect(callback).not.toHaveBeenCalled();
        });
    });
});
