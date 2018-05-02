#The purpose of this script is to connect each node to one another using the service endpoint '/addPeers'
import requests
import json

#define a list populated with url of each node
ports = [
    'http://localhost:5000',
    'http://localhost:5001',
    'http://localhost:5002',
    'http://localhost:5003',
    'http://localhost:5004',
    'http://localhost:5005',
    'http://localhost:5006',
    'http://localhost:5007',
    'http://localhost:5008',
    'http://localhost:5009'
    ]

#add all other ports as nodes on the network by looping through the list and calling the '/addPeers' endpoint
for port in ports:
    #identify peers
    peers = []
    for peer in ports:
        if (peer != port):
            peers.append(peer)

    #call API endpoint to add peers
    headers = {'content-type': 'application/json'}
    url = port + "/addPeers"
    data = {"nodes": peers}    
    data = str(data).replace('\'', '"')
    response = requests.post(url, data = data, headers= headers)