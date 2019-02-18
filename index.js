const Transport = require('winston-transport');
const tls = require('tls');

const config = {
  host: 'intake.logs.datadoghq.com',
  port: 10516
};

const waitForConnection = socket => new Promise(resolve => socket.on('secureConnect', resolve));
const socketErrorHandler = error => {
  // eslint-disable-next-line no-console
  console.log('datadog socket error', error);
};

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

    const socket = tls.connect(config.port, config.host);
    await waitForConnection(socket);

    socket.on('error', socketErrorHandler);
    socket.on('timeout', socketErrorHandler);

    if (!socket.authorized) {
      return callback('Error connecting to DataDog');
    }

    // Merge the metadata with the log
    const logEntry = Object.assign({}, this.metadata, info);

    socket.write(`${config.apiKey} ${JSON.stringify(logEntry)}\r\n`, () => {
      socket.end();

      return callback();
    });
  }
};
