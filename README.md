# Blockchain

A standard Blockchain created for the Deloitte Case Competition at CUTC

## Getting Started

The following instructions will allow you to run the project on your local device. 
Required - node.js and python 3


### Installing the Python dependencies
Following are the externaql libraries uses in this project - installed using pip

```
pip install requests
pip install flask
pip install flask_cors
pip install flask_jwt
pip install hashlib
```

### Running the Python scripts for the service

ports.py - launches 10 different nodes on your localhost on ports 5000, 5001, 5002, 5003, 5004, 5005, 5006, 5007, 5008 and 5009
connect.py - connects the nodes to one another

```
python ports.py
python connect.py
```

### Launch the Angular website

Install the following modules for the Angular project and then launch the website.

```
cd './nodeManager'
npm install
npm start
```
