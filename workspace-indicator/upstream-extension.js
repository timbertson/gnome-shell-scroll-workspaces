const Meta = imports.gi.Meta;
const Clutter = imports.gi.Clutter;
const St = imports.gi.St;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Panel = imports.ui.panel;

const Main = imports.ui.main;

function WorkspaceIndicator() {
	this._init.apply(this, arguments);
}

WorkspaceIndicator.prototype = {
	__proto__: PanelMenu.SystemStatusButton.prototype,

	_init: function(){
		PanelMenu.SystemStatusButton.prototype._init.call(this, 'folder');

	        this._currentWorkspace = global.screen.get_active_workspace().index();
		this.statusLabel = new St.Label({ text: this._labelText() });

	        // destroy all previously created children, and add our statusLabel
 	        this.actor.get_children().forEach(function(c) { c.destroy() });
		this.actor.add_actor(this.statusLabel);

		this.workspacesItems = [];
		this._workspaceSection = new PopupMenu.PopupMenuSection();
		this.menu.addMenuItem(this._workspaceSection);
		global.screen.connect_after('workspace-added', Lang.bind(this,this._createWorkspacesSection));
		global.screen.connect_after('workspace-removed', Lang.bind(this,this._createWorkspacesSection));
		global.screen.connect_after('workspace-switched', Lang.bind(this,this._updateIndicator));
		this.actor.connect('scroll-event', Lang.bind(this, this._onScrollEvent));
		this._createWorkspacesSection();

		//styling
		this.menu.actor.add_style_class_name('workspace-indicator-shorter');
	},

	_updateIndicator: function() {
	    this.workspacesItems[this._currentWorkspace].setShowDot(false);
	    this._currentWorkspace = global.screen.get_active_workspace().index();
	    this.workspacesItems[this._currentWorkspace].setShowDot(true);

	    this.statusLabel.set_text(this._labelText());
	},

	_labelText : function(workspaceIndex) {
	    if(workspaceIndex == undefined) {
		workspaceIndex = this._currentWorkspace;
	    }
	    return Meta.prefs_get_workspace_name(workspaceIndex);
	},

	_createWorkspacesSection : function() {
		this._workspaceSection.removeAll();
		this.workspacesItems = [];

		let i = 0;
		for(; i < global.screen.n_workspaces; i++) {
			this.workspacesItems[i] = new PopupMenu.PopupMenuItem(this._labelText(i));
			this._workspaceSection.addMenuItem(this.workspacesItems[i]);
			this.workspacesItems[i].workspaceId = i;
			this.workspacesItems[i].label_actor = this.statusLabel;
			let self = this;
			this.workspacesItems[i].connect('activate', Lang.bind(this, function(actor, event) {
				this._activate(actor.workspaceId);
			}));
		}

	    this._updateIndicator();
	},

	_activate : function (index) {
		if(index >= 0 && index <  global.screen.n_workspaces) {
			let metaWorkspace = global.screen.get_workspace_by_index(index);
			metaWorkspace.activate(true);
		}
	},

	_onScrollEvent : function(actor, event) {
		let direction = event.get_scroll_direction();
		let diff = 0;
		if (direction == Clutter.ScrollDirection.DOWN) {
			diff = 1;
		} else if (direction == Clutter.ScrollDirection.UP) {
			diff = -1;
		} else {
			return;
		}

		let newIndex = global.screen.get_active_workspace().index() + diff;
		this._activate(newIndex);
	},
}

function init(meta) {
    // empty
}

let _indicator;

function enable() {
    _indicator = new WorkspaceIndicator;
    Main.panel.addToStatusArea('workspace-indicator', _indicator);
}

function disable() {
    _indicator.destroy();
}
