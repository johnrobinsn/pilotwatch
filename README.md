# PilotWatch

PilotWatch is a small logging proxy server written in node.js for intercepting and logging code completion requests from Copilot.

## Run the PilotWatch Proxy
Assuming you have node.js properly installed the following command will download and run the PilotWatch proxy server on port 3000 and log all code completion requests to a sub-directory called "data" in the current working directory.

```bash
npx --yes github:johnrobinsn/pilotwatch
```
_Note if you'd like to download the code for PilotWatch and run it locally, you can follow these [directions](#Download-PilotWatch-Code-and-Run-Locally)._

## Configure the Copilot Plugin
Next you need to configure the Copilot plugin in VSCode to point at the PilotWatch proxy.  You can do this by adding the following lines to the VSCode settings.json file.  On Linux you can find it at the following location:

```bash
${HOME}/.config/Code/User/settings.json
```
Add the following lines to that file.
```json
    "github.copilot.advanced": {
        "debug.testOverrideProxyUrl": "http://localhost:3000",
        "debug.overrideProxyUrl": "http://localhost:3000"
    }
```
_For other platforms, Please refer to the VSCode documentation._

Now as you use copilot normally you should see json files being created in a subdirectory called "data" in the current working directory for PilotWatch.

Each one of these JSON files represents a separate Copilot code completion request to the Copilot backend.  They will each look something like this example:

```JSON

```

You can also point your browser to the PilotWatch proxy to see a list of the captures and to visualize any of the captures just enter the following into your browser on the machine that is running PilotWatch.

```
http://localhost:3000
```


## Command Line Args

PilotWatch offers the following command line args.

```bash
pilotwatch - copilot logging proxy

optional arguments:
  -h, --help            show this help message and exit
  -v, --version         show programs version number and exit
  -l LOG, --log LOG     LOG level: INFO | ERROR
  -p PORT, --port PORT  listen on specified port
  -d DATA, --data DATA  data directory
```

## Download PilotWatch Code and Run Locally

For convenience I'd recommend using the npx path to running PilotWatch described below.  But if you'd like to modify PilotWatch or contribute you can clone the repo from github and run the proxy from your own sandbox.

```bash
git clone https://github.com/johnrobinsn/pilotwatch.git
cd pilotwatch/
npm i
npm start
```