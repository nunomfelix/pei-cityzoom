package API.Routes;

import API.Aux.MongoAux;
import com.google.gson.JsonObject;
import com.mongodb.client.FindIterable;
import org.bson.Document;
import org.json.JSONException;
import spark.Request;
import spark.Response;

import javax.net.ssl.HttpsURLConnection;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static API.DataLayerAPI.*;
import static com.mongodb.client.model.Filters.*;

public class Values {

    private static Date date = new Date();

    // Status - Passing
    public static String getValues(Request request, Response response) {
        logger.info("Getting all values from a stream");
        response.type("application/json");
        if (request.queryParams("stream") == null) {
            response.status(HttpsURLConnection.HTTP_NOT_ACCEPTABLE);
            return "{\n" +
                    "\t\"Error\": \"No stream specified\"\n" +
                    "}";
        } else if (streams.find(eq("stream", request.queryParams("stream"))).first() == null) {
            logger.error("Stream not found");
            response.status(HttpsURLConnection.HTTP_NOT_FOUND);
            return "{\n" +
                    "\t\"Error\": \"Stream "+ request.queryParams("stream")+" not found\"\n" +
                    "}";
        }
        long start = request.queryParams("interval_start") != null ?
                Long.parseLong(request.queryParams("interval_start")) : 0;
        long end = request.queryParams("interval_end") != null?
                Long.parseLong(request.queryParams("interval_end")) : date.getTime();
        long compass = date.getTime();

        if (end < start || end > compass || start < 0) {
            logger.error("Bad interval");
            response.status(HttpsURLConnection.HTTP_NOT_ACCEPTABLE);
            return "{\n" +
                    "\t\"Error\": \"Interval not acceptable\"\n" +
                    "}";
        }

        List<String> valuesList = new ArrayList<>();
        long size = values.countDocuments(and(eq("stream_name", request.queryParams("stream")),gte("timestamp", start), lte("timestamp", end)));
        long total = values.countDocuments();
        FindIterable<Document> valuesIterable = values.find(and(eq("stream_name", request.queryParams("stream")),gte("timestamp", start), lte("timestamp", end)));
        JsonObject jsonValue;
        for (Document document :valuesIterable) {
            jsonValue = (JsonObject) MongoAux.jsonParser.parse(document.toJson());
            String value =
                    "{\n" +
                            "\t\"timestamp\": "+jsonValue.get("timestamp").getAsJsonObject().get("$numberLong").getAsLong()+",\n" +
                            "\t\"value\": \""+jsonValue.get("value").getAsString()+"\",\n" +
                            "\t\"latitude\": "+jsonValue.get("latitude").getAsDouble()+",\n" +
                            "\t\"longitude\": "+jsonValue.get("longitude").getAsDouble()+"\n" +
                            "}";
            valuesList.add(value);
        }

        response.status(HttpsURLConnection.HTTP_OK);
        if (end != compass || start != 0) {
            return "{\n" +
                    "\t\"stream_name\": \""+request.queryParams("stream")+"\",\n" +
                    "\t\"start\": "+start+",\n" +
                    "\t\"end\": "+end+",\n" +
                    "\t\"size\": "+size+",\n" +
                    "\t\"total\": "+total+",\n" +
                    "\t\"values\": "+valuesList.toString()+"\n" +
                    "}";
        }
        return "{\n" +
                "\t\"stream_name\": \""+request.queryParams("stream")+"\",\n" +
                "\t\"total\": "+total+",\n" +
                "\t\"values\": "+valuesList.toString()+"\n" +
                "}";
    }

    // Status - Passing
    public static String postValue(Request request, Response response) throws JSONException {
        logger.info("Posting values");
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
                        "\t\"timestamp\": "+timestamp+",\n" +
                        "\t\"latitude\": "+lat+",\n" +
                        "\t\"longitude\": "+longitude+"\n" +
                        "}";
        String topic = "Values";
        producer.produce(topic, "key", valuePost);
        response.status(HttpsURLConnection.HTTP_NO_CONTENT);
        return "";
    }
}
