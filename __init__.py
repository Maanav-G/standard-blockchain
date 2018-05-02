
from model.blockchain import Blockchain
from model.user import User, UserTable
from argparse import ArgumentParser
from flask import Flask, jsonify, request
from flask_jwt import JWT, jwt_required, current_identity
from flask_cors import CORS
import requests

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret'
CORS(app)

#Sample table for authorized users abled to call certain endpoints
users = [
    User(1, 'user', 'password'),
    User(2, 'user2', 'password'),
    User(3, 'user3', 'password')
]

#Create Blockchain object, see more in './model/blockchain.py' file
blockchain = Blockchain()
#Create UserTable object, see more in './model/user.py' file
userTable = UserTable(users)

#Create a JSON Web Token handler using external library (flask_jwt)
jwt = JWT(app, userTable.authenticate, userTable.identity)

#Declare endpoint '/chain', this is a GET method and will return the blockchain data on this node
@app.route('/chain', methods=['GET'])
def chain():
    response = {
        'chain': blockchain.chain,        
        'length': len(blockchain.chain)
    }
    return jsonify(response), 200

#Declare endpoint '/newTransaction', this POST method will add a new transcation to pending transactions
#Requires a valid JWT authentication token
@app.route('/newTransaction', methods=['POST'])
@jwt_required()
def newTransaction():
    transaction = request.get_json()

    required = ['id', 'date', 'description', 'debit', 'credit']

    #Checks that the passed in body is valid for a transaction
    if not all(key in transaction for key in required):
        return 'Invalid request', 400

    placedIndex = blockchain.createNewTransaction(transaction['id'], transaction['date'], transaction['description'], transaction['debit'], transaction['credit'])

    response = {'message': f'New transaction will be added to block {placedIndex}'}
    return jsonify(response), 201

#Declare endpoint '/getPendingTransactions', this is a GET method and will return all pending transactions
@app.route('/getPendingTransactions', methods=['GET'])
def getPendingTransactions():
    response = {
        'transactions': blockchain.pending_transaction
    }
    return jsonify(response), 200

#Declare endpoint '/mineBlock'. When invoked, this GET method will add a block along with all pending transactions
#will return values in the block and all pending transactions that it contains
@app.route('/mineBlock', methods=['GET'])
@jwt_required()
def mineBlock():
    lastBlock = blockchain.getLastBlock()
    proof = blockchain.proofOfWork(lastBlock)
    previous_hash = blockchain.calculateHash(lastBlock)

    #Create the block and add it to the chain after proof of work is complete
    block = blockchain.createNewBlock(proof, previous_hash, blockchain.uniqueID)

    response = {
        'message': 'Created new block',
        'index': block['index'],
        'transactions': block['transactions'],
        'proof': block['proof'],
        'previous_hash': block['previous_hash']
    }

    return jsonify(response), 200

#Declare endpoint '/addPeers', this POST method will add new peers to the network
@app.route('/addPeers', methods=['POST'])
def addPeers():
    nodes = request.get_json().get('nodes')

    if nodes is None:
        return "Invalid request", 400

    for node in nodes:
        blockchain.addPeer(node)

    response = {
        'message': 'Peers have been added',
        'peers': list(blockchain.nodes)
    }

    return jsonify(response), 201

#Declare endpoint '/getPeers', this GET method will return all peers connected to the network
@app.route('/getPeers', methods=['GET'])
def getPeers():
    response = {
        'peers': list(blockchain.nodes)
    }
    return jsonify(response), 200

#Declare endpoint '/handleNode', this is a GET method will handle any conflicts with chains on the network and return its results
#Requires a valid JWT authentication token
@app.route('/handleNode', methods=['GET'])
@jwt_required()
def handleNode():
    replaced = blockchain.handleNode()

    if replaced:
        response = {
            'message': 'Our chain was replaced',
            'new_chain': blockchain.chain
        }
    else:
        response = {
            'message': 'Our chain is authoritative',
            'chain': blockchain.chain
        }

    return jsonify(response), 200

#Declare endpoint '/getUniqueID', this is a GET method and will return the unique identifier associated with this node
@app.route('/getUniqueID', methods=['GET'])
def getUniqueID():
    response = {
        'uniqueID': blockchain.uniqueID
    }
    return jsonify(response), 200

#Settings for running the service, may choose to specify port and unique identifier values
if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument('-i', '--identifier', default='ABCCorp', type=str, help='unique identifier')
    parser.add_argument('-p', '--port', default=5000, type=int, help='port to listen on')
    args = parser.parse_args()
    port = args.port
    blockchain.uniqueID = args.identifier

    app.run(port=port)