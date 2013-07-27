set -eux
exec >&2
ZIP_FILE=0inst/scroll-workspaces.zip
rm -f "$ZIP_FILE"
cd scroll-workspaces
zip -r "../$ZIP_FILE" *
echo "Wrote $ZIP_FILE" >&2
