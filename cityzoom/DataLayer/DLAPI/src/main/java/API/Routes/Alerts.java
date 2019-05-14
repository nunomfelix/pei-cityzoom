package API.Routes;

import API.Aux.MongoAux;
import com.google.gson.JsonObject;
import com.mongodb.client.FindIterable;
import org.bson.Document;
import spark.Request;
import spark.Response;

import javax.net.ssl.HttpsURLConnection;
import java.util.*;

import static API.DataLayerAPI.*;
import static com.mongodb.client.model.Filters.*;

public class Alerts {

    private static Date date = new Date();

    public static String getAlert (Request request, Response response) {
        response.type("application/json");

        String alert_id = request.params(":alert_id");
        Document alert = alerts.find(eq("alert_id", alert_id)).first();
        if(alert == null){
            response.status(HttpsURLConnection.HTTP_NOT_FOUND);
            return "{\n" +
                    "\t\"state\": " +false+ "\n" +
                    "}"
        }
        
        response.status(HttpsURLConnection.HTTP_OK);
        jsonStream = (JsonObject) MongoAux.jsonParser.parse(alert.toJson());
        return "{\n" +
            "\t\"alert_ID\": \""+ alert_id +"\",\n" +
            "\t\"alert_name\": \""+jsonStream.get("alert_name").getAsString()+"\",\n" +
            "\t\"created_at\": \""+jsonStream.get("created_at").getAsString()+"\",\n" +
            "\t\"stream\": \""+jsonStream.get("stream").getAsString()+"\",\n" +
            "\t\"threshold\": "+jsonStream.get("threshold").getAsString()+",\n" +
            "\t\"type\": \""+jsonStream.get("type").getAsString()+"\",\n" +
            "\t\"level\": "+jsonStream.get("level").getAsString()+",\n" +
            "\t\"description\": "+jsonStream.get("description").getAsString()+",\n" +
            "\t\"state\": "+jsonStream.get("state").getAsBoolean()+",\n" +
            "}";

    }

    public static String listAlerts(Request request, Response response) {
        response.type("application/json");

        long start = request.queryParams("interval_start") != null ?
            Long.parseLong(request.queryParams("interval_start")) : 0;
        long end = request.queryParams("interval_end") != null?
            Long.parseLong(request.queryParams("interval_end")) : date.getTime();

        long total = alerts.countDocuments();
        long size = alerts.countDocuments(and(gte("start", start), lte("end", end)));

        List<String> userAlerts = new ArrayList<>;
        FindIterable<Document> iterableAlerts = alerts.find(and(gte("start", start), lte("end", end)));
        JsonObject jsonStream;
        for(Document doc : iterableAlerts){
            jsonStream = (JsonObject) MongoAux.jsonParser.parse(doc.toJson());
            String alert = "{\n" +
                    "\t\"alert_ID\": \""+jsonStream.get("alert_ID").getAsString()+"\",\n" +
                    "\t\"alert_name\": \""+jsonStream.get("alert_name").getAsString()+"\",\n" +
                    "\t\"created_at\": \""+jsonStream.get("created_at").getAsString()+"\",\n" +
                    "\t\"stream\": \""+jsonStream.get("stream").getAsString()+"\",\n" +
                    "\t\"threshold\": "+jsonStream.get("threshold").getAsString()+",\n" +
                    "\t\"type\": \""+jsonStream.get("type").getAsString()+"\",\n" +
                    "\t\"level\": "+jsonStream.get("level").getAsString()+",\n" +
                    "\t\"description\": "+jsonStream.get("description").getAsString()+",\n" +
                    "\t\"state\": "+jsonStream.get("state").getAsBoolean()+",\n" +
                    "}";
            userAlerts.add(alert);
        }
        response.status(HttpsURLConnection.HTTP_OK);
        return "{\n" +
            "\t\"total_alerts\": "+total+",\n" +
            "\t\"size\": "+size+"\n" +
            "\t\"start\": "+start+"\n" +
            "\t\"end\": "+end+"\n" +
            "\t\"user_alerts\": "+userAlerts.toString()+"\n" +
            "}";
    }

    public static String listStreamAlerts (Request request, Reponse response) {
        repose.type("application/json");

        String stream_name = request.params(":stream_name");
        Document stream = streams.find(eq("stream_name", stream_name)).first();
        if(stream == null) {
            response.status(HttpsURLConnection.HTTP_BAD_REQUEST);
            return "{\n" +
                    "\t\"state\": " +false+ "\n" +
                    "}"
        }

        List<String> streamAlerts = new ArrayList<>;
        FindIterable<Document> iterableAlerts = alerts.find(eq("stream", stream_name));
        JsonObject jsonStream;
        for(Document doc : iterableAlerts){
            jsonStream = (JsonObject) MongoAux.jsonParser.parse(doc.toJson());
            String alert = "{\n" +
                    "\t\"alert_ID\": \""+jsonStream.get("alert_ID").getAsString()+"\",\n" +
                    "\t\"alert_name\": \""+jsonStream.get("alert_name").getAsString()+"\",\n" +
                    "\t\"created_at\": \""+jsonStream.get("created_at").getAsString()+"\",\n" +
                    "\t\"stream\": \""+jsonStream.get("stream").getAsString()+"\",\n" +
                    "\t\"threshold\": "+jsonStream.get("threshold").getAsString()+",\n" +
                    "\t\"type\": \""+jsonStream.get("type").getAsString()+"\",\n" +
                    "\t\"level\": "+jsonStream.get("level").getAsString()+",\n" +
                    "\t\"description\": "+jsonStream.get("description").getAsString()+",\n" +
                    "\t\"state\": "+jsonStream.get("state").getAsBoolean()+",\n" +
                    "}";
            streamAlerts.add(alert);
        }
        response.status(HttpsURLConnection.HTTP_OK);
        return "{\n" +
            "\t\"total_alerts\": "+streamAlerts.size()+",\n" +          
            "\t\"stream_alerts\": "+streamAlerts.toString()+"\n" +
            "}";
    }

    public static String postAlert (Request request, Response response) {
        response.type("application/json");
    }

    public static String putAlert (Request request, Response response) {
        response.type("application/json");
    }

    public static String deleteAlert (Request request, Response response) {
        response.type("application/json");
        String alert_id = request.params(":alert_id");
        if(alerts.find(eq("alert_id", alert_id)).first() == null){
            response.status(HttpsURLConnection.HTTP_NOT_FOUND);
            return "";
        }

        alerts.deleteOne(find(eq("alert_id", alert_id)));
        response.status(HttpsURLConnection.HTTP_NO_CONTENT);
        return "";
    }

    public static String patchAlert (Request request, Response response) {
        response.type("application/json");
    }
}