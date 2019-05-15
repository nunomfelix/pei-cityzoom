package Sink;

import Aux.MongoAux;
import com.google.gson.JsonObject;
import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Updates;
import org.apache.avro.Schema;
import org.apache.avro.data.Json;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.errors.WakeupException;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.print.Doc;
import java.io.IOException;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.CountDownLatch;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Updates.set;

public class ValuesSinker {
    private MongoCollection<Document> collection = MongoAux.getCollection("values");
    private MongoCollection<Document> streams = MongoAux.getCollection("streams");
    private MongoCollection<Document> devices = MongoAux.getCollection("devices");
    private Date date = new Date();

    public static void main(String[] args) {
        new ValuesSinker().run();
    }

    private void run() {

        Logger logger = LoggerFactory.getLogger(ValuesSinker.class.getName());

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
            kafkaProperties.setProperty(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, "300000000");
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
                            JsonObject value = MongoAux.jsonParser.parse(record.value()).getAsJsonObject();
                            if (!MongoAux.schemaValidator(valuesSchema, value.toString())) {
                                logger.error("Error parsing the following request: "+ value.toString());
                            } else {
                                System.out.println(value.toString());
                                Document document = new Document("stream_name", value.get("stream").getAsString())
                                        .append("value", value.get("value").getAsString())
                                        .append("timestamp", value.get("timestamp").getAsLong())
                                        .append("latitude", value.get("latitude").getAsDouble())
                                        .append("longitude", value.get("longitude").getAsDouble());
                                docsList.add(document);
                                JsonObject stream = (JsonObject) MongoAux.jsonParser.parse(streams.findOneAndUpdate(eq("stream", value.get("stream").getAsString()), set("lastUpdate", date.getTime())).toJson());
                                System.out.println(stream.toString());
                                JsonObject device = (JsonObject) MongoAux.jsonParser.parse(devices.find(eq("_id", new ObjectId(stream.get("device_id").getAsString()))).first().toJson());
                                if (device.get("mobile").getAsBoolean()) {
                                    Document newLoc = new Document("timestamp", value.get("timestamp").getAsLong())
                                            .append("latitude", value.get("latitude").getAsDouble())
                                            .append("longitude", value.get("longitude").getAsDouble());
                                    devices.updateOne(eq("_id", new ObjectId(stream.get("device_id").getAsString())), Updates.addToSet("locations", newLoc));

                                }
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
                        Thread.sleep(Duration.ofMinutes(5).toMillis());
                        //Thread.sleep(Duration.ofMillis(100).toMillis());
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

        void shutdown() {
            valuesConsumer.wakeup();
        }
    }
}
