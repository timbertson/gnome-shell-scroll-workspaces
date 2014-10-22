const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GtkBuilder = Gtk.Builder;
const SettingsSchemaSource = Gio.SettingsSchemaSource;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const PREFS_UI = 'prefs.ui';

function loadSettings() {
	let prefsSchema = Me.metadata['settings-schema'];
	let localSchemas = Me.dir.get_child('schemas').get_path();
	let systemSchemas = SettingsSchemaSource.get_default();
	let schemaSource = SettingsSchemaSource.new_from_directory(localSchemas, systemSchemas, true);
	let schemaObj = schemaSource.lookup(prefsSchema, true);
	if (!schemaObj) {
		throw new Error('Schema ' + prefsSchema + ' could not be found for extension ' + Me.metadata.uuid + '. Please check your installation.');
	}
	return new Gio.Settings({ settings_schema: schemaObj });
}

let builder;
let settings;

function init() {
	builder = new Gtk.Builder();
	settings = loadSettings();
}

function updateWidget() {
	let noLast = settings.get_boolean('ignore-last-workspace');
	let delay = settings.get_int('scroll-delay');
	builder.get_object('lastworkspaceswitch').set_active(noLast);
	builder.get_object('scrolldelayscale').set_value(delay);
}

function buildPrefsWidget() {
	builder.add_from_file(Me.dir.get_path() + '/' + PREFS_UI);
	updateWidget();
	builder.get_object('lastworkspaceswitch').connect('notify::active', function(widget) {
		settings.set_boolean('ignore-last-workspace', widget.active);
	});
	builder.get_object('scrolldelayscale').connect('value-changed', function(widget) {
		settings.set_int('scroll-delay', widget.get_value());
	});
	let settingsChangedId = settings.connect('changed', updateWidget);
	return builder.get_object('mainbox');
}
