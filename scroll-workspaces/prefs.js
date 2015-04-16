const Gtk = imports.gi.Gtk;

let Extension = imports.misc.extensionUtils.getCurrentExtension();
let Convenience = Extension.imports.convenience;

function init() {
}

function buildPrefsWidget() {
	let settings = Convenience.getSettings('org.gnome.shell.extensions.net.gfxmonk.scroll-workspaces');
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
			label: "Ignore last workspace:",
			use_markup: false,
		});
		let checkbutton = new Gtk.CheckButton();

		hbox.add(label);
		hbox.pack_end(checkbutton, true, true, 0);
		frame.add(hbox);

		checkbutton.set_active(settings.get_boolean('ignore-last-workspace'));
		checkbutton.connect('toggled', function(sw) {
			var newval = sw.get_active();
			if (newval != settings.get_boolean('ignore-last-workspace')) {
				settings.set_boolean('ignore-last-workspace', newval);
			}
		});
	})();

	(function() {
		let hbox = new Gtk.Box({
			orientation: Gtk.Orientation.HORIZONTAL,
			spacing: 20
		});

		let label = new Gtk.Label({
			label: "Minimum delay between scroll events (ms)\n<small>(prevents accidental double-scrolling)</small>",
			use_markup: true,
		});
		let adjustment = new Gtk.Adjustment({
			lower: 0,
			upper: 500,
			step_increment: 10
		});
		let scale = new Gtk.HScale({
			digits:0,
			adjustment: adjustment,
			value_pos: Gtk.PositionType.RIGHT
		});

		hbox.add(label);
		hbox.pack_end(scale, true, true, 0);
		frame.add(hbox);

		scale.set_value(settings.get_int('scroll-delay'));
		scale.connect('value-changed', function(sw) {
			var newval = sw.get_value();
			if (newval != settings.get_int('scroll-delay')) {
				settings.set_int('scroll-delay', newval);
			}
		});
	})();

	frame.show_all();
	return frame;
}
