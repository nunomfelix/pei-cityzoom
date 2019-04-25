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

import static com.mongodb.client.model.Filters.eq;

public class Values {

    private static Producer producer = new Producer();
    private static Validation validator = new Validation();
    private static MongoCollection<Document> streams = MongoAux.getCollection("streams");
    private static MongoCollection<Document> values = MongoAux.getCollection("values");
    private static List<String> types = Arrays.asList("temperature", "oxygen");
    private static Date date = new Date();

    // Status - TODO
    public static String getValues(Request request, Response response) {
        return "Getting all values";
    }

    // Status - Passing
    public static String postValue(Request request, Response response) throws JSONException {
        response.type("application/json");
        JsonObject body = (JsonObject) MongoAux.jsonParser.parse(request.body());
        String valid = validator.validatePushValues(body);
        if (!valid.equals("")) {
            response.status(HttpsURLConnection.HTTP_BAD_REQUEST);
            return valid;
        }
        String stream = body.get("stream_name").getAsString();
        Document docStream = streams.find(eq("stream", stream)).first();
        if (docStream == null) {
            response.status(HttpsURLConnection.HTTP_NOT_FOUND);
            return "{\n" +
                    "\t\"status\": \"Error\",\n" +
                    "\t\"Error\": \"Stream " + stream + " not found.\"\n" +
                    "}";
        }
        String value = body.get("value").getAsString();
        double lat = body.get("latitude").getAsDouble();
        double longitude = body.get("longitude").getAsDouble();
        long timestamp = date.getTime();

        String valuePost=
                "{\n" +
                        "\t\"stream\": \""+stream+"\",\n" +
                        "\t\"value\": \""+value+"\",\n" +
                        "\t\"timestamp\": \""+timestamp+"\",\n" +
                        "\t\"latitude\": \""+lat+"\",\n" +
                        "\t\"longitude\": \""+longitude+"\"\n" +
                        "}";
        String topic = "Values";
        producer.produce(topic, "key", valuePost);
        response.status(HttpsURLConnection.HTTP_NO_CONTENT);
        return "";
    }
}
