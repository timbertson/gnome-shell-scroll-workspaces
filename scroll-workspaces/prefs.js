const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const PREFS_UI = 'prefs.ui';

function getSettings() {
	let prefsSchema = Me.metadata['settings-schema'];
	let localSchemas = Me.dir.get_child('schemas').get_path();
	let systemSchemas = Gio.SettingsSchemaSource.get_default();
	let schemaSource = Gio.SettingsSchemaSource.new_from_directory(localSchemas, systemSchemas, true);
	let schemaObj = schemaSource.lookup(prefsSchema, true);
	if (!schemaObj) {
		throw new Error('Schema ' + prefsSchema + ' could not be found for extension ' + Me.metadata.uuid + '. Please check your installation.');
	}
	return new Gio.Settings({ settings_schema: schemaObj });
}

const WorkspaceScrollerPrefsWidget = new Lang.Class({
	Name: 'WorkspaceScrollerPrefsWidget',

	_init: function() {
		this._builder = new Gtk.Builder();
		this._settings = getSettings();
		let noLast = this._settings.get_boolean('ignore-last-workspace');
		let delay = this._settings.get_int('scroll-delay');
		this._settings.set_boolean('ignore-last-workspace', noLast);
		this._settings.set_int('scroll-delay', delay);
	},

	_updateWidget: function() {
		let noLast = this._settings.get_boolean('ignore-last-workspace');
		let delay = this._settings.get_int('scroll-delay');
		this._builder.get_object('lastworkspaceswitch').set_active(noLast);
		this._builder.get_object('scrolldelayscale').set_value(delay);
	},

	buildPrefsWidget: function() {
		this._builder.add_from_file(Me.dir.get_path() + '/' + PREFS_UI);
		this._updateWidget();
		let settingsChangedId = this._settings.connect('changed', Lang.bind(this, this._updateWidget));
		this._builder.get_object('lastworkspaceswitch').connect('notify::active', Lang.bind(this, function(widget) {
			this._settings.set_boolean('ignore-last-workspace', widget.get_active());
		}));
		this._builder.get_object('scrolldelayscale').connect('value-changed', Lang.bind(this, function(widget) {
			this._settings.set_int('scroll-delay', widget.get_value());
		}));
		return this._builder.get_object('mainbox');
	}
});

let _prefsWidget;

function init() {
	_prefsWidget = new WorkspaceScrollerPrefsGUI();
}

function buildPrefsWidget() {
	return _prefsWidget.buildPrefsWidget();
}
