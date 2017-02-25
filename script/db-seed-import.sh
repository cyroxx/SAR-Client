#!/bin/bash

set -e

# Import seeds into the local CouchDB
couch_url="http://localhost:5984"

seeds="$(dirname $0)/../data/seeds"

for seed in ${seeds}/*.json; do
	echo "==> Processing: $seed"
	dbname=$(basename $seed .json)

	echo "==> Creating database: $dbname"
	curl -s -XPUT ${couch_url}/${dbname} || true

	echo "==> Importing $seed into ${couch_url}/${dbname}"
	curl -s -XPOST -d @${seed} \
		-H Content-Type:application/json \
		${couch_url}/${dbname}/_bulk_docs
done

exit 0