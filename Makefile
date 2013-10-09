MOCHA = ./node_modules/.bin/mocha 

test:
	$(MOCHA) -R spec --recursive

test-low:
	$(MOCHA) --recursive

.PHONY: test