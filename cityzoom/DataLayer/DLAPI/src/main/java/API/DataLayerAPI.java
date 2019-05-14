package API;

import API.Aux.MongoAux;
import API.Middleware.Validation;
import API.Routes.Devices;
import API.Routes.Streams;
import API.Routes.Values;
import API.Routes.Alerts;
import API.Sinks.BackendSink;
import com.mongodb.client.MongoCollection;
import org.bson.Document;
import spark.Request;
import spark.Response;

import static spark.Spark.*;

public class DataLayerAPI {
    public static BackendSink producer = new BackendSink();
    public static Validation validator = new Validation();
    public static MongoCollection<Document> streams = MongoAux.getCollection("streams");
    public static MongoCollection<Document> values = MongoAux.getCollection("values");
    public static MongoCollection<Document> devices = MongoAux.getCollection("devices");
    public static MongoCollection<Document> alerts = MongoAux.getCollection("alerts");

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

            // alerts routes and paths
            path("/alert", () -> {
                get("/:alert_id", Alerts::getAlert);
                patch("/:id", Alerts::patchAlert);
                put("/:id", Alerts::putAlert);
                delete("/:id", Alerts::deleteAlert);
            });
            get("/alerts", (Request req, Response res) -> { return "o"; });
            post("/alerts", (Request req, Response res) -> { return "o"; });
            put("/alerts", (Request req, Response res) -> { return "o"; });

            // devices routes and paths
            post("/devices", Devices::createDevice);
            get("/devices", Devices::listDevices);
            path("/device", () -> {
                delete(":/device_id", Devices::deleteDevice);
                get("/:device_id", Devices::detailDevice);
            });
            get("/alerts/list", Alerts::listAlerts);
            post("/alerts", Alerts::postAlert);
            put("/alerts", Alerts::putAlert);
        });
    }
}
