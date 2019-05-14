package API.Routes;

import API.Aux.MongoAux;
import com.google.gson.JsonObject;
import com.mongodb.client.FindIterable;
import org.bson.Document;
import org.json.JSONException;
import spark.Request;
import spark.Response;
import org.bson.types.ObjectId;

import javax.net.ssl.HttpsURLConnection;
import java.util.*;

import static API.DataLayerAPI.*;
import static com.mongodb.client.model.Filters.*;


public class Streams {
    private static List<String> types = Arrays.asList("TemperatureOut", "CO", "CH4", "NH3", "Pressure", "Humidity", "Altitude", "TemperatureIn",
            "UvIndex", "CO2", "Sound", "WindSpeed", "WindDirection", "Lux", "Precipitation", "Coordinates", "Velocity");
    private static Date date = new Date();

    // Status - Passing
    public static String createStream(Request request, Response response) throws JSONException {
        logger.info("Creating Stream Request");
        response.type("application/json");
        JsonObject body = (JsonObject) MongoAux.jsonParser.parse(request.body());
        String valid = validator.validateCreate(body);
        if (!valid.equals("")) {
            logger.error("Stream request failed because request");
            response.status(HttpsURLConnection.HTTP_BAD_REQUEST);
            return valid;
        }
        Set<String> keys = body.keySet();
        String stream = body.get("stream").getAsString();
        String type = body.get("type").getAsString();
        if (!types.contains(type)){
            logger.error("Stream request failed because type is wrong: " + body.get("type").getAsString());
            response.status(HttpsURLConnection.HTTP_CONFLICT);
            return "{\n" +
                    "\t\"status\": \"Error @ type\",\n" +
                    "\t\"Error\": \"Type " + type + " not available. Available types are "+types.toString()+"\"\n" +
                    "}";

        }
        String description = keys.contains("description") ? body.get("description").getAsString() : "";
        String device_id = body.get("device_id").getAsString();
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
                        "\t\"device_id\":\""+device_id+"\",\n" +
                        "\t\"type\":\""+type+"\",\n" +
                        "\t\"mobile\":"+mobile+",\n" +
                        "\t\"periodicity\": "+periodicity+",\n" +
                        "\t\"ttl\": "+ttl+"," +
                        "\t\"creation\": "+date.getTime()+",\n" +
                        "\t\"lastUpdate\": "+date.getTime()+"\n" +
                        "}";
        String topic = "Streams";
        producer.produce(topic, "chave_minima", produceRequest);
        logger.info("Stream sent to kafka");
        return "{\n" +
                "\t\"status\":\"Creation successful\",\n" +
                "\t\"stream_name\":\""+stream+"\",\n" +
                "\t\"account_name\":\"none\",\n" +
                "\t\"creation_time\":\""+date.getTime()+"\",\n" +
                "\t\"periodicity\":\""+periodicity+"\"\n" +
                "}";
    }

    // Status - Passing
    public static String deleteStream(Request request, Response response) {
        response.type("application/json");
        logger.info("Deleting stream");
        String to_del = request.params(":stream");
        if (streams.find(eq("stream", to_del)).first() == null) {
            response.status(HttpsURLConnection.HTTP_NOT_FOUND);
            return "{\n" +
                    "\t\"status\": \"Error\",\n" +
                    "\t\"Error\": \"Stream " + to_del + " not found.\"\n" +
                    "}";
        }
        streams.deleteOne(eq("stream", to_del));
        values.deleteMany(eq("stream_name", to_del));
        response.status(HttpsURLConnection.HTTP_NO_CONTENT);
        return "";
    }

    // Status - Passing
    public static String listStreams(Request request, Response response) {
        response.type("application/json");
        logger.info("Listing All streams");
        long start = request.queryParams("interval_start") != null ?
                Long.parseLong(request.queryParams("interval_start")) : 0;
        long end = request.queryParams("interval_end") != null?
                Long.parseLong(request.queryParams("interval_end")) : date.getTime();
        long compass = date.getTime();

        if (end < start || end > compass || start < 0) {
            response.status(HttpsURLConnection.HTTP_NOT_ACCEPTABLE);
            logger.error("Bad Interval");
            return "{\n" +
                    "\t\"Error\": \"Interval not acceptable\"\n" +
                    "}";
        }

        List<String> userStreams = new ArrayList<>();
        long size = streams.countDocuments(and(gte("creation", start), lte("creation", end)));
        long total = streams.countDocuments();
        FindIterable<Document> streamsIterable = streams.find(and(gte("creation", start), lte("creation", end)));
        JsonObject jsonStream;
        for (Document document : streamsIterable) {
            jsonStream = (JsonObject) MongoAux.jsonParser.parse(document.toJson());
            System.out.println(jsonStream.toString());
            String stream =
                    "{\n" +
                            "\t\"id\": \""+jsonStream.get("_id").getAsJsonObject().get("$oid").getAsString()+"\",\n" +
                            "\t\"stream\": \""+jsonStream.get("stream").getAsString()+"\",\n" +
                            "\t\"description\": \""+jsonStream.get("description").getAsString()+"\",\n" +
                            "\t\"device_id\": \""+jsonStream.get("device_id").getAsString()+"\",\n" +
                            "\t\"mobile\": "+jsonStream.get("mobile").getAsBoolean()+",\n" +
                            "\t\"type\": \""+jsonStream.get("type").getAsString()+"\",\n" +
                            "\t\"ttl\": "+jsonStream.get("ttl").getAsInt()+",\n" +
                            "\t\"periodicity\": "+jsonStream.get("periodicity").getAsInt()+",\n" +
                            "\t\"creation\": "+jsonStream.get("creation").getAsJsonObject().get("$numberLong").getAsLong()+",\n" +
                            "\t\"lastUpdate\": "+jsonStream.get("lastUpdate").getAsJsonObject().get("$numberLong").getAsLong()+"\n" +
                            "}";
            userStreams.add(stream);
        }
        response.status(HttpsURLConnection.HTTP_OK);
        if (end != compass || start != 0) {
            return "{\n" +
                    "\t\"total_streams\": "+total+",\n" +
                    "\t\"size\": "+size+",\n" +
                    "\t\"start\": "+start+",\n" +
                    "\t\"end\": "+end+",\n" +
                    "\t\"user_streams\": "+userStreams.toString()+"\n" +
                    "}";
        }
        return "{\n" +
                "\t\"total_streams\": "+total+",\n" +
                "\t\"user_streams\": "+userStreams.toString()+"\n" +
                "}";
    }

    // Status - Passing
    public static String detailStream(Request request, Response response) {
        logger.info("Detailing Stream");
        response.type("application/json");
        String stream = request.params(":stream");
        Document document = streams.find(eq("_id",new ObjectId(stream))).first();
        if (document == null) {
            response.status(HttpsURLConnection.HTTP_NOT_FOUND);
            logger.error("Stream not found");
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
                "\t\"device_id\": \""+jsonStream.get("device_id").getAsString()+"\",\n" +
                "\t\"mobile\": "+jsonStream.get("mobile").getAsBoolean()+",\n" +
                "\t\"type\": \""+jsonStream.get("type").getAsString()+"\",\n" +
                "\t\"ttl\": "+jsonStream.get("ttl").getAsInt()+",\n" +
                "\t\"periodicity\": "+jsonStream.get("periodicity").getAsInt()+",\n" +
                "\t\"creation\": "+jsonStream.get("creation").getAsJsonObject().get("$numberLong").getAsLong()+",\n" +
                "\t\"lastUpdate\": "+jsonStream.get("lastUpdate").getAsJsonObject().get("$numberLong").getAsLong()+"\n" +
                "}";
    }
}
