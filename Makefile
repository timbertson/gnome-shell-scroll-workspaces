ZIP_FILE=0inst/scroll-workspaces.zip
zip: phony
	rm -f ${ZIP_FILE}
	(cd scroll-workspaces && \
		zip -r ../${ZIP_FILE} * \
	)

.PHONY: phony
