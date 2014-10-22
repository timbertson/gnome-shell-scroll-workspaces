const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Gtk = imports.gi.Gtk;
const GtkBuilder = Gtk.Builder;
const SettingsSchemaSource = Gio.SettingsSchemaSource;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const UI_FILE = Me.dir.get_path() + '/prefs.ui';
const PREFS_SCHEMA = 'org.gnome.shell.extensions.scroll-workspaces';

function loadSettings() {
	let localSchemas = Me.dir.get_child('schemas').get_path();
	let systemSchemas = SettingsSchemaSource.get_default();
	let schemaSource = SettingsSchemaSource.new_from_directory(localSchemas, systemSchemas, true);
	let schemaObj = schemaSource.lookup(PREFS_SCHEMA, true);
	if (!schemaObj) {
		throw new Error('Schema ' + PREFS_SCHEMA + ' could not be found for extension ' + Me.metadata.uuid + '. Please check your installation.');
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
	builder.get_object('scrolldelayspin').set_value(delay);
}

function buildPrefsWidget() {
	builder.add_from_file(UI_FILE);
	updateWidget();
	builder.get_object('lastworkspaceswitch').connect('notify::active', function(widget) {
		settings.set_boolean('ignore-last-workspace', widget.active);
	});
	builder.get_object('scrolldelayspin').connect('changed', function(widget) {
		settings.set_int('scroll-delay', widget.value);
	});
	settingsChangedId = settings.connect('changed', updateWidget);
	return builder.get_object('mainbox');
}
