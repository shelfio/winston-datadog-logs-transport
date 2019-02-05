const Transport = require('winston-transport');
const tls = require('tls');

const config = {
  host: 'intake.logs.datadoghq.com',
  port: 10516
};

const socket = tls.connect(config.port, config.host);
const onSecureConnect = new Promise(resolve => socket.on('secureConnect', resolve));

socket.setKeepAlive(true);
socket.on('error', error => {
  // eslint-disable-next-line no-console
  console.log('datadog socket error', error);
});

// @see @credits https://git.io/fhwzM

module.exports = class DatadogTransport extends Transport {
  constructor(opts) {
    super(opts);

    this.metadata = {};
    config.apiKey = opts.apiKey;

    if (opts.metadata) {
      Object.assign(this.metadata, opts.metadata);
    }
  }

  async log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    await onSecureConnect;

    if (!socket.authorized) {
      return callback('Error connecting to DataDog');
    }

    // Merge the metadata with the log
    const logEntry = Object.assign({}, this.metadata, info);

    socket.write(`${config.apiKey} ${JSON.stringify(logEntry)}\r\n`);

    return callback();
  }
};
