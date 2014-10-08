const Gtk = imports.gi.Gtk;

let Extension = imports.misc.extensionUtils.getCurrentExtension();
let Settings = Extension.imports.settings;

function init() {
}

function buildPrefsWidget() {
	let config = new Settings.Prefs();
	let frame = new Gtk.Box({
		orientation: Gtk.Orientation.VERTICAL,
		border_width: 10
	});

	(function() {
		let hbox = new Gtk.Box({
			orientation: Gtk.Orientation.HORIZONTAL,
			spacing: 20
		});

		let label = new Gtk.Label({
			label: "Do not scroll into last workspace:",
			use_markup: false,
		});
		let checkbutton = new Gtk.CheckButton();

		hbox.add(label);
		hbox.pack_end(checkbutton, true, true, 0);
		frame.add(hbox);

		var pref = config.IGNORE_LAST_WORKSPACE;
		checkbutton.set_active(pref.get());
		checkbutton.connect('toggled', function(sw) {
			var oldval = pref.get();
			var newval = sw.get_active();
			if (newval != pref.get()) {
				pref.set(newval);
			}
		});
	})();

	frame.show_all();
	return frame;
}
