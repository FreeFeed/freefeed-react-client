# Configuration files

## config/default.js

The _default.js_ returns the default configuration as default export. The
configuration is the plain JSON-serializable object.

This file is always exists and normally should not be edited. It can be
overridden in runtime by the file described below.

## [web-root]/config.json

The _config.json_ file is not exists by default but can be created by site
administrator or developer. It is the local "patch" that overriddes the specific
values of default configuration. It should be placed in web root near the
_index.html_.

This file, if exists, is merged with the default configuration in runtime (when
site is opened in the browser). It allow site administrator to change some
configuration parameters without recompiling all the code. 

For example, if you
just want to change the API server address, use the following minimal
config.json:

```json
{ "api": { "root": "https://example.net" } }
```
All other configuration parameters will be taken from the default configuration.

You can also use this file with the development server. Just place a
_config.json_ to the project root near the _package.json_ (it will not be
visible for the version control). Bear in mind that this file will not be
included in compiled code!