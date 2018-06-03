#!/bin/bash

# Script found at http://blog.bejanalex.com/2017/03/running-mongodb-in-a-docker-container-with-authentication/
# modified a bit by Andre...

set -m
 
mongodb_cmd="mongod --storageEngine $STORAGE_ENGINE --bind_ip_all"
cmd="$mongodb_cmd"
if [ "$AUTH" == "yes" ]; then
    cmd="$cmd --auth"
fi
 
if [ "$JOURNALING" == "no" ]; then
    cmd="$cmd --nojournal"
fi
 
if [ "$OPLOG_SIZE" != "" ]; then
    cmd="$cmd --oplogSize $OPLOG_SIZE"
fi
 
$cmd &
 
if [ ! -f /data/db/.mongodb_password_set ]; then
    /set_mongodb_password.sh
fi

fg