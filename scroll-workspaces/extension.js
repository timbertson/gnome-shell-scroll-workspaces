const Lang = imports.lang;
const Clutter = imports.gi.Clutter;
const Shell = imports.gi.Shell;
const Meta = imports.gi.Meta;

const Main = imports.ui.main;
const ViewSelector = imports.ui.viewSelector;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Prefs = Me.imports.prefs;

const WorkspaceScroller = new Lang.Class({
	Name: 'WorkspaceScroller',

	_init: function() {
		Main.panel.actor.reactive = true;
		this._panelScrollEventId = Main.panel.actor.connect('scroll-event', Lang.bind(this, this._onScrollEvent));
		this._lastScrollTime = new Date().getTime();
	},

	destroy: function() {
		if (this._panelScrollEventId) {
			Main.panel.actor.disconnect(this._panelScrollEventId);
			this._panelScrollEventId = 0;
		}
	},

	get _delay() {
		return Prefs.settings.get_int('scroll-delay');
	},
	get _noLast() {
		return Prefs.settings.get_boolean('ignore-last-workspace');
	},

	_activate: function(toActivate) {
		if (toActivate.index() == global.screen.n_workspaces - 1 && !Main.overview.visible && this._noLast) {
			return;
		}
		this._lastScrollTime = currentTime;
		toActivate.activate(global.get_current_time());
	},

	_onScrollEvent: function(actor, event) {
		let source = event.get_source();
		if (source.__proto__ != Shell.GenericContainer.prototype) {
			// Actors in the "status" area may have their own scroll events
			return;
		}

		let currentTime = new Date().getTime();
		if (currentTime < this._lastScrollTime + this._delay) {
			// Ensure a minimum delay between workspace scrolls
			return;
		}

		let direction = event.get_scroll_direction();
		let activeWorkspace = global.screen.get_active_workspace();
		let toActivate;
		if (direction == Clutter.ScrollDirection.DOWN) {
			toActivate = activeWorkspace.get_neighbor(Meta.MotionDirection.DOWN);
		} else if (direction == Clutter.ScrollDirection.UP) {
			toActivate = activeWorkspace.get_neighbor(Meta.MotionDirection.UP);
		} else if (direction == Clutter.ScrollDirection.LEFT) {
			toActivate = activeWorkspace.get_neighbor(Meta.MotionDirection.LEFT);
		} else if (direction == Clutter.ScrollDirection.RIGHT) {
			toActivate = activeWorkspace.get_neighbor(Meta.MotionDirection.RIGHT);
		} else {
			return;
		}

		this._activate(toActivate);
	}
});

function init(meta) {
	/* do nothing */
}

let _scroller;

function enable() {
	_scroller = new WorkspaceScroller();
}

function disable() {
	_scroller.destroy();
}
