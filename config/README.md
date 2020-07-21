# Configuration files

## config/default.js

The _default.js_ returns the default configuration as default export. The
configuration is the plain JSON-serializable object.

This file is always exists and normally should not be edited. It can be
overridden in compile- or runtime by the files described below.

## config/local.json

The _local.json_ file is not exists by default but can be created by developer.
It is the local "patch" that overriddes the specific values of default
configuration.

The _local.json_ is not visible for the version control. The default + local
configuration is embedded into the generated application code. It is useful if
you run the development server and want to redefine some default values.

## [web-root]/config.json

The _config.json_ acts like a _local.json_ but it is not embedded into the
application code and it is not placed in the 'config' folder. Instead it should
be placed in web root near the _index.html_.

This file, if exists, is merged with the other configuration in runtime (when
site is opened in the browser). It allow site administrator to change some
configuration parameters without recompiling all the code.
