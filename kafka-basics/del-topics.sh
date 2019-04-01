#!/bin/bash
topics=$(kafka-topics.sh --zookeeper 127.0.0.1:2181 --list)

for variable in $topics
do
  kafka-topics.sh --zookeeper 127.0.0.1:2181 --topic $variable --delete
done
