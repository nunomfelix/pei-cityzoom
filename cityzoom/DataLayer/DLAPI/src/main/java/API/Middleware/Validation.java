package API.Middleware;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.lang.reflect.Array;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Validation {
    private Map<String, Object> createStreamRequiredFields = new HashMap<>();
    private Map<String, Object> createStreamAllowedFields = new HashMap<>();
    private Map<String, Object> pushValuesRequiredFields = new HashMap<>();
    private Map<String, Object> pushValuesAllowedFields = new HashMap<>();
    private Map<String, Object> createDeviceRequiredFields = new HashMap<>();
    private Map<String, Object> createDeviceAllowedFields = new HashMap<>();

    public Validation() {
        // required fields for create stream
        this.createStreamRequiredFields.put("stream", String.class);
        this.createStreamRequiredFields.put("device_id", String.class);

        // allowed fields for create stream
        this.createStreamAllowedFields.put("stream", String.class);
        this.createStreamAllowedFields.put("device_id", String.class);
        this.createStreamAllowedFields.put("description", String.class);
        this.createStreamAllowedFields.put("ttl", Integer.class);
        this.createStreamAllowedFields.put("periodicity", Integer.class);

        // required fields for push values
        this.pushValuesRequiredFields.put("stream_name", String.class);
        this.pushValuesRequiredFields.put("value", String.class);

        // allowed fields for push values
        this.pushValuesAllowedFields.put("stream_name", String.class);
        this.pushValuesAllowedFields.put("value", String.class);
        this.pushValuesAllowedFields.put("timestamp", Long.class);
        this.pushValuesAllowedFields.put("latitude", Double.class);
        this.pushValuesAllowedFields.put("longitude", Double.class);

        // required fields for createDevice
        this.createDeviceRequiredFields.put("device_name", String.class);
        this.createDeviceRequiredFields.put("mobile", Boolean.class);
        this.createDeviceRequiredFields.put("vertical", JSONArray.class);
        this.createDeviceRequiredFields.put("provider", String.class);

        // allowed fields for createDevice
        this.createDeviceAllowedFields.put("device_name", String.class);
        this.createDeviceAllowedFields.put("mobile", Boolean.class);
        this.createDeviceAllowedFields.put("vertical", JSONArray.class);
        this.createDeviceAllowedFields.put("description", String.class);
        this.createDeviceAllowedFields.put("latitude", Double.class);
        this.createDeviceAllowedFields.put("longitude", Double.class);
        this.createDeviceAllowedFields.put("provider", String.class);

    }

    public String validateCreate(JsonObject body) throws JSONException {
        JSONObject trial = new JSONObject(body.toString());
        for (String key : body.keySet()) {
            Object val = trial.get(key);
            if(!createStreamAllowedFields.keySet().contains(key)) {
                return "{\n" +
                        "\t\"Status\": \"Error @ request\"\n" +
                        "\t\"Error\": \"Invalid field: \""+key+"\" \"\n" +
                        "}";
            } else if (!val.getClass().equals(createStreamAllowedFields.get(key))) {
                return "{\n" +
                        "\t\"Status\": \"Error @ request\"\n" +
                        "\t\"Error\": \"Invalid type in field: \""+key+"\" \"\n" +
                        "}";
            }
        }
        if (!body.keySet().containsAll(createStreamRequiredFields.keySet())) {
            return "{\n" +
                    "\t\"Status\": \"Error @ request\"\n" +
                    "\t\"Error\": \"Field(s) \"stream\" and/or \"type\" and/or \"device_id\" not found\"\n" +
                    "}";
        } else if (body.keySet().size() > 6){
            return "{\n" +
                    "\t\"Status\": \"Error @ request\"\n" +
                    "\t\"Error\": \"Too many fields\"\n" +
                    "}";
        } else {
            return "";
        }
    }

    public String validatePushValues(JsonObject body) throws JSONException {
        JSONObject trial = new JSONObject(body.toString());
        for (String key : body.keySet()) {
            Object val = trial.get(key);
            if (!pushValuesAllowedFields.keySet().contains(key)) {
                return "{\n" +
                        "\t\"Status\": \"Error @ request\"\n" +
                        "\t\"Error\": \"Invalid field: \""+key+"\" \"\n" +
                        "}";
            } else if (!val.getClass().equals(pushValuesAllowedFields.get(key))) {
                return "{\n" +
                        "\t\"Status\": \"Error @ request\"\n" +
                        "\t\"Error\": \"Invalid type in field: \""+key+"\" \"\n" +
                        "}";
            }
        }
        if (!body.keySet().containsAll(pushValuesRequiredFields.keySet())) {
            return "{\n" +
                    "\t\"Status\": \"Error @ request\"\n" +
                    "\t\"Error\": \"Required fields not found\"\n" +
                    "}";
        } else if (body.keySet().size() > 5){
            return "{\n" +
                    "\t\"Status\": \"Error @ request\"\n" +
                    "\t\"Error\": \"Too many fields\"\n" +
                    "}";
        } else {
            return "";
        }
    }

    public String validateCreateDevice(JsonObject body) throws JSONException {
        JSONObject trial = new JSONObject(body.toString());
        for (String key : body.keySet()) {
            Object val = trial.get(key);
            if (!createDeviceAllowedFields.keySet().contains(key)) {
                return "{\n" +
                        "\t\"Status\": \"Error @ request\",\n" +
                        "\t\"Error\": \"Invalid field: \""+key+"\"\"\n" +
                        "}";
            } else if (!val.getClass().equals(createDeviceAllowedFields.get(key))) {
                System.out.println(val.getClass());
                return "{\n" +
                        "\t\"Status\": \"Error @ request\",\n" +
                        "\t\"Error\": \"Invalid type in field: "+key+"\",\n" +
                        "\t\"Err\": \""+body.get("vertical").getAsJsonArray()+"\"\n"+
                        "}";
            }
        }
        if (!body.keySet().containsAll(createDeviceRequiredFields.keySet())) {
            return "{\n" +
                    "\t\"Status\": \"Error @ request\",\n" +
                    "\t\"Error\": \"Required fields not found\"\n"+
                    "}";
        } else if (!body.get("mobile").getAsBoolean() && (!body.keySet().contains("latitude") || !body.keySet().contains("longitude"))) {
            return "{\n" +
                    "\t\"Status\": \"Error @ request\",\n" +
                    "\t\"Error\": \"No location given for not-mobile device\"\n" +
                    "}";
        } else if (body.keySet().size() > 7){
            return "{\n" +
                    "\t\"Status\": \"Error @ request\",\n" +
                    "\t\"Error\": \"Too many fields\"\n" +
                    "}";
        } else {
            return "";
        }
    }
}
