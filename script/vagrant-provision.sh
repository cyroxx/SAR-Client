#!/bin/bash

set -e

v="2.0.0"
download_url="http://apache.mirror.iphh.net/couchdb/source/2.0.0/apache-couchdb-2.0.0.tar.gz"

apt-get update
apt-get --no-install-recommends -y install build-essential \
	pkg-config erlang libicu-dev libmozjs185-dev \
	libcurl4-openssl-dev help2man python-sphinx

mkdir -p /opt/src
curl -s $download_url | tar -C /opt/src -xzf -

(cd /opt/src/apache-couchdb-${v} && ./configure -u root -c)
(cd /opt/src/apache-couchdb-${v} && make release)
(cd /opt/src/apache-couchdb-${v} && cp -R rel/couchdb /opt)

sed -i -e 's,;bind_address = 127.0.0.1,bind_address = 0.0.0.0,g' /opt/couchdb/etc/local.ini

cat <<__SYSTEMD > /etc/systemd/system/couchdb.service
[Unit]
Description=CouchDB Service
After=network.target

[Service]
User=root
ExecStart=/opt/couchdb/bin/couchdb
Restart=always

[Install]
WantedBy=multi-user.target
__SYSTEMD

systemctl daemon-reload
systemctl enable couchdb.service
systemctl start couchdb.service
