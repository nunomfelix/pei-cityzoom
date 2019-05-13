package API.Routes;

import API.Aux.MongoAux;
import com.mongodb.client.FindIterable;
import org.bson.Document;
import spark.Request;
import spark.Response;

import javax.net.ssl.HttpsURLConnection;
import java.util.Date;

import static API.DataLayerAPI.*;
import static com.mongodb.client.model.Filters.*;

public class Alerts {

    private static Date date = new Date();

    public static String getAlert (Request request, Response response) {
        response.type("application/json");
        if (request.queryParams("stream") == null) {
            response.status(HttpsURLConnection.HTTP_NOT_ACCEPTABLE);
            return "{\n" +
                    "\t\"Error\": \"No stream specified\"\n" +
                    "}";
        } else if (streams.find(eq("stream", request.queryParams("stream"))).first() == null) {
            response.status(HttpsURLConnection.HTTP_NOT_FOUND);
            return "{\n" +
                    "\t\"Error\": \"Stream "+ request.queryParams("stream")+" not found\"\n" +
                    "}";
        }

    }

    public static String postAlert (Request request, Response response) {
        response.type("application/json");
    }

    public static String putAlert (Request request, Response response) {
        response.type("application/json");
    }

    public static String deleteAlert (Request request, Response response) {
        response.type("application/json");
    }

    public static String patchAlert (Request request, Response response) {
        response.type("application/json");
    }
}