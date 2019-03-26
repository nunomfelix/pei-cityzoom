#!/bin/bash
echo -e "Starting kafka zookeeper"
zookeeper-server-start.sh configs/zookeeper.properties & &> /dev/null

echo -e "Starting kafka brokers"
kafka-server-start.sh configs/server_0.properties & &> /dev/null
kafka-server-start.sh configs/server_1.properties & &> /dev/null
kafka-server-start.sh configs/server_2.properties & &> /dev/null

