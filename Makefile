build/shader_canvas.js: shader_canvas.ts
	mkdir -p $(dir $@)
	deno bundle $< > $@

clean:
	rm -rf build

serve:
	/usr/bin/python3 -m http.server & find tests/* core/* | entr -s 'make clean build/shader_canvas.js'

stop:
	killall Python
