package Aux;

import com.fasterxml.jackson.annotation.JsonFormat;
import org.codehaus.jackson.map.ObjectMapper;
import org.geojson.Feature;
import org.geojson.FeatureCollection;
import org.geojson.GeoJsonObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Scanner;

public class GeoJS {
    public static void main(String[] args) throws IOException {
        InputStream inputStream = new FileInputStream("ValuesSinks/src/portugal_municipios.geojson");
        GeoJsonObject geoJsonObject = new ObjectMapper().readValue(inputStream, FeatureCollection.class);
        System.out.println(geoJsonObject instanceof JsonFormat.Features);

    }
}
