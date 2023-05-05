#!/usr/bin/env node

// use express to write a server
const path = require('path');
const fs = require('fs');
var https = require('https');
const url = require('url');
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const log = require('loglevel');
const showdown   = require('showdown');

const converter = new showdown.Converter();

const app = express();
const port = 3000;

// copilot endpoint
const copilotUrl = "https://copilot-proxy.githubusercontent.com/v1/engines/copilot-codex/completions"
const parsedUrl = url.parse(copilotUrl, false);
const defaultPorts = { 'http:': 80, 'https:': 443 };
parsedUrl.port = parsedUrl.port || defaultPorts[parsedUrl.protocol];

// use body-parser to parse the body of the request
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use express to serve static files
app.use(express.static('public'));

function get_timestamp() {
    return new Date().toISOString().replace(/[-:.TZ]/g,'');
}

function generateMarkdown(completionObject) {
    // Generate markdown summary of completion
    const cb = '```';
    const lang = completionObject.request.extra.language;
    const prompt = completionObject.request.prompt;
    const suffix = completionObject.suffix;
    const choiceArray = completionObject.response;

    let md = '## Completion\n\n';
    md += `Timestamp: ${completionObject.timestamp}\n\n`;
    md += `Completion ID: ${completionObject.completionid}\n\n`;

    if (!prompt)
        md += '_No Prompt Provided_\n';
    else
        md += `Prompt:\n${cb}${lang}\n${prompt}\n${cb}\n`;
    if (choiceArray.length == 0)
        md += '_No Choices Provided_\n';
    else {
        for (let i in choiceArray) {
            md += `Completion Choice ${i}:\n${cb}${lang}\n${choiceArray[i]}\n${cb}\n`;
        }
    }
    if (!suffix)
        md += '_No Suffix Provided_\n';
    else
        md += `Suffix:\n${cb}${lang}\n${suffix}\n${cb}\n`;
    
    md += "## Completion Object\n\n";
    md += `${cb}json\n${JSON.stringify(completionObject,null,2)}\n${cb}`

    return md;
}

function forward(srcRequest,srcResponse) {

    function onResponse(dstResponse) {
        log.info("Response received from Copilot.")
        log.info(`Status Code: ${dstResponse.statusCode}`);
        log.info(`Response Headers: ${JSON.stringify(dstResponse.headers)}`);
      
        srcResponse.writeHead(200, dstResponse.headers); // forward response headers back to source

        let data = '';  // accumulate the response in this variable

        dstResponse.on('error', function(e){
            log.error("Error connecting to Copilot, ", e);
        });

        dstResponse.on('data', function(chunk) {
            srcResponse.write(chunk); // send back the chunks as they are received
            data += chunk;     // accumulate the chunks for processing
        });

        dstResponse.on('end', function() {
            // data is in the form of a list of event-stream strings of the form
            // data: {json payload}  or data: [DONE]
            const messages = data.split('\n\n');
            let choices = {} // dictionary to accumlate choices from response
            for (let i in messages) {
                messagePrefix = 'data: '
                if (messages[i].startsWith(messagePrefix)) {
                    let mString = messages[i].substring(messagePrefix.length).trim() + '\n';
                    if (!mString.startsWith('[DONE]'))  {
                        let mObject = JSON.parse(mString);
                        for (choiceIndex in mObject.choices) {
                            let choiceObject = mObject.choices[choiceIndex]
                            let key = 'k'+choiceObject.index
                            if (!choices.hasOwnProperty(key))
                                choices[key] = ''
                            choices[key] += choiceObject.text
                        }
                    }
                }                
            }

            // The choices dictionary will contain each choice with a unique key
            // convert to an array of choices
            choiceArray = [];
            for (let k in choices) {
                choiceArray.push(choices[k]);
            }

            const completionid = uuidv4()
            const timestamp = get_timestamp()

            let completionObject = {
                "timestamp": timestamp,
                "completionid": completionid,
                //"requestHeaders": srcRequest.headers, // don't log the authorization header
                "request": srcRequest.body,
                "responseHeaders": dstResponse.headers, 
                "response": choiceArray,
            }
            
            let fname = path.join(args.data,`${timestamp}-${completionid}.json`);
            log.info("Logging completion file: ${fname}.");
            fs.writeFile(fname, JSON.stringify(completionObject,null,2), (err) => {
                if (err) log.error('Completion file could not be written, ', err);
              });
            
            srcResponse.end(); // close out the response to the source
        });
    }

    srcRequest.headers.host = parsedUrl.host

    var urlParams = {
        host: parsedUrl.host,
        port: parsedUrl.port,
        path: parsedUrl.pathname,
        method: 'POST',
        headers: srcRequest.headers
    };

    log.info("Forwarding request to Copilot.")
    const dstRequest = https.request(urlParams, onResponse); //Create a request object.

    dstRequest.on('timeout', function () {
        log.error('Timeout connecting to Copilot.');
        srcReq.abort();
    });

    dstRequest.write(JSON.stringify(srcRequest.body)); //Send off the request.
    dstRequest.end(); //End the request.
}

// handle routes
app.get('/', (req, res) => {
    fs.readdir(args.data, (err, files) => {
      if (err) {
        log.error(err);
        res.status(500).send('Internal server error');
      } else {
        const sortedFiles = files.sort((a,b) => b<a?-1:1);
        const links = sortedFiles.map(file => `<a href="/view/${file}">${file}</a>`).join('<br>');
        const html = `<html><title>Copilot Completions</title><body><h1>Copilot Completions</h1><p>Newest On Top.  Reload to Refresh.</p>${links}</body></html>`;
        res.send(html);
      }
    });
  }); 
// 

app.get('/view/:name', (req, res) => {
    // read file
    const fname = path.join(args.data, req.params.name)
    fs.readFile(fname, 'utf8', function(err, data) {
        if (err) {
            const m = `Could not open file: ${fname}`
            log.error(m,err);
            res.send(m);
        }
        else {
            const completionObject = JSON.parse(data);
            let h = '';
            h += `<head><title>Copilot Completion</title>`;
            h += `<link rel="stylesheet" href="//highlightjs.org/static/demo/styles/atom-one-dark-reasonable.css">`;
            h += `<script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>`;
            h += `<script>hljs.highlightAll();</script>`;
            h += `</head><body>`;
            h += converter.makeHtml(generateMarkdown(completionObject));
            h += `</body></html>`
            res.send(h);
        }
    });
});

app.post('/v1/engines/copilot-codex/completions', (srcRequest, srcResponse) => {
    log.info('Incoming Completion Request on /v1/engines/copilot-codex/completions')

    forward(srcRequest,srcResponse);
});

// Handle command line args
const { ArgumentParser } = require('argparse');
const { version } = require('./package.json');

const parser = new ArgumentParser({
  description: 'pilotwatch - copilot logging proxy'
});

parser.add_argument('-v', '--version', { action: 'version', version });
parser.add_argument('-l', '--log', { help: 'LOG level: INFO | ERROR',default:'ERROR'});
parser.add_argument('-p', '--port', { help: 'listen on specified port',default:3000});
parser.add_argument('-d', '--data', { help: 'data directory',default:''})

args = parser.parse_args();

log.setLevel((args.log=="INFO")?log.levels.INFO:log.levels.ERROR);

args.data = path.resolve(process.cwd(), (args.data=='')?'data':args.data);
fs.mkdirSync(args.data, {recursive:true})

console.log("Logging Copilot Completions to directory: ", args.data);

// start the server
app.listen(port, () => console.log(`pilotwatch listening on port ${args.port}!`));

