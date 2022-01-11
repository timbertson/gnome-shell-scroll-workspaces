const Gtk = imports.gi.Gtk;

let Extension = imports.misc.extensionUtils.getCurrentExtension();
const ExtensionUtils = imports.misc.extensionUtils;

const Gettext = imports.gettext.domain('scroll-workspaces');
const _ = Gettext.gettext;

function init() {
	ExtensionUtils.initTranslations("scroll-workspaces");
}

function buildPrefsWidget() {
	let settings = ExtensionUtils.getSettings();
	let frame = new Gtk.Box({
		orientation: Gtk.Orientation.VERTICAL,
		margin_top: 30,
		margin_bottom: 30,
		margin_start: 30,
		margin_end: 30,
		spacing: 20
	});

	(function() {
		let hbox = new Gtk.Box({
			orientation: Gtk.Orientation.HORIZONTAL,
			spacing: 30
		});

		let label = new Gtk.Label({
			label: _("Ignore last workspace"),
			use_markup: false,
			xalign: 0,
			hexpand: true
		});
		let toggle = new Gtk.Switch();

		hbox.append(label);
		hbox.append(toggle);
		frame.append(hbox);

		toggle.set_active(settings.get_boolean('ignore-last-workspace'));
		toggle.connect('state-set', function(sw) {
			var newval = sw.get_active();
			if (newval != settings.get_boolean('ignore-last-workspace')) {
				settings.set_boolean('ignore-last-workspace', newval);
			}
		});
	})();

	(function() {
		let hbox = new Gtk.Box({
			orientation: Gtk.Orientation.HORIZONTAL,
			spacing: 30
		});

		let label = new Gtk.Label({
			label: _("Wrap around"),
			use_markup: false,
			xalign: 0,
			hexpand: true
		});
		let toggle = new Gtk.Switch();

		hbox.append(label);
		hbox.append(toggle);
		frame.append(hbox);

		toggle.set_active(settings.get_boolean('wrap'));
		toggle.connect('state-set', function(sw) {
			var newval = sw.get_active();
			if (newval != settings.get_boolean('wrap')) {
				settings.set_boolean('wrap', newval);
			}
		});
	})();

	(function() {
		let hbox = new Gtk.Box({
			orientation: Gtk.Orientation.HORIZONTAL,
			spacing: 30
		});

		let label = new Gtk.Label({
			label: _("Show indicator"),
			use_markup: false,
			xalign: 0,
			hexpand: true
		});
		let toggle = new Gtk.Switch();

		hbox.append(label);
		hbox.append(toggle);
		frame.append(hbox);

		toggle.set_active(settings.get_boolean('indicator'));
		toggle.connect('state-set', function(sw) {
			var newval = sw.get_active();
			if (newval != settings.get_boolean('indicator')) {
				settings.set_boolean('indicator', newval);
			}
		});
	})();

	(function() {
		let hbox = new Gtk.Box({
			orientation: Gtk.Orientation.HORIZONTAL,
			spacing: 30
		});

		let labelbox = new Gtk.Box({
			orientation: Gtk.Orientation.VERTICAL
		});
		let label = new Gtk.Label({
			label: _("Minimum delay between scroll events (ms)"),
			use_markup: false,
			xalign: 0,
			hexpand: true
		});
		let dimlabel = new Gtk.Label({
			label: _("Prevents accidental double-scrolling"),
			use_markup: false,
			xalign: 0,
			hexpand: true,
			css_classes: ["dim-label"]
		});
		labelbox.append(label);
		labelbox.append(dimlabel);

		let adjustment = new Gtk.Adjustment({
			lower: 0,
			upper: 500,
			step_increment: 10
		});
		
		let spinbutton = new Gtk.SpinButton({
			adjustment: adjustment
		});

		hbox.append(labelbox);
		hbox.append(spinbutton);
		frame.append(hbox);

		spinbutton.set_value(settings.get_int('scroll-delay'));
		spinbutton.connect('value-changed', function(sw) {
			var newval = sw.get_value();
			if (newval != settings.get_int('scroll-delay')) {
				settings.set_int('scroll-delay', newval);
			}
		});
	})();

	return frame;
}
