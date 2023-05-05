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
{
  "timestamp": "20230505194816096",
  "completionid": "ead1bdbb-8bb1-4b17-b4d7-1245df3ae066",
  "request": {
    "prompt": "# Path: test.py\n# function to calculate the taylor series of sin(x) and cos(x)\ndef ",
    "suffix": "",
    "max_tokens": 500,
    "temperature": 0.2,
    "top_p": 1,
    "n": 3,
    "stop": [
      "\ndef ",
      "\nclass ",
      "\nif ",
      "\n\n#"
    ],
    "stream": true,
    "extra": {
      "language": "python",
      "next_indent": 0,
      "trim_by_indentation": true,
      "prompt_tokens": 28,
      "suffix_tokens": 0
    }
  },
  "responseHeaders": {
    "azureml-model-deployment": "xcfc31672b2a6",
    "content-security-policy": "default-src 'none'; sandbox",
    "content-type": "text/event-stream",
    "openai-processing-ms": "289.6858",
    "strict-transport-security": "max-age=31536000",
    "x-request-id": "41af5a31-6a5c-4787-8d67-d2c8c50fbb37",
    "date": "Fri, 05 May 2023 19:48:15 GMT",
    "connection": "close",
    "transfer-encoding": "chunked"
  },
  "response": [
    "sin_cos(x, n):\n    # initialize the sum\n    sum = 0.0\n    # loop over the first n terms in the sum\n    for i in range(n):\n        # calculate the ith term\n        term = ((-1)**i)*(x**(2*i+1))/math.factorial(2*i+1)\n        # add the ith term to the sum\n        sum += term\n    # return the sum\n    return sum",
    "sin_cos(x, n):\n    # initialize the sum to 0\n    sum = 0\n    # loop over the number of terms in the series\n    for i in range(n):\n        # calculate the numerator\n        num = (-1)**i * x**(2*i + 1)\n        # calculate the denominator\n        den = factorial(2*i + 1)\n        # add the term to the sum\n        sum += num / den\n    # return the sum\n    return sum",
    "sin_cos(x, n):\n    # initialize the sum\n    sum = 0.0\n    # loop over the first n terms in the series\n    for i in range(n):\n        # calculate the ith term in the series\n        term = ((-1)**i)*(x**(2*i+1))/math.factorial(2*i+1)\n        # add the term to the sum\n        sum += term\n    # return the sum\n    return sum"
  ]
}
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