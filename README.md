# winston-datadog-logs-transport ![](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)

> Winston transport for Datadog Logs (not events)

There are 3 winston transports for Datadog on NPM:
[1](https://github.com/sparkida/winston-datadog),
[2](https://github.com/kioannou/winston-datadog-logger),
[3](https://github.com/outwithreality/winston-datadog-transport).

**All of them send data to [Datadog Events](https://docs.datadoghq.com/getting_started/#events) instead of [Datadog Logs](https://docs.datadoghq.com/logs/?tab=usregion)**.
This package actually is a transport for Datadog Logs, not Events.

## Install

```
$ yarn add @shelf/winston-datadog-logs-transport
```

## Usage

```javascript
import winston from 'winston';
import DatadogTransport from '@shelf/winston-datadog-logs-transport';

const logger = winston.createLogger({
  transports: [
    new DatadogTransport({
      apiKey: process.env.DD_API_KEY, // Datadog API key
      port: 443, // optional port, 443 is for EU region secure port
      host: 'tcp-intake.logs.datadoghq.eu', // optinal host, 'tcp-intake.logs.datadoghq.eu' is for EU region host
      // optional metadata which will be merged with every log message
      metadata: {
        ddsource: 'lambda',
        environment: 'prod'
      }
    })
  ]
});

logger.info('Hey there', {thisIsMy: 'metadata'});
```

## Publish

```sh
$ git checkout master
$ yarn version
$ yarn publish
$ git push origin master --tags
```

## License

MIT © [Shelf](https://shelf.io)
