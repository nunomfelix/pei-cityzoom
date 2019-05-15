package API.Routes;

import API.Aux.MongoAux;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.mongodb.client.FindIterable;
import org.bson.Document;
import org.json.JSONException;
import spark.Request;
import spark.Response;

import javax.net.ssl.HttpsURLConnection;
import java.util.*;

import static API.DataLayerAPI.*;
import static com.mongodb.client.model.Filters.*;

public class Devices {
    private static Date date = new Date();

    // Status - Passing
    public static String createDevice(Request request, Response response) throws JSONException {
        logger.info("Creating Device Request");
        response.type("application/json");
        JsonObject body = (JsonObject) MongoAux.jsonParser.parse(request.body());
        String valid = validator.validateCreateDevice(body);
        if (!valid.equals("")) {
            logger.error("Error Creating Device");
            response.status(HttpsURLConnection.HTTP_BAD_REQUEST);
            return valid;
        }
        Set<String> keys = body.keySet();
        String device_name = body.get("device_name").getAsString();
        String provider = body.get("provider").getAsString();
        JsonArray vertical = body.get("vertical").getAsJsonArray();
        boolean mobile = body.get("mobile").getAsBoolean();
        double latitude = 0;
        double longitude = 0;
        if (!mobile) {
            latitude = body.get("latitude").getAsDouble();
            longitude = body.get("longitude").getAsDouble();
        }
        /*if (!types.contains(type)){
            response.status(HttpsURLConnection.HTTP_CONFLICT);
            return "{\n" +
                    "\t\"status\": \"Error @ type\",\n" +
                    "\t\"Error\": \"Type " + type + " not available. Available types are "+types.toString()+"\"\n" +
                    "}";

        }*/
        String description = keys.contains("description") ? body.get("description").getAsString() : "";
        String municipal = keys.contains("municipality") ? body.get("municipality").getAsString() : "";
        String produceRequest =
                "{\n" +
                        "\t\"device_name\":\""+device_name+"\",\n" +
                        "\t\"description\":\""+description+"\",\n" +
                        "\t\"provider\":\""+provider+"\",\n" +
                        "\t\"vertical\":"+vertical+",\n" +
                        "\t\"mobile\":"+mobile+",\n" +
                        "\t\"municipality\":\""+municipal+"\",\n" +
                        "\t\"latitude\": "+latitude+",\n"+
                        "\t\"longitude\": "+longitude+",\n"+
                        "\t\"creation\": "+date.getTime()+"\n" +
                        "}";
        String topic = "Devices";
        producer.produce(topic, "chave_minima", produceRequest);
        logger.info("Device sent to kafka");
        return "{\n" +
                "\t\"status\":\"Creation successful\",\n" +
                "\t\"device_name\":\""+device_name+"\",\n" +
                "\t\"account_name\":\"none\",\n" +
                "\t\"creation_time\":\""+date.getTime()+"\",\n" +
                "\t\"mobile\":\""+mobile+"\"\n" +
                "}";
    }

    // Status - Passing
    public static String deleteDevice(Request request, Response response) {
        logger.info("Deleting device");
        response.type("application/json");
        String to_del = request.params(":device_id");
        if (devices.find(eq("device_name", to_del)).first() == null) {
            response.status(HttpsURLConnection.HTTP_NOT_FOUND);
            return "{\n" +
                    "\t\"status\": \"Error\",\n" +
                    "\t\"Error\": \"Stream " + to_del + " not found.\"\n" +
                    "}";
        }
        devices.deleteOne(eq("device_id", to_del));
        FindIterable<Document> streamsToDel = streams.find(eq("device_id", to_del));
        streams.deleteMany(eq("device_id", to_del));
        for (Document d : streamsToDel) {
            values.deleteMany(eq("stream_name", d.getString("stream")));
        }
        response.status(HttpsURLConnection.HTTP_NO_CONTENT);
        return "";
    }

    // Status - Passing
    public static String listDevices(Request request, Response response) {
        logger.info("Listing all devices");
        response.type("application/json");
        long start = request.queryParams("interval_start") != null ?
                Long.parseLong(request.queryParams("interval_start")) : 0;
        long end = request.queryParams("interval_end") != null?
                Long.parseLong(request.queryParams("interval_end")) : date.getTime();
        long compass = date.getTime();

        if (end < start || end > compass || start < 0) {
            logger.error("Bad time interval");
            response.status(HttpsURLConnection.HTTP_NOT_ACCEPTABLE);
            return "{\n" +
                    "\t\"Error\": \"Interval not acceptable\"\n" +
                    "}";
        }

        List<String> userDevices = new ArrayList<>();
        long size = devices.countDocuments(and(gte("creation", start), lte("creation", end)));
        long total = devices.countDocuments();
        FindIterable<Document> streamsIterable = devices.find(and(gte("creation", start), lte("creation", end)));
        JsonObject jsonDev;
        for (Document document : streamsIterable) {
            jsonDev = (JsonObject) MongoAux.jsonParser.parse(document.toJson());

            FindIterable<Document> streamDocs = streams.find(eq("device_id", jsonDev.get("_id").getAsJsonObject().get("$oid").getAsString()));
            ArrayList<String> streamList = new ArrayList<>();
            for (Document doc : streamDocs) {
                JsonObject jsonStream = (JsonObject) MongoAux.jsonParser.parse(doc.toJson());
                streamList.add(jsonStream.get("_id").getAsJsonObject().get("$oid").getAsString());
            }

            System.out.println(jsonDev.toString());
            String device =
                    "{\n" +
                            "\t\"device_id\": \""+jsonDev.get("_id").getAsJsonObject().get("$oid").getAsString()+"\",\n" +
                            "\t\"mobile\": "+jsonDev.get("mobile").getAsBoolean()+",\n" +
                            "\t\"municipality\": \""+jsonDev.get("municipality").getAsString()+"\",\n" +
                            "\t\"vertical\": "+jsonDev.get("vertical").getAsJsonArray()+",\n" +
                            "\t\"provider\": \""+jsonDev.get("provider").getAsString()+"\",\n" +
                            "\t\"streams\": "+ Arrays.toString(streamList.toArray()) +",\n" +
                            "\t\"device_name\": \""+jsonDev.get("device_name").getAsString()+"\",\n" +
                            "\t\"description\": \""+jsonDev.get("description").getAsString()+"\",\n" +
                            "\t\"locations\": "+jsonDev.get("locations").getAsJsonArray()+",\n"+
                            "\t\"creation\": "+jsonDev.get("creation").getAsJsonObject().get("$numberLong").getAsLong()+"\n" +
                            "}";
            userDevices.add(device);
        }
        response.status(HttpsURLConnection.HTTP_OK);
        if (end != compass || start != 0) {
            return "{\n" +
                    "\t\"total_devices\": "+total+",\n" +
                    "\t\"size\": "+size+",\n" +
                    "\t\"start\": "+start+",\n" +
                    "\t\"end\": "+end+",\n" +
                    "\t\"user_devices\": "+userDevices.toString()+"\n" +
                    "}";
        }
        return "{\n" +
                "\t\"total_devices\": "+total+",\n" +
                "\t\"user_devices\": "+userDevices.toString()+"\n" +
                "}";
    }

    // Status - Passing
    public static String detailDevice(Request request, Response response) {
        logger.info("Detailing a device");
        response.type("application/json");
        String device = request.params(":device_id");
        Document document = devices.find(eq("device_name",device)).first();
        if (document == null) {
            logger.error("Device not found");
            response.status(HttpsURLConnection.HTTP_NOT_FOUND);
            return "{\n" +
                    "\t\"status\": \"Error\",\n" +
                    "\t\"Error\": \"Device " + device + " not found.\"\n" +
                    "}";
        }
        FindIterable<Document> streamDocs = streams.find(eq("device_id", device));
        ArrayList<String> streamList = new ArrayList<>();
        for (Document doc : streamDocs) {
            JsonObject jsonStream = (JsonObject) MongoAux.jsonParser.parse(doc.toJson());
            streamList.add(jsonStream.get("_id").getAsJsonObject().get("$oid").getAsString());
        }
        response.status(200);
        JsonObject jsonDev = (JsonObject) MongoAux.jsonParser.parse(document.toJson());
        return "{\n" +
                "\t\"device_id\": \""+jsonDev.get("_id").getAsJsonObject().get("$oid").getAsString()+"\",\n" +
                "\t\"mobile\": "+jsonDev.get("mobile").getAsBoolean()+",\n" +
                "\t\"municipality\": \""+jsonDev.get("municipality").getAsString()+"\",\n" +
                "\t\"vertical\": "+jsonDev.get("vertical").getAsJsonArray()+",\n" +
                "\t\"provider\": \""+jsonDev.get("provider").getAsString()+"\",\n" +
                "\t\"streams\": "+ Arrays.toString(streamList.toArray()) +",\n" +
                "\t\"device_name\": \""+jsonDev.get("device_name").getAsString()+"\",\n" +
                "\t\"description\": \""+jsonDev.get("description").getAsString()+"\",\n" +
                "\t\"locations\": "+jsonDev.get("locations").getAsJsonArray()+",\n"+
                "\t\"creation\": "+jsonDev.get("creation").getAsJsonObject().get("$numberLong").getAsLong()+"\n" +
                "}";
    }
}
