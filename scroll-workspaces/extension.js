const Gio = imports.gi.Gio;
const Clutter = imports.gi.Clutter;
const Lang = imports.lang;

const Main = imports.ui.main;

const PREFS_SCHEMA = 'org.gnome.shell.extensions.scroll-workspaces';

const WorkspaceScroller = new Lang.Class({
	Name: 'WorkspaceScroller',

	_init: function() {
		Main.panel.actor.reactive = true;
		this._panelScrollEventId = Main.panel.actor.connect('scroll-event', Lang.bind(this, this._onScrollEvent));
		this._lastScrollTime = new Date().getTime();
		this._settings = new Gio.Settings({ schema_id: PREFS_SCHEMA });
		this._settingsChangedId = this._settings.connect('changed::scroll-delay', Lang.bind(this, this._updateDelay));
		this._updateDelay();
	},

	destroy: function() {
		if (this._panelScrollEventId) {
			Main.panel.actor.disconnect(this._panelScrollEventId);
			this._panelScrollEventId = 0;
		}
	},

	_updateDelay: function() {
		this._delay = this._settings.get_int('scroll-delay');
	},

	_activate : function(index) {
		if (index >= 0 && index < global.screen.n_workspaces) {
			let metaWorkspace = global.screen.get_workspace_by_index(index);
			metaWorkspace.activate(global.get_current_time());
		}
	},

	_onScrollEvent : function(actor, event) {
		let source = event.get_source();
		if (source.has_style_class_name('panel-status-indicators-box') || source.has_style_class_name('panel-status-button')) {
			// Actors in the "status" area may have their own scroll events
			return;
		}

		let direction = event.get_scroll_direction();
		let diff = 0;
		if (direction == Clutter.ScrollDirection.DOWN) {
			diff = 1;
		} else if (direction == Clutter.ScrollDirection.UP) {
			diff = -1;
		} else {
			return;
		}

		let currentTime = new Date().getTime();
		if (currentTime < this._lastScrollTime + this._delay) {
			// Ensure a minimum delay between workspace scrolls
			return;
		}
		this._lastScrollTime = currentTime;

		let newIndex = global.screen.get_active_workspace().index() + diff;
		this._activate(newIndex);
	}
});

function init(meta) {
	/* do nothing */
}

let _scroller;

function enable() {
	_scroller = new WorkspaceScroller;
}

function disable() {
	_scroller.destroy();
}
