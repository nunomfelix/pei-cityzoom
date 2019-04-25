package DLInterface.Routes;

import DLBroker.MongoAux;
import DLBroker.Producer;
import DLInterface.Middleware.Validation;
import com.google.gson.JsonObject;
import com.mongodb.client.MongoCollection;
import org.bson.Document;
import org.json.JSONException;
import spark.Request;
import spark.Response;

import javax.net.ssl.HttpsURLConnection;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Set;

import static com.mongodb.client.model.Filters.eq;

public class Streams {

    private static Producer producer = new Producer();
    private static Validation validator = new Validation();
    private static MongoCollection<Document> streams = MongoAux.getCollection("streams");
    private static List<String> types = Arrays.asList("temperature", "oxygen");
    private static Date date = new Date();

    // Status - Passing
    public static String createStream(Request request, Response response) throws JSONException {
        response.type("application/json");
        JsonObject body = (JsonObject) MongoAux.jsonParser.parse(request.body());
        String valid = validator.validateCreate(body);
        if (!valid.equals("")) {
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
                        "\t\"ttl\":\""+ttl+"\"," +
                        "\t\"creation\":"+date.getTime()+"," +
                        "\t\"lastUpdate\":"+date.getTime()+"" +
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
    }

    // Status - Passing
    public static String deleteStream(Request request, Response response) throws JSONException {
        response.type("application/json");
        String to_del = request.params(":stream");
        if (streams.find(eq("stream", to_del)).first() == null) {
            response.status(HttpsURLConnection.HTTP_NOT_FOUND);
            return "{\n" +
                    "\t\"status\": \"Error\",\n" +
                    "\t\"Error\": \"Stream " + to_del + " not found.\"\n" +
                    "}";
        }
        streams.deleteOne(eq("stream", to_del));
        response.status(HttpsURLConnection.HTTP_NO_CONTENT);
        return "";
    }

    // Status - TODO
    public static String listStreams(Request request, Response response) {
        return "Listing streams";
    }

    // Status - Passing
    public static String detailStream(Request request, Response response) {
        response.type("application/json");
        String stream = request.params(":stream");
        Document document = streams.find(eq("stream",stream)).first();
        if (document == null) {
            response.status(HttpsURLConnection.HTTP_NOT_FOUND);
            return "{\n" +
                    "\t\"status\": \"Error\",\n" +
                    "\t\"Error\": \"Stream " + stream + " not found.\"\n" +
                    "}";
        }
        response.status(200);
        JsonObject jsonStream = (JsonObject) MongoAux.jsonParser.parse(document.toJson());
        return "{\n" +
                "\t\"stream\": \""+jsonStream.get("stream").getAsString()+"\",\n" +
                "\t\"description\": \""+jsonStream.get("description").getAsString()+"\",\n" +
                "\t\"mobile\": \""+jsonStream.get("mobile").getAsBoolean()+"\",\n" +
                "\t\"type\": \""+jsonStream.get("type").getAsString()+"\",\n" +
                "\t\"ttl\": \""+jsonStream.get("ttl").getAsInt()+"\",\n" +
                "\t\"periodicity\": \""+jsonStream.get("periodicity").getAsInt()+"\",\n" +
                "\t\"creation\": \""+jsonStream.get("creation").getAsJsonObject().get("$numberLong").getAsLong()+"\",\n" +
                "\t\"lastUpdate\": \""+jsonStream.get("lastUpdate").getAsJsonObject().get("$numberLong").getAsLong()+"\"\n" +
                "}";
    }
}
