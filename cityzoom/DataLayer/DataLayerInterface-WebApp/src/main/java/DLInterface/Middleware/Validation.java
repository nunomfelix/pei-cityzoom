package DLInterface.Middleware;

import com.google.gson.JsonObject;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Validation {
    private Map<String, Object> createStreamRequiredFields = new HashMap<>();
    private Map<String, Object> createStreamAllowedFields = new HashMap<>();
    private List<String> pushValuesRequiredFields = Arrays.asList(new String[]{"stream_name", "values", "latitude","longitude"});
    private List<String> deleteStreamRequiredFields = Arrays.asList(new String[]{"stream_name"});

    public Validation() {
        // required for create stream
        this.createStreamRequiredFields.put("stream", String.class);
        this.createStreamRequiredFields.put("type", String.class);

        // allowed for create stream
        this.createStreamAllowedFields.put("stream", String.class);
        this.createStreamAllowedFields.put("type", String.class);
        this.createStreamAllowedFields.put("description", String.class);
        this.createStreamAllowedFields.put("mobile", Boolean.class);
        this.createStreamAllowedFields.put("ttl", Integer.class);
        this.createStreamAllowedFields.put("periodicity", Integer.class);
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
                    "\t\"Error\": \"Field(s) \"stream\" and/or \"type\" not found\"\n" +
                    "}";
        }
        else if (body.keySet().size() > 6){
            return "{\n" +
                    "\t\"Status\": \"Error @ request\"\n" +
                    "\t\"Error\": \"Too many fields\"\n" +
                    "}";
        }
        else {
            return "";
        }
    }
}
