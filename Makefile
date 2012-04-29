all: schemas

0: schemas phony
	mkzero-gfxmonk -p workspace-indicator -p xdg -p schemas gnome-shell-workspace-indicator.xml

schemas: phony
	${MAKE} -C schemas

.PHONY: phony
