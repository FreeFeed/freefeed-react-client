@echo off

set thisdir=%~dp0
set thisfile=%~f0

set out_dir=%thisdir%_dist
set public_path=/

set webpack=%thisdir%node_modules\.bin\webpack ^
	--config webpack.config.babel.js ^
	--output-path %out_dir% ^
	--output-public-path %public_path%

set action=%1

if "%action%"=="clean" (
  echo Running %action%...
  if exist %out_dir% (
    rmdir /s /q %out_dir%
  )
)

if "%action%"=="prod" (
  echo Running %action%...
  %thisfile% clean
  set UGLIFY=1
  set HASH=1
  set DEV=0
  %webpack%
)

if "%action%"=="prod-nouglify" (
  echo Running %action%...
  %thisfile% clean
  set UGLIFY=0
  set HASH=1
  set DEV=0
  %webpack%
)

if "%action%"=="dev" (
  echo Running %action%...
  %thisfile% clean
  set UGLIFY=0
  set HASH=0
  set DEV=1
  %webpack%
)

echo Done %action%.
