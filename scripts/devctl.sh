#!/bin/bash
# devctl.sh start|stop|restart [env assignments...]  — manages the dev server via a pid file
cd "$(dirname "$0")/.."
PIDF=/tmp/maison-dev.pid
stop() { if [ -f $PIDF ]; then kill -- -$(cat $PIDF) 2>/dev/null || kill $(cat $PIDF) 2>/dev/null; rm -f $PIDF; fi; sleep 1; }
case "$1" in
  stop) stop ;;
  start|restart) stop; shift; env "$@" setsid npx next dev -p 3100 > /tmp/dev.log 2>&1 < /dev/null & echo $! > $PIDF; sleep 7; echo started ;;
esac
