FROM maven:latest
RUN mkdir /data_layer
WORKDIR /data_layer
ADD DLAPI ./
ADD ValuesSinks ./
ADD Sinks ./
CMD [ "mvn", "-f", "DLAPI/pom.xml" ]
CMD [ "mvn", "-f", "ValuesSinks/pom.xml" ]
CMD [ "mvn", "-f", "Sinks/pom.xml" ]
Add . .
CMD [ "ls" ]
