# PilotWatch

A small logging proxy server for intercepting and logging code completion requests from copilot.

${HOME}/.config/Code/User/settings.json

```json
    "github.copilot.advanced": {
        "debug.testOverrideProxyUrl": "http://localhost:3000",
        "debug.overrideProxyUrl": "http://localhost:3000"
    }
```

```
pilotwatch - copilot logging proxy

optional arguments:
  -h, --help            show this help message and exit
  -v, --version         show program's version number and exit
  -l LOG, --log LOG     LOG level: INFO | ERROR
  -p PORT, --port PORT  listen on specified port
  -d DATA, --data DATA  data directory
```# pilotwatch
