## What is MetaLogger?

Metalogger is a versatile logging library for Node.js that provides following features:

1. Granular, Linux Syslog-compatible logging levels.
2. Pluggable logging infrastructure (implemented: npmlog, log.js, util-based logging).
3. Timestamps for all log messages
4. Filename and line-numbers for all log messages!
5. Granular logging control: alter global logging threshhold for specific files.
6. Application-development-friendly configuration
 

## Why Should You Use it?

Well, being able to see the filename and line number where logs were fired is awesome! But also:

TL;DR: [NodejsReactions Animated Gif](http://nodejsreactions.tumblr.com/post/56061993138/when-a-dependency-starts-writing-to-stdout)

If you are familiar with [Apache Commons Logging](http://commons.apache.org/proper/commons-logging/) then you know 
why Node.js needs Metalogger, if not: keep reading.

Node.js is famous for its modular architecture. However, every module developer can have his or her own  preference 
to which logging library they prefer to use. This can lead to one of the following non-ideal scenarios:

1. No logging in the released code (typically what you see in most modules, currently)
2. Logging using the most simplistic tools that don't support varying logging levels
3. Chaos, when each module does extensive logging, but using completely differing libraries.

Other platforms have solved the problem of logging in elegant ways. Metalogger is an attempt to integrate that experience 
into Node.js and achieve seamless logging experience.

The metalogger module is a very lightweight bridge/wrapper for a number of popular logging implementations: 
[npmlog](https://github.com/isaacs/npmlog), 
[log](https://github.com/visionmedia/log.js), [util](http://nodejs.org/api/util.html). A node.js module that 
uses the metalogger library can choose which logging implementation to use at runtime.

Usage of Metalogger is not limited to just standalone modules. Full-blown Node applications will also benefit from 
using Metalogger to ensure that a switch-over to a different logging implementation won't be a hassle, if and when needed.

## Installation and Initialization

Install:

```bash
npm install metalogger
```

Initialization: 

```javascript
var log = require('metalogger')(); // preferred. Read further.
// or if you need more verbose syntax:
var log = require('metalogger')(plugin, level);
```

Where the arguments of the initialization are:

1. `plugin`: short name of the implemented logging plugin. Current implementations include:  ('util', 'npmlog', 'log'). If you
   skip this value or pass `null`, it will default to the value of the environmental variable NODE_LOGGER_PLUGIN

    Full current list can be checked, at runtime, by issuing: 
    
    ```javascript
      log.loggers();
    ```
    
1. `level`: name of the default threshold logging level. If you
   skip this value or pass `null`, it will default to the value of the environmental variable NODE_LOGGER_LEVEL

    Current list of allowed level names can be retrieved by issuing:

    ```
      log.levels();
    ```    
    
    As of this writing the list of the supported levels mirrors that of syslog (and log.js) and is as 
    follows (in decreasing criticality):
    
- __EMERGENCY__  system is unusable
- __ALERT__ action must be taken immediately
- __CRITICAL__ the system is in critical condition
- __ERROR__ error condition
- __WARNING__ warning condition
- __NOTICE__ a normal but significant condition
- __INFO__ a purely informational message
- __DEBUG__ messages to debug an application

## Filename and Line Number Display

For increased debugging comfort Metalogger automatically displays the filename and line number where a log
message is fired at. This is typically very handy in development. If you wish to disable this in production, however
set the environment variable `NODE_LOGGER_SHOWLINES` to 0 or any value that is not 1.

## Usage

The great value of metalogger is in unifying (to the level that it makes sense) the usage of various loggers. 
Even though the first three implemented loggers (util, npmlog, log) are quite different, metalogger manages 
to bridge these differences.

As a best practice, you shouldn't set plugin and/or level values when initializing metalogger from your re-usable modules. 
If not set, these values will default to NODE_LOGGER_PLUGIN and NODE_LOGGER_LEVEL environmental variables, 
allowing the main application to control desired logging universally. 

Initialize metalogger, in your modules, as follows:

```javascript
  var log = require('metalogger')();
```

after which you can use one of the following syntaxes, regardless of the underlying logging plugin.

#### Simple Syntax:

In the simple syntax, you can just pass some message (or a javascript object, which will be properly expanded/serialized):
```javascript
log.info(message);
```

#### Using a caption:

Captioned syntax is very useful for debugging object. You can provide the title for the object in caption and
pass your Javascript object as the second argument. Metalogger will automatically expend the object for you and
display it as a JSON representation.
```javascript
log.debug("User object:", user);
```

#### Advanced Syntax

In the advanced syntax, you can use caption (first argument), format (second argument) and unlimited number of 
value-arguments to construct a complex expressions:

```javascript
log.debug("Caption: ", "Formatted sequence is string: %s, number: %d, number2: %d", somestring, somenumber, othernumber);
```
the format syntax follows the semantics of [util.format](http://nodejs.org/api/util.html#util_util_inspect_object_options)

### Granular Logging

Global logging level can be overriden on a per-file basis. This can be extremely useful when you are 
debugging or developing a specific module and want to use granular logging for it, but want to turn off 
the noise from the rest of the modules.

To override global logging level for a specific file, you set an environment variable as follows:

Let's assume you would like to turn logging level to 'debug' for a file: `lib/models/user.js', you set an environmental
variable as follows (example for Linux):

```
export NODE_LEVEL_lib_models_user_js='debug'
```

Please note that since Linux shell doesn't allow dots or slashes in a variable name, you have to replace those 
with underscores.

Path to file must be indicated from the current folder of the node process.
