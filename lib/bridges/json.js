/**
 * Loggly implementation for metalogger
 *
 * @type {Loggly|exports|*}
 */
var optional = require('optional')
  , loggly   = optional('loggly')
  , util     = require('util')
  , os       = require('os')
  , client   = {}
  , options  = {
    subdomain: 'test',
    auth:      null,
    json:      true
  };

const winston = require('winston');

// Global logger
let logger = {};

const metalogger = require('../metalogger');

/**
 * Default log level if non provided
 * @type {string}
 * @private
 */
let _level      = 'debug';

exports = module.exports = function(level, loggerInstance) {
  if (!winston) {
    throw new Error('Installation required: in order to use winston bridge, you need to: npm install winston. Aborting.');
  }

  if (typeof loggerInstance === 'undefined') {
    logger = winston.createLogger({
      transports: [
        new winston.transports.Console({
          level: (process.env.NODE_LOGGER_LEVEL || 'debug'),
          handleExceptions: true,
          json: false, colorize: true
        })
      ],
      exitOnError: false
    });
  } else {
    logger = loggerInstance;
  }

  if (level) { _level = level; }

  const logwrapper =  function() {};

  logwrapper.debug      = function() { delegate('debug', arguments); };
  logwrapper.info       = function() { delegate('info', arguments); };
  logwrapper.notice     = function() { delegate('notice', arguments); };
  logwrapper.warning    = function() { delegate('warning', arguments); };
  logwrapper.error      = function() { delegate('error', arguments); };
  logwrapper.critical   = function() { delegate('critical', arguments); };
  logwrapper.alert      = function() { delegate('alert', arguments); };
  logwrapper.emergency  = function() { delegate('emergency', arguments); };

  return logwrapper;
};

/**
 * Delegate function for each log level
 *
 * @param method
 * @param _args
 */
function delegate(method, _args) {

  const shouldLog = require('../metalogger').shouldLog;
  let callPosition = metalogger.callposition()
    , file
    , line;

  if (!shouldLog(method, _level)) {
    return;
  }

  let caption = undefined;
  let message = "";

  if (!metalogger.shouldLog(method, _level)) {
    return;
  }

  var args = Array.prototype.slice.call(_args);

  if(args.length === 1) {
    if(typeof args[0] === 'object' || typeof args[0] === 'string') {
      message = args[0];
    } else {
      message = util.inspect(args[0], { showHidden: true, depth: null });
    }
  }

  if(args.length === 2) {
    caption = args.shift();
    message = util.inspect(args[0], { showHidden: true, depth: null });
  }

  if(args.length > 2) {
    caption = args.shift();
    message = util.format.apply(null, args);
  }

  try{
    file = callPosition.split(':')[0].replace(' [','');
    line = callPosition.split(':')[1].replace('] ','');
  } catch(e) {
    // something went wrong with stack trace
  }

  var jsonFormat = {
    timestamp: (new Date()).toISOString(),
    hostname: os.hostname(),
    level: method,
    file: file,
    line: line,
    message
  };

  if(caption) {
    jsonFormat.caption = caption;
  }

  var logMethod = meta2winstonMethod(method);
  logger[logMethod](jsonFormat);
}

function meta2winstonMethod(metaMethod) {

  var logLevelsObj = {
    "emergency" : 'error'
    , "alert"     : 'error'
    , "critical"  : 'error'
    , "error"     : 'error'
    , "warning"   : 'warn'
    , "notice"    : 'verbose'
    , "info"      : 'info'
    , "debug"     : 'debug'
  };

  var out = logLevelsObj[metaMethod] || 'debug';
  return out;
}
