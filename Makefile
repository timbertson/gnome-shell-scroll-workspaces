ZIP_FILE=scroll-workspaces.zip
zip: phony
	rm -f ${ZIP_FILE}
	(cd scroll-workspaces && \
		zip -r ../${ZIP_FILE} * \
	)

.PHONY: phony
