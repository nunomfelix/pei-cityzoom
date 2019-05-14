kafka-topics.sh --zookeeper localhost:2181 --create --topic Values --partitions 3 --replication-factor 3
kafka-topics.sh --zookeeper localhost:2181 --create --topic Streams --partitions 3 --replication-factor 3
kafka-topics.sh --zookeeper localhost:2181 --create --topic Alarms --partitions 3 --replication-factor 3
