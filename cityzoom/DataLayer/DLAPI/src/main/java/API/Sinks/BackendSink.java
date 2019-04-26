package API.Sinks;

import org.apache.kafka.clients.producer.*;
import org.apache.kafka.common.serialization.StringSerializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Date;
import java.util.Properties;

public class BackendSink {

    private String bootstrapServers ="0.0.0.0:9092";
    private Properties properties = new Properties();
    private Date date;
    private KafkaProducer<String, String> producer;

    Logger logger = LoggerFactory.getLogger(BackendSink.class.getName());

    public BackendSink() {
        // basic producer configs
        this.properties.setProperty(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        this.properties.setProperty(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        this.properties.setProperty(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());

        // safe producer properties
        this.properties.setProperty(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, "true");
        this.properties.setProperty(ProducerConfig.ACKS_CONFIG, "all");
        this.properties.setProperty(ProducerConfig.RETRIES_CONFIG, Integer.toString(10));
        this.properties.setProperty(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, "5");

        // high throughput producer
        this.properties.setProperty(ProducerConfig.COMPRESSION_TYPE_CONFIG, "snappy");
        this.properties.setProperty(ProducerConfig.LINGER_MS_CONFIG, "20");
        this.properties.setProperty(ProducerConfig.BATCH_SIZE_CONFIG, Integer.toString(32*1024));

        this.producer = new KafkaProducer<String, String>(this.properties);
    }

    public void produce(String topic, String key, String value) {
        this.producer.send(new ProducerRecord<>(topic, key, value), new Callback() {
            @Override
            public void onCompletion(RecordMetadata recordMetadata, Exception e) {
                if (e != null) {
                    logger.error("Error: ", e);
                }
            }
        });
    }
}
