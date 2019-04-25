package DLInterface;

import DLBroker.MongoAux;
import DLBroker.Producer;
import DLInterface.Middleware.Validation;
import com.google.gson.JsonObject;
import com.mongodb.client.MongoCollection;
import org.bson.Document;

import javax.net.ssl.HttpsURLConnection;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Set;

import static com.mongodb.client.model.Filters.eq;
import static spark.Spark.*;

public class DataLayerAPI {

    private static Producer producer = new Producer();
    private static Validation validator = new Validation();
    private static MongoCollection<Document> streams = MongoAux.getCollection("streams");
    private static MongoCollection<Document> values = MongoAux.getCollection("values");
    private static List<String> types = Arrays.asList(new String[]{"temperature", "oxygen"});
    private static Date date = new Date();

    public static void main(String[] args) {

        // server configurations
        port(8001);

        // routes
        post("/czb/stream", (request, response) -> {
            response.type("application/json");
            JsonObject body = (JsonObject) MongoAux.jsonParser.parse(request.body());
            String valid = validator.validateCreate(body);
            if (valid != "") {
                response.status(HttpsURLConnection.HTTP_BAD_REQUEST);
                return valid;
            }
            Set<String> keys = body.keySet();
            String stream = body.get("stream").getAsString();
            if (streams.find(eq("stream", stream)).first() != null) {
                response.status(HttpsURLConnection.HTTP_CONFLICT);
                return "{\n" +
                        "\t\"status\": \"Error @ stream name\",\n" +
                        "\t\"Error\": \"Stream " + stream + " already exists\"\n" +
                        "}";
            }
            String type = body.get("type").getAsString();
            if (!types.contains(type)){
                response.status(HttpsURLConnection.HTTP_CONFLICT);
                return "{\n" +
                        "\t\"status\": \"Error @ type\",\n" +
                        "\t\"Error\": \"Type " + type + " not available. Available types are "+types.toString()+"\"\n" +
                        "}";

            }
            String description = keys.contains("description") ? body.get("description").getAsString() : "";
            boolean mobile = keys.contains("mobile") && body.get("mobile").getAsBoolean();
            int periodicity = keys.contains("periodicity") ?
                                body.get("periodicity").getAsInt() > 0 ? body.get("periodicity").getAsInt() : 1200 :
                            1200;
            int ttl = keys.contains("ttl") ?
                        body.get("ttl").getAsInt() > 0 ? body.get("ttl").getAsInt() : 120000 :
                    120000;

            String produceRequest =
                    "{\n" +
                            "\t\"stream\":\""+stream+"\",\n" +
                            "\t\"description\":\""+description+"\",\n" +
                            "\t\"type\":\""+type+"\",\n" +
                            "\t\"mobile\":\""+mobile+"\",\n" +
                            "\t\"periodicity\":\""+periodicity+"\",\n" +
                            "\t\"ttl\":\""+ttl+"\"\n" +
                    "}";
            String topic = "Streams";
            producer.produce(topic, "chave_minima", produceRequest);
            return "{\n" +
                    "\t\"status\":\"Creation successful\",\n" +
                    "\t\"stream_name\":\""+stream+"\",\n" +
                    "\t\"account_name\":\"none\",\n" +
                    "\t\"creation_time\":\""+date.getTime()+"\",\n" +
                    "\t\"periodicity\":\""+periodicity+"\"\n" +
                    "}";
        });

        get("/czb/stream/:stream", (request, response) -> {
            response.type("application/json");
            return "Getting stream description:\n"+request.params(":stream");
        });

        put("/czb/stream", (request, response) -> {
            return "Pushing values to stream:\n"+request.body();
        });

        get("/czb/stream/values", (request, response) -> {
            return "Getting all values of stream:\n"+request.queryMap("stream");
        });

        get("/czb/stream/list", (request, response) -> {
            return "Getting a lsit of all streams in interval:\n";
        });

        delete("/czb/stream", (request, response) -> {
            return "Deleting stream:\n"+request.body();
        });
    }

}
