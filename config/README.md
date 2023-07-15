# Configuration files

## config/default.js

The _default.js_ returns the default configuration as the default export. The
configuration is a plain JSON-serializable object.

This file is always exists and normally should not be edited. It can be
overridden in runtime by the patch file described below.

## [web-root]/config.json

The _config.json_ should be placed in web root near the _index.html_.

This file, if exists, is merged with the default configuration in runtime (when
site is opened in the browser). It allow site administrator to change some
configuration parameters without recompiling all the code.

You can also use this file with the development server. Just place a
_config.json_ to the project root (near the _package.json_). Bear in mind that
this file will not be included in compiled code!