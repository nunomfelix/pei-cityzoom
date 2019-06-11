package com.example.cityzoomapp;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.BatteryManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.provider.Settings;
import android.support.design.widget.NavigationView;
import android.support.v4.app.ActivityCompat;
import android.support.v4.view.GravityCompat;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class MainActivity extends AppCompatActivity
        implements NavigationView.OnNavigationItemSelectedListener {

    /* Endpoints to where the data will be sent */
    final String IP_ADDRESS = "193.136.93.14"; //IT CITYZOOM SERVER
    //final String IP_ADDRESS = "192.168.50.100"; //FELIX IP
    //final String IP_ADDRESS = "192.168.43.106"; //MOURATO IP
    final String USERNAME = "superuser";
    final String PASSWORD = "12345";
    String URL_LOGIN = "http://"+IP_ADDRESS+":8002/user/login";
    String URL_POST = "http://"+IP_ADDRESS+":8002/mobileapp/values";

    int proximityValue;
    int batteryValue;
    String longitudeValue;
    String latitudeValue;

    Sensor proximitySensor;
    TextView proximityText;
    TextView batteryTxt;
    int PERIOD = 1000; //in ms
    boolean sendingData = false;
    Thread waitingForCancel = null;
    //Sensors
    Sensor pressureSensor = null;
    SensorManager sensorManager;
    //Screen Brightness
    int brightness;
    TextView brightnessText;
    Handler updateUIHandler = null;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        //Toolbar toolbar = findViewById(R.id.toolbar);
        //setSupportActionBar(toolbar);
        DrawerLayout drawer = findViewById(R.id.drawer_layout);
        NavigationView navigationView = findViewById(R.id.nav_view);
        //ActionBarDrawerToggle toggle = new ActionBarDrawerToggle(
        //        this, drawer, toolbar, R.string.navigation_drawer_open, R.string.navigation_drawer_close);
        //drawer.addDrawerListener(toggle);
        //toggle.syncState();
        navigationView.setNavigationItemSelectedListener(this);

        //Sensor manager
        sensorManager =
                (SensorManager) getSystemService(SENSOR_SERVICE);

        //Proximity
        proximitySensor =
                sensorManager.getDefaultSensor(Sensor.TYPE_PROXIMITY);
        if (proximitySensor == null) {
            Log.e("app", "Proximity sensor not available.");
            finish(); // Close app
        }
        proximityText = findViewById(R.id.proximityValue);

        // Create listener
        SensorEventListener proximitySensorListener = new SensorEventListener() {
            @Override
            public void onSensorChanged(SensorEvent sensorEvent) {
                if (sensorEvent.values[0] < proximitySensor.getMaximumRange()) {
                    proximityText.setBackgroundColor(Color.RED);
                    proximityValue = 1;
                    //proximityText.setText("Somethings is close");
                } else {
                    proximityText.setBackgroundColor(Color.GREEN);
                    proximityValue = 0;
                    //proximityText.setText("Nothing is close");
                }
            }

            @Override
            public void onAccuracyChanged(Sensor sensor, int i) {
            }
        };
        // Register it, specifying the polling interval in
        // microseconds
        sensorManager.registerListener(proximitySensorListener,
                proximitySensor, 2 * 1000 * 1000);

        //Battery
        batteryTxt = (TextView) this.findViewById(R.id.batteryTxt);
        this.registerReceiver(this.mBatInfoReceiver, new IntentFilter(Intent.ACTION_BATTERY_CHANGED));

        //Coordinates
        LocationManager locationManager = (LocationManager)
                getSystemService(Context.LOCATION_SERVICE);
        LocationListener locationListener = new MyLocationListener();
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            Log.d("app","No permission for location");
            ActivityCompat.requestPermissions(this, new String[]{android.Manifest.permission.ACCESS_FINE_LOCATION, android.Manifest.permission.ACCESS_COARSE_LOCATION}, 101);
        }
        locationManager.requestLocationUpdates(
                LocationManager.GPS_PROVIDER, 100, 0, locationListener);
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.INTERNET) != PackageManager.PERMISSION_GRANTED) {
            Log.d("app","No permission for internet");
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.INTERNET}, 101);
        }
        //Button
        final Button clickButton = (Button) findViewById(R.id.sendButton);
        clickButton.setOnClickListener( new View.OnClickListener() {

            @Override
            public void onClick(View v) {
                if(!sendingData) {
                    sendingData = true;
                    clickButton.setText("STOP");
                    clickButton.setBackgroundColor(Color.RED);
                   //Launches new thread that waits for the cancel
                    waitingForCancel = new Thread(){
                        @Override
                        public void run(){
                            try{
                                while(sendingData){
                                    sendHTTPRequest();
                                    System.out.println("SENDING HTTP REQUEST");
                                    Thread.sleep(PERIOD);
                                }
                            } catch (InterruptedException e) { //The user stopped sending information
                            }catch(Exception ioe){
                                ioe.getStackTrace();
                            }
                        }
                    };
                    waitingForCancel.start();
                }else{
                    sendingData = false;
                    waitingForCancel.interrupt();
                    clickButton.setText("SEND");
                    clickButton.setBackgroundColor(Color.GREEN);
                }
            }
        });
    }
    /*{
        “proximity”: 0,
        “battery”: 53,
        “latitude”:-8.2718,
        “longitude”:40.912732,
        “timestamp”: 1559322280399
    }
    */
    public void sendHTTPRequest() throws IOException{
        String url = URL_POST;
        URL obj = new URL(url);
        HttpURLConnection con = (HttpURLConnection) obj.openConnection();
        // optional default is GET
        con.setRequestMethod("POST");
        //add request header
        String token= null;
        try{
            token = USERNAME+":"+PASSWORD;
            //token = loginRequest();
        }catch(Exception e){}
        String encoded = encode(token.getBytes());
        con.setRequestProperty("Authorization", "Basic "+encoded);
        con.setRequestProperty ("content-type", "application/json");
        // For POST only - START
        con.setDoOutput(true);
        OutputStream os = con.getOutputStream();
        String POST_PARAMS = "{\"proximity\":"+proximityValue+",\"battery\":"+batteryValue+",\"latitude\":"+latitudeValue+", \"longitude\":"+longitudeValue+"}";
        System.out.println(POST_PARAMS);
        os.write(POST_PARAMS.getBytes());
        os.flush();
        os.close();
        // For POST only - END
        //con.setRequestProperty("User-Agent", "Mozilla/5.0");
        int responseCode = con.getResponseCode();
        System.out.println("\nSending 'POST' request to URL : " + url);
        System.out.println("Response Code : " + responseCode);
        BufferedReader in = new BufferedReader(
                new InputStreamReader(con.getInputStream()));
        String inputLine;
        StringBuffer response = new StringBuffer();
        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine);
        }
        in.close();
        //print in String
        System.out.println(response.toString());
    }

    /* Returns the session token */
    private String loginRequest()throws Exception{
        String url = URL_LOGIN;
        URL obj = new URL(url);
        HttpURLConnection con = (HttpURLConnection) obj.openConnection();
        // optional default is GET
        con.setRequestMethod("POST");
        con.setRequestProperty ("content-type", "application/json");
        // For POST only - START
        con.setDoOutput(true);
        OutputStream os = con.getOutputStream();
        String POST_PARAMS = "{\"username\":\""+USERNAME+"\",\"password\":\""+PASSWORD+"\"}";
        os.write(POST_PARAMS.getBytes());
        os.flush();
        os.close();
        // For POST only - END
        int responseCode = con.getResponseCode();
        System.out.println("\nSending 'POST' request to URL : " + url);
        System.out.println("Response Code : " + responseCode);
        BufferedReader in = new BufferedReader(
                new InputStreamReader(con.getInputStream()));
        String inputLine;
        StringBuffer response = new StringBuffer();
        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine);
        }
        in.close();
        //print in String
        JSONObject jj = new JSONObject(response.toString());
        String token = jj.getString("jwt");
        return token;
    }

    /*---------- Listener class to get coordinates ------------- */
    private class MyLocationListener implements LocationListener {

        @Override
        public void onLocationChanged(Location loc) {
            String longitude = ""+loc.getLongitude();
            String latitude = ""+loc.getLatitude();
            longitudeValue = longitude;
            latitudeValue = latitude;
            TextView longTxt = (TextView) findViewById(R.id.longTxt);
            TextView latTxt = (TextView) findViewById(R.id.latTxt);
            longTxt.setText(longitude);
            latTxt.setText(latitude);

            /*------- To get city name from coordinates -------- */
            /*String cityName = null;
            Geocoder gcd = new Geocoder(getBaseContext(), Locale.getDefault());
            List<Address> addresses;
            try {
                addresses = gcd.getFromLocation(loc.getLatitude(),
                        loc.getLongitude(), 1);
                if (addresses.size() > 0) {
                    System.out.println(addresses.get(0).getLocality());
                    cityName = addresses.get(0).getLocality();
                }
            }
            catch (IOException e) {
                e.printStackTrace();
            }
            String s = longitude + "\n" + latitude + "\n\nMy Current City is: "
                    + cityName;*/
        }

        @Override
        public void onProviderDisabled(String provider) {}

        @Override
        public void onProviderEnabled(String provider) {}

        @Override
        public void onStatusChanged(String provider, int status, Bundle extras) {}
    }

    private BroadcastReceiver mBatInfoReceiver = new BroadcastReceiver(){
        @Override
        public void onReceive(Context ctxt, Intent intent) {
            int level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, 0);
            batteryValue = level;
            batteryTxt.setText(String.valueOf(level) + "%");
        }
    };

    @Override
    public void onBackPressed() {
        DrawerLayout drawer = findViewById(R.id.drawer_layout);
        if (drawer.isDrawerOpen(GravityCompat.START)) {
            drawer.closeDrawer(GravityCompat.START);
        } else {
            super.onBackPressed();
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        return super.onOptionsItemSelected(item);
    }

    @SuppressWarnings("StatementWithEmptyBody")
    @Override
    public boolean onNavigationItemSelected(MenuItem item) {
        // Handle navigation view item clicks here.
        int id = item.getItemId();

        if (id == R.id.nav_home) {
            // Handle the camera action
        } else if (id == R.id.nav_gallery) {

        } else if (id == R.id.nav_slideshow) {

        } else if (id == R.id.nav_tools) {

        } else if (id == R.id.nav_share) {

        } else if (id == R.id.nav_send) {

        }

        DrawerLayout drawer = findViewById(R.id.drawer_layout);
        drawer.closeDrawer(GravityCompat.START);
        return true;
    }

    public static String encode(byte[] data)
    {
        char[] tbl = {
                'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P',
                'Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f',
                'g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v',
                'w','x','y','z','0','1','2','3','4','5','6','7','8','9','+','/' };
        StringBuilder buffer = new StringBuilder();
        int pad = 0;
        for (int i = 0; i < data.length; i += 3) {
            int b = ((data[i] & 0xFF) << 16) & 0xFFFFFF;
            if (i + 1 < data.length) {
                b |= (data[i+1] & 0xFF) << 8;
            } else {
                pad++;
            }
            if (i + 2 < data.length) {
                b |= (data[i+2] & 0xFF);
            } else {
                pad++;
            }
            for (int j = 0; j < 4 - pad; j++) {
                int c = (b & 0xFC0000) >> 18;
                buffer.append(tbl[c]);
                b <<= 6;
            }
        }
        for (int j = 0; j < pad; j++) {
            buffer.append("=");
        }
        return buffer.toString();
    }
}
