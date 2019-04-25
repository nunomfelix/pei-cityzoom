package DLInterface;

import DLBroker.MongoAux;
import DLBroker.Producer;
import DLInterface.Middleware.Validation;
import DLInterface.Routes.Streams;
import DLInterface.Routes.Values;
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
    private static List<String> types = Arrays.asList("temperature", "oxygen");
    private static Date date = new Date();

    public static void main(String[] args) {

        // server configurations
        port(8001);

        // routes
        path("/czb", () -> {
            // stream routes and paths
            post("/stream", Streams::createStream);
            path("/stream", () -> {
                get("/list", Streams::listStreams);
                get("/:stream", Streams::detailStream);
                delete("/:stream", Streams::deleteStream);
            });

            // values routes and paths
            get("/values",  Values::getValues);
            post("/values", Values::postValue);
        });
    }
}
