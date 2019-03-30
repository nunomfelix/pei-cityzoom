#!/bin/bash
bin/zookeeper-server-start.sh configs/zookeeper.properties &
bin/kafka-server-start.sh configs/server_0.properties &
bin/kafka-server-start.sh configs/server_1.properties &
bin/kafka-server-start.sh configs/server_2.properties &
bin/kafka-server-start.sh configs/server_3.properties &
bin/kafka-server-start.sh configs/server_4.properties &