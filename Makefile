out_dir ?= ./_dist
public_path ?= /

webpack = ./node_modules/.bin/webpack \
	--config webpack.config.babel.js \
	--output-path $(out_dir) \
	--output-public-path $(public_path)

VERSION = $(shell git describe --tags)
NODE_CONFIG_ENV ?= stable
#IMAGE = docker.pkg.github.com/freefeed/freefeed-react-client/$(NODE_CONFIG_ENV)
IMAGE = freefeed/freefeed-react-client-$(NODE_CONFIG_ENV)

prod: clean
	UGLIFY=1 HASH=1 DEV=0 $(webpack)
	cp -R ./assets/js $(out_dir)/assets/

prod-nouglify: clean
	UGLIFY=0 HASH=1 DEV=0 $(webpack)

dev: clean
	UGLIFY=0 HASH=0 DEV=1 $(webpack)

clean:
	rm -rf $(out_dir)

image:
	@docker build --build-arg NODE_CONFIG_ENV=$(NODE_CONFIG_ENV) -t $(IMAGE):$(VERSION) .

latest: image
	@docker tag $(IMAGE):$(VERSION) $(IMAGE):latest

push:
	@docker push $(IMAGE):$(VERSION)

push-latest:
	@docker push $(IMAGE):latest

.PHONY: prod dev clean image docker-run
