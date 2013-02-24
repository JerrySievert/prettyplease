var clarinet = require('clarinet');


function spaces (indent, count) {
  var ret = '';

  for (var i = 0; i < (indent * count); i++) {
    ret += ' ';
  }

  return ret;
}

function Beautifier (input, output, options) {
  this.options = options || { };

  if (this.options.spaces === undefined) {
    this.options.spaces = 2;
  }

  this.indentLevel = 0;
  this.commas = [ ];
  this.input  = input;
  this.output = output;
  this.state  = '';

  this.parser = clarinet.createStream();
  this.input.pipe(this.parser);

  var obj = this;

  this.parser.on('error', function (err) {
    // unhandled errors will throw, since this is a proper node
    // event emitter.
    console.error("error: ", err);
    // clear the error
    this._parser.error = null;
    this._parser.resume();
  });

  this.parser.on('openobject', function (key) {
    var buf = '';

    if (obj.indentLevel > obj.commas.length || obj.state === 'closeobject') {
      buf += ",";
      if (obj.state === 'closeobject') {
        buf += "\n";
        buf += spaces(obj.indentLevel, obj.options.spaces);
      }
    } else if (obj.state !== 'key') {
      buf += spaces(obj.indentLevel, obj.options.spaces);
    }
    buf += "{\n";
    obj.indentLevel++;
    buf += spaces(obj.indentLevel, obj.options.spaces) + "\"" + key + "\": ";

    obj.output.write(buf);

    obj.state = 'key';
    obj.commas.push(true);
  });

  this.parser.on('closeobject', function (key) {
    var buf = '';

    obj.indentLevel--;
    buf += "\n" + spaces(obj.indentLevel, obj.options.spaces) + "}";

    obj.output.write(buf);

    obj.state = 'closeobject';
    obj.commas.pop();
  });

  this.parser.on('value', function (value) {
    var buf = '';

    if (obj.state !== 'key') {
      if (obj.state === 'value') {
        buf += ",\n";
      }

      buf += spaces(obj.indentLevel, obj.options.spaces);
    }

    if (typeof value === 'number') {
      buf += String(value);
    } else {
      buf += "\"" + value.replace("\"", "\\\"") + "\"";
    }

    obj.state = 'value';
    obj.output.write(buf);
  });

  this.parser.on('key', function (key) {
    var buf = '';

    if (obj.indentLevel === obj.commas.length) {
      buf += ",";
    }

    buf += "\n";
    buf += spaces(obj.indentLevel, obj.options.spaces) + "\"" + key + "\": ";

    obj.state = 'key';
    obj.output.write(buf);
  });

  this.parser.on('openarray', function () {
    var buf = '';

    if (obj.state === 'closearray') {
      buf += ",\n" + spaces(obj.indentLevel, obj.options.spaces);
    } else if (obj.state === 'openarray') {
      buf += spaces(obj.indentLevel, obj.options.spaces);
    }

    buf += "[\n";
    obj.indentLevel++;

    obj.output.write(buf);

    obj.state = 'openarray';
    obj.commas.push(true);
  });

  this.parser.on('closearray', function () {
    var buf = '';

    obj.indentLevel--;
    buf += "\n" + spaces(obj.indentLevel, obj.options.spaces) + "]";

    obj.output.write(buf);

    obj.state = 'closearray';
    obj.commas.pop();
  });

}

exports.Beautifier = Beautifier;