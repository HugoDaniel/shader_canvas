build/shader_canvas.js: shader_canvas.ts
	mkdir -p $(dir $@)
	deno bundle -c denoconfig.json $< > $@

docs/documentation.md:
	touch docs/documentation.md
	rm docs/documentation.md
	touch docs/documentation.md
	deno run --unstable --allow-run --allow-read docs/generate.ts > docs/code.md
	cat docs/header.md > docs/documentation.md
	cat docs/body.md >> docs/documentation.md
	cat docs/code.md >> docs/documentation.md

clean:
	rm -rf build

serve:
	/usr/bin/python3 -m http.server & find tests/* core/* | entr -s 'make clean build/shader_canvas.js'

stop:
	killall Python

build/shader_canvas.min.js: build/shader_canvas.js
	terser $< -o $@ -c

all: clean build/shader_canvas.min.js docs/documentation.md
