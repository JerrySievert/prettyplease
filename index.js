var argv = require('optimist').boolean([ 'json' ]).argv,
    fs   = require('fs');


var beautifier, input, output;

if (argv.json) {
  beautifier = require('./beautifiers/json');
} else {
  console.log("USAGE: " + argv.$0 + " --json [input] [output]");
  process.exit(1);
}

// no input or output
if (argv._.length === 0) {
  input = process.stdin;
  output = process.stdout;
} else {
  // have input
  try {
    input = fs.createReadStream(argv._[0]);
  } catch (err) {
    console.error("ERROR: Unable to open \"" + argv._[0] + "\" for reading");
    process.exit(1);
  }

  if (argv._.length === 2) {
    // have output
    try {
      output = fs.createWriteStream(argv._[1]);
    } catch (err) {
      console.error("ERROR: Unable to open \"" + argv._[1] + "\" for writing");
      process.exit(1);
    }
  } else {
    output = process.stdout;
  }
}

new beautifier.Beautifier(input, output);