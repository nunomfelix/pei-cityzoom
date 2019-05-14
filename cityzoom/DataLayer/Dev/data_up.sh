#!/bin/bash
xterm -e java -jar DevicesSinks-1.0-jar-with-dependencies.jar &
xterm -e java -jar Sinks-1.0-jar-with-dependencies.jar &
xterm -e java -jar ValuesSinks-1.0-jar-with-dependencies.jar &
xterm -e java -jar DLAPI-1.0-jar-with-dependencies.jar &
