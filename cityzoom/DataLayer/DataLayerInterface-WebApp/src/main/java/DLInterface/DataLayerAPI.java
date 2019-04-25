package DLInterface;

import DLBroker.MongoAux;
import DLBroker.Producer;
import DLInterface.Middleware.Validation;
import DLInterface.Routes.Streams;
import DLInterface.Routes.Values;
import com.mongodb.client.MongoCollection;
import org.bson.Document;

import static spark.Spark.*;

public class DataLayerAPI {

    public static Producer producer = new Producer();
    public static Validation validator = new Validation();
    public static MongoCollection<Document> streams = MongoAux.getCollection("streams");
    public static MongoCollection<Document> values = MongoAux.getCollection("values");

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
