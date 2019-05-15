import yaml
import requests
import random

'''
######### Device info ###########
{ 
  "device_name" : "drone3d",
  "description": "The real drone from the Drone3D team",
  "vertical": "Temperature",
  "mobile": true,
  "latitude": 40.6338934,
  "longitude": -8.6602627
}
########## Stream info ###########
{
    "id": "5cdb63236816ec3c271e79c2"
	"stream": "Temperature stream real",
	"description": "Temperature value from the drone",
	"device_id": "drone3d",
	"type": "TemperatureOut",
	"ttl": 1000,
	"periodicity": 10
}
######### Publish values body #########
{ 
  "stream_name": "Temperature stream real",
  "value": "18",
  "latitude": 40.6338934,
  "longitude": -8.6602627
}
'''

#Resources information
dev_name = "drone3d"
vertical = "Temperature"
stream_name = "Temperature stream real"
TEMP_MIN = 19
TEMP_MAX = 20


# Start of script
DOC = ""
line_index = 0
print('Publishing values...')
while True:
    #try:
    line = input()
    line_index += 1
    if line == "---":
        doc_yml = yaml.load(DOC)
        latitude = None
        longitude = None
        for k,v in doc_yml.items():
            if k == "latitude":
                latitude = v
            if k == "longitude":
                longitude = v
        #If it has the latitute and longitude, publishes the value
        if latitude and longitude:
            publish_values_request_body = { 
                "stream_name": "Temperature stream real",
                "value": str(random.uniform(TEMP_MIN,TEMP_MAX)),
                "latitude": latitude,
                "longitude": longitude
            }
            r = requests.post('http://193.136.93.14:8001/czb/values',json=publish_values_request_body)
        DOC = ""
    else:
        DOC += line + "\n"

    #except:
    #    print('FINISHED!')
