package org.github.ZePaiva.kafka;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.apache.avro.AvroTypeException;
import org.apache.avro.Schema;
import org.apache.avro.generic.GenericDatumReader;
import org.apache.avro.io.DatumReader;
import org.apache.avro.io.Decoder;
import org.apache.avro.io.DecoderFactory;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.errors.WakeupException;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;

import javax.swing.plaf.TableHeaderUI;
import java.io.ByteArrayInputStream;
import java.io.DataInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;
import java.util.concurrent.CountDownLatch;

public class ValuesSink {

    private static JsonParser jsonParser = new JsonParser();
    private MongoClient mongoClient = MongoClients.create();
    private MongoDatabase mongoDatabase = mongoClient.getDatabase("city_zoom_data_layer");
    private MongoCollection<Document> collection = mongoDatabase.getCollection("values");

    public static void main(String[] args) {
        new ValuesSink().run();
    }

    private void run() {

        Logger logger = LoggerFactory.getLogger(ValuesSink.class.getName());

        String bootstrapServers = "127.0.0.1:9092";
        String groupID = "cityzoom-data-layer";
        String topic = "Values";

        CountDownLatch latch = new CountDownLatch(1);
        logger.info("Latch created");
        Runnable consumer = new ConsumerThread(latch, bootstrapServers, groupID, topic);
        Thread thread = new Thread(consumer);
        thread.start();

        Runtime.getRuntime().addShutdownHook(new Thread( () -> {
            logger.info("Caught shutdown hook");
            ((ConsumerThread) consumer).shutdown();
            try {
                latch.await();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            logger.info("App has exited");
        }));

        try {
            latch.await();
        } catch (InterruptedException e) {
            logger.error("Application interrupted: ", e);
        } finally {
            logger.info("Ending...");
        }
    }

    public static boolean schemaValidator(Schema schema, String json) throws IOException {
        InputStream input = new ByteArrayInputStream(json.getBytes());
        DataInputStream dataInputStream = new DataInputStream(input);

        try {
            DatumReader reader = new GenericDatumReader(schema);
            Decoder decoder = DecoderFactory.get().jsonDecoder(schema, dataInputStream);
            reader.read(null, decoder);
            return true;
        } catch (AvroTypeException e) {
            System.out.println(e.getMessage());
            return false;
        }
    }

    public class ConsumerThread implements Runnable {

        private CountDownLatch latch;
        private KafkaConsumer<String, String> valuesConsumer;
        private Properties kafkaProperties = new Properties();
        private Logger logger = LoggerFactory.getLogger(ConsumerThread.class);

        private Schema valuesSchema = new Schema.Parser().parse("{\n" +
                "\"type\": \"record\",\n" +
                "\"name\": \"Test\",\n" +
                "\"fields\": [\n" +
                "  { \"name\": \"stream\", \"type\": \"string\" },\n" +
                "  { \"name\": \"value\", \"type\": \"string\" },\n" +
                "  { \"name\": \"timestamp\", \"type\": \"long\" },\n" +
                "  { \"name\": \"latitude\", \"type\": \"double\" },\n" +
                "  { \"name\": \"longitude\", \"type\": \"double\" }\n" +
                "  ]\n" +
                "}");


        public ConsumerThread (CountDownLatch latch, String bootstrapServers,String groupID, String topic) {
            this.latch = latch;
            kafkaProperties.setProperty(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
            kafkaProperties.setProperty(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
            kafkaProperties.setProperty(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
            kafkaProperties.setProperty(ConsumerConfig.GROUP_ID_CONFIG, groupID);
            kafkaProperties.setProperty(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
            valuesConsumer = new KafkaConsumer<String, String>(kafkaProperties);
            valuesConsumer.subscribe(Arrays.asList(topic));
        }

        @Override
        public void run() {
            try {
                while (true) {
                    ConsumerRecords<String, String> records = valuesConsumer.poll(Duration.ofMillis(100));
                    List<Document> docsList = new ArrayList<>();
                    for (ConsumerRecord<String, String> record: records) {
                        try {
                            logger.info("Record: "+ record.value());
                            JsonObject value = jsonParser.parse(record.value()).getAsJsonObject();
                            if (!schemaValidator(valuesSchema, value.toString())) {
                                logger.error("Error parsing the following request: "+ value.toString());
                            } else {
                                double[] location = new double[2];
                                Document document = new Document("stream_name", value.get("stream").getAsString())
                                        .append("value", value.get("value").getAsString())
                                        .append("timestamp", value.get("timestamp").getAsInt())
                                        .append("latitude", value.get("latitude").getAsDouble())
                                        .append("longitude", value.get("longitude").getAsDouble());
                                docsList.add(document);
                            }
                        } catch (IllegalStateException e) {
                            logger.error("Object given not in JSON format!");
                        }
                    }
                    if (!docsList.isEmpty())
                        collection.insertMany(docsList);

                    logger.info("Committing offsets...");
                    valuesConsumer.commitSync();
                    logger.info("Offsets commited");

                    try {
                        Thread.sleep(1500000);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            } catch (WakeupException | IOException e) {
                logger.info("Received shutdown signal!");
            } finally {
                valuesConsumer.close();
                latch.countDown();
            }
        }

        public void shutdown() {
            valuesConsumer.wakeup();
        }
    }
}
