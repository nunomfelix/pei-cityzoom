package Aux;

import org.codehaus.jackson.map.ObjectMapper;
import org.geojson.Feature;
import org.geojson.GeoJsonObject;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

public class GeoJS {
    public static void main(String[] args) throws IOException {
        File file = new File(new GeoJS().getClass().getClassLoader().getResource("portugal_municipios.geojson").getFile());
        InputStream inputStream = new GeoJS().getClass().getClassLoader().getResourceAsStream("portugal_municipios.geojson");
        System.out.println(inputStream.getClass());
        GeoJsonObject object = new ObjectMapper().readValue(inputStream, GeoJsonObject.class);
        System.out.println(object instanceof Feature);
    }

}
