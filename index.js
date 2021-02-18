const tls = require('tls');
const Transport = require('winston-transport');
const safeStringify = require('fast-safe-stringify');

const config = {
  host: 'intake.logs.datadoghq.com',
  port: 10516
};

const setupListeners = socket =>
  new Promise((resolve, reject) => {
    socket.on('secureConnect', resolve).on('error', reject).on('timeout', reject);
  });

// @see @credits https://git.io/fhwzM

module.exports = class DatadogTransport extends Transport {
  constructor(opts) {
    super(opts);

    this.metadata = {};
    config.apiKey = opts.apiKey;
    // add port and host as optional options
    //so the user can change the port and host when his Databog region is not US
    config.port = opts.port || config.port;
    config.host = opts.host || config.host;

    if (opts.metadata) {
      Object.assign(this.metadata, opts.metadata);
    }
  }

  async log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    const socket = tls.connect(config.port, config.host);

    try {
      // connect to socket
      await setupListeners(socket);
    } catch (exception) {
      // catch any exception that might happen and report it back
      return callback(exception);
    }

    if (!socket.authorized) {
      return callback('Error connecting to DataDog');
    }

    // Merge the metadata with the log
    const logEntry = {...this.metadata, ...info};

    socket.write(`${config.apiKey} ${safeStringify(logEntry)}\r\n`, () => {
      socket.end();

      return callback();
    });
  }
};
