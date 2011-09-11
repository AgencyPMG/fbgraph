TESTS = $(shell find test/*.test.js)

test:
	@NODE_ENV=test nodeunit \
	$(TESTFLAGS) \
	$(TESTS) 

test-cov:
	@TESTFLAGS=--cov $(MAKE) test

.PHONY: test