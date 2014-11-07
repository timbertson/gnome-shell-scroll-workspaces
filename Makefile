PROJECT = scroll-workspaces

SCHEMAS_PATH = $(PROJECT)/schemas
SCHEMA = org.gnome.shell.extensions.scroll-workspaces.gschema.xml
SCHEMA_SRC = $(SCHEMAS_PATH)/$(SCHEMA)
SCHEMA_BIN = $(SCHEMAS_PATH)/gschemas.compiled

UUID = `grep -oP '(?<="uuid": ")[^"]*' $(PROJECT)/metadata.json`

SCHEMAC = glib-compile-schemas
ZIP = zip -ro
CP = rsync -aP

$(PROJECT).zip: compile
	$(ZIP) $@ $(PROJECT)

install: compile
	$(CP) $(PROJECT)/ "$(HOME)/.local/share/gnome-shell/extensions/$(UUID)/"

compile: clean-backups $(SCHEMA_BIN)

$(SCHEMA_BIN): $(SCHEMA_SRC)
	$(SCHEMAC) $(SCHEMAS_PATH)

clean-backups:
	find . -type f -name '*~' -delete

clean: clean-backups
	rm -f $(PROJECT).zip $(SCHEMA_BIN)
