const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;
const Extension = ExtensionUtils.getCurrentExtension();
const Convenience = Extension.imports.convenience;
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;
const WorkspaceSwitcherPopup = imports.ui.workspaceSwitcherPopup;

const BUFFER_SHOW_ALL_WORKSPACES = 0;
const BUFFER_IGNORE_LAST_WORKSPACE = 1;

function Ext() {
	this._init.apply(this, arguments);
}

Ext.prototype = {
	_init: function(){
		this._panel = Main.panel;
		this._panelBinding = null;
		this._lastScroll = Date.now();

		let self = this;
		// setup ignore-last-workspace pref
		this._settings = Convenience.getSettings();
		(function() {
			let update = function() {
				self._tailBuffer = self._settings.get_boolean('ignore-last-workspace') ? BUFFER_IGNORE_LAST_WORKSPACE : BUFFER_SHOW_ALL_WORKSPACES ;
			};
			self._settings.connect('changed::ignore-last-workspace', update)
			update(); // set initial value
		}
		)();

		// setup scroll-delay pref
		(function() {
			let update = function() {
				self._scroll_delay = self._settings.get_int('scroll-delay');
			};
			self._settings.connect('changed::scroll-delay', update)
			update(); // set initial value
		}
		)();

		// setup wrap pref
		(function() {
			let update = function() {
				self._wrap = self._settings.get_boolean('wrap');
			};
			self._settings.connect('changed::wrap', update)
			update(); // set initial value
		}
		)();

		// setup indicator pref
		(function() {
			let update = function() {
				self._indicator = self._settings.get_boolean('indicator');
			};
			self._settings.connect('changed::indicator', update)
			update(); // set initial value
		}
		)();
	},

	disable: function() {
		if (this._panelBinding) {
			this._panel.actor.disconnect(this._panelBinding);
			this._panelBinding = null;
		}
	},

	enable: function() {
		this._panel.reactive = true;
		if (this._panelBinding) {
			// enabled twice in a row? should be impossible
			this.disable();
		}
		this._panelBinding = this._panel.actor.connect('scroll-event', Lang.bind(this, this._onScrollEvent));
	},

	_onScrollEvent : function(actor, event) {
		let source = event.get_source();
		if (source != actor) {
			// Actors in the status area often have their own scroll events,
			let inStatusArea = this._panel._rightBox && this._panel._rightBox.contains && this._panel._rightBox.contains(source);
			if (inStatusArea) return Clutter.EVENT_PROPAGATE;
		}

		let motion;
		switch (event.get_scroll_direction()) {
		case Clutter.ScrollDirection.UP:
			motion = Meta.MotionDirection.UP;
			break;
		case Clutter.ScrollDirection.DOWN:
			motion = Meta.MotionDirection.DOWN;
			break;
		case Clutter.ScrollDirection.LEFT:
			motion = Meta.MotionDirection.LEFT;
			break;
		case Clutter.ScrollDirection.RIGHT:
			motion = Meta.MotionDirection.RIGHT;
			break;
		default:
			return Clutter.EVENT_PROPAGATE;
		}
		let activeWs = global.screen.get_active_workspace();
		let ws = activeWs.get_neighbor(motion);
		if(!ws) return Clutter.EVENT_STOP;

		let currentTime = Date.now();
		
		// global.log("scroll time diff = " + (currentTime - this._lastScroll));
		if (currentTime < this._lastScroll + this._scroll_delay) {
			if (currentTime < this._lastScroll) {
				// Clock went backwards. Reset & accept event
				this._lastScroll = 0;
			} else {
				// within wait period - consume this event (but do nothing)
				// to prevent accidental rapid scrolling
				return Clutter.EVENT_STOP;
			}
		}

		let tailBuffer = Main.overview.visible ? BUFFER_SHOW_ALL_WORKSPACES : this._tailBuffer;
		var wsIndex = ws.index();
		var numWorkspaces = global.screen.n_workspaces - tailBuffer;

		if (this._wrap && (ws == activeWs || wsIndex >= numWorkspaces)) {
			if (wsIndex === 0) {
				ws = global.screen.get_workspace_by_index(numWorkspaces-1)
			} else {
				ws = global.screen.get_workspace_by_index(0)
			}
		}

		if (ws.index() >= global.screen.n_workspaces - tailBuffer) {
			return Clutter.EVENT_STOP
		}

		if (this._indicator) {
			// The following code is taken from and thus compatible with the dash-to-dock extension by micheleg
			// which can be found at https://github.com/micheleg/dash-to-dock/blob/master/dockedDash.js.
			if (Main.wm._workspaceSwitcherPopup == null)
				Main.wm._workspaceSwitcherPopup = new WorkspaceSwitcherPopup.WorkspaceSwitcherPopup();
				// Set the actor non reactive, so that it doesn't prevent the
				// clicks events from reaching the dash actor. I can't see a reason
				// why it should be reactive.
				Main.wm._workspaceSwitcherPopup.actor.reactive = false;
				Main.wm._workspaceSwitcherPopup.connect('destroy', function() {
					Main.wm._workspaceSwitcherPopup = null;
				});

			// Do not show wokspaceSwithcer in overview
			if(!Main.overview.visible)
				Main.wm._workspaceSwitcherPopup.display(motion, ws.index());
			// End of code taken from dash-to-dock.
		}

		Main.wm.actionMoveWorkspace(ws);
		this._lastScroll = currentTime;
		return Clutter.EVENT_STOP;
	},
}

function init(meta) {
	let ext = new Ext();
	return ext;
}

function main() {
	init().enable();
};
