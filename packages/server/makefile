.PHONY: generate-key test-encrypt

TEXT=xoxb-8783107171251-8961849681473-Hhw7a1cRIZumL4c8H81mRa2S
IV=ccad81468d96d8f58af25da59ef6b2a9

generate-key:
	node utils/generateKey.js

test-encrypt:
	node utils/testEncrypt.js $(TEXT) $(IV)