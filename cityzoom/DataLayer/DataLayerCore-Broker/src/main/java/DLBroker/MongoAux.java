package DLBroker;

import com.google.gson.JsonParser;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.apache.avro.AvroTypeException;
import org.apache.avro.Schema;
import org.apache.avro.generic.GenericDatumReader;
import org.apache.avro.io.DatumReader;
import org.apache.avro.io.Decoder;
import org.apache.avro.io.DecoderFactory;
import org.bson.Document;

import java.io.ByteArrayInputStream;
import java.io.DataInputStream;
import java.io.IOException;
import java.io.InputStream;

public class MongoAux {
    public static MongoCollection<Document> getCollection(String collection) {
        MongoClient mongoClient = MongoClients.create();
        MongoDatabase mongoDatabase = mongoClient.getDatabase("city_zoom_data_layer");
        return mongoDatabase.getCollection(collection);
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

    public static JsonParser jsonParser = new JsonParser();
}
