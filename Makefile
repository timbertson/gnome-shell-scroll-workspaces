PROJECT = scroll-workspaces
SCHEMAS_PATH = $(PROJECT)/schemas
SCHEMA = org.gnome.shell.extensions.scroll-workspaces.gschema.xml
SCHEMA_SRC = $(SCHEMAS_PATH)/$(SCHEMA)
SCHEMA_BIN = $(SCHEMAS_PATH)/gschemas.compiled
UUID = `grep -oP '(?<="uuid": ")[^"]*' $(PROJECT)/metadata.json`
SCHEMAC = glib-compile-schemas

$(PROJECT).zip: compile
	zip -ro $(PROJECT).zip $(PROJECT)

install: compile
	rsync -avP $(PROJECT)/ $(HOME)/.local/share/gnome-shell/extensions/$(UUID)/

compile: $(SCHEMA_BIN)

$(SCHEMA_BIN): $(SCHEMA_SRC)
	$(SCHEMAC) $(SCHEMAS_PATH)

clean:
	rm -f $(PROJECT).zip $(SCHEMA_BIN)
