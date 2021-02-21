build/shader_canvas.js: shader_canvas.ts
	mkdir -p $(dir $@)
	deno bundle $< > $@

documentation:
	touch docs/documentation.md
	rm docs/documentation.md
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
