import yaml

stream = open("drone3d_data.yml", "r")
docs = yaml.load_all(stream)
for doc in docs:
    for k,v in doc.items():
        print('k:',k)