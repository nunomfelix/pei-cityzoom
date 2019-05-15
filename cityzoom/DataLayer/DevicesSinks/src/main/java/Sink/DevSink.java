package Sink;

import Aux.MongoAux;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import com.mongodb.MongoBulkWriteException;
import com.mongodb.client.MongoCollection;
import org.apache.avro.Schema;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.errors.WakeupException;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.lang.reflect.Array;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.CountDownLatch;

public class DevSink {
    private MongoCollection<Document> collection = MongoAux.getCollection("devices");
    private static PrintWriter writer;
    private static InputStream geojsonfile;
    public static void main(String[] args) throws FileNotFoundException {
        writer = new PrintWriter("devFile");
        //geojsonfile = new FileInputStream("portugal_municipios.geojson");
        new DevSink().run();
    }

    private void run() {

        Logger logger = LoggerFactory.getLogger(DevSink.class.getName());

        String bootstrapServers = "127.0.0.1:9092";
        String groupID = "cityzoom-data-layer";
        String topic = "Devices";

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
                "  { \"name\": \"device_name\", \"type\": \"string\" },\n" +
                "  { \"name\": \"description\", \"type\": \"string\" },\n" +
                "  { \"name\": \"provider\", \"type\": \"string\" },\n" +
                "  { \"name\": \"mobile\", \"type\": \"boolean\" },\n" +
                "  { \"name\": \"vertical\", \"type\": { \"type\": \"array\", \"items\": {\"name\": \"verts\", \"type\": \"string\"}}},\n"+
                "  { \"name\": \"latitude\", \"type\": \"double\" },\n" +
                "  { \"name\": \"longitude\", \"type\": \"double\" },\n" +
                "  { \"name\": \"creation\", \"type\": \"long\" }" +
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
                            System.out.println(record.value());
                            JsonObject value = MongoAux.jsonParser.parse(record.value()).getAsJsonObject();
                            if (!MongoAux.schemaValidator(valuesSchema, value.toString())) {
                                logger.error("Error parsing the following request: "+ value.toString());
                            } else {
                                ArrayList<HashMap<String, Double>> locations = new ArrayList<>();
                                HashMap<String, Double> locationObjects = new HashMap<>();
                                locationObjects.put("timestamp", value.get("creation").getAsDouble());
                                locationObjects.put("latitude", value.get("latitude").getAsDouble());
                                locationObjects.put("longitude", value.get("longitude").getAsDouble());
                                ArrayList<String> verticalList = new ArrayList<>();
                                for (JsonElement d : value.get("vertical").getAsJsonArray()) {
                                    verticalList.add(d.getAsString());
                                }
                                locations.add(locationObjects);
                                Document document = new Document("device_name", value.get("device_name").getAsString())
                                        .append("description", value.get("description").getAsString())
                                        .append("mobile", value.get("mobile").getAsBoolean())
                                        .append("provider", value.get("provider").getAsString())
                                        .append("vertical", verticalList)
                                        .append("locations", locations)
                                        .append("creation", value.get("creation").getAsLong());
                                System.out.println(value.toString());
                                docsList.add(document);
                                writer.println("ola mundo");
                            }
                        } catch (IllegalStateException e) {
                            logger.error("Object given not in JSON format!");
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }
                    try {
                        if (!docsList.isEmpty())
                            collection.insertMany(docsList);
                        logger.info("Stored devices with success!");
                    } catch (MongoBulkWriteException e) {
                        logger.error("Device already exists");
                    }

                    logger.info("Committing offsets...");
                    valuesConsumer.commitSync();
                    logger.info("Offsets commited");

                    try {
                        Thread.sleep(Duration.ofSeconds(5).toMillis());
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            } catch (WakeupException e) {
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
