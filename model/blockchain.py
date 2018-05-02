import hashlib
import json
import time
import requests
from urllib.parse import urlparse

class Blockchain:
    #Constructor will automatically create a genesis block to the chain and initiate variables
    def __init__(self):
        self.pending_transaction = []
        self.chain = []
        self.nodes = set()
        self.createNewBlock(100, '1', 'none')
        self.uniqueID = ''   
    
    #createNewBlock will create a new block and append it to the chain
    def createNewBlock(self, proof, previous_hash, creator_id):
        '''
        A block consists of:
        - an index to keep track of its position
        - a timestamp to denote when it was created
        - transaction records added by users
        - proof of work that it was mined
        - hash value of the previoud block used to validate the chain
        - unique identifier of the creator
        '''
        block = {
            'index': len(self.chain) + 1,
            'timestamp': time.time(),
            'transactions': self.pending_transaction,
            'proof': proof,
            'previous_hash': previous_hash or self.calculateHash(self.chain[-1]),
            'creator_id': creator_id
        }
        self.pending_transaction = []
        self.chain.append(block)
        return block
    
    #createNewTransaction method will create a new transactions, transactions are modelled after Appendix 2 in the provided document
    def createNewTransaction(self, id, date, description, debit, credit):
        transaction = {
            'id': id,
            'date': date,
            'description': description,
            'debit': debit,
            'credit': credit
        }
        self.pending_transaction.append(transaction)
        return self.getLastBlock()['index'] + 1

    #getLastBlock will get the last block in the chain
    def getLastBlock(self):
        return self.chain[-1]
    
    #validChain is used to check the chain is valid and not tampered with, by looping through the chain and checking that the 'previous_hash' value of each block is correct
    def validChain(self, chain):
        for i in range(1, len(chain)):
            block = chain[i]
            prevBlock = chain[i-1]

            if (self.calculateHash(prevBlock) != block['previous_hash']):
                return False

        return True
    
    #calculateHash will calculate the hash of a block based on its data
    @staticmethod
    def calculateHash(block):
        blockString = json.dumps(block, sort_keys=True).encode()
        return hashlib.sha256(blockString).hexdigest()

    #proofOfWork will use the client's computing power to validate proof, also known as mining
    
    def proofOfWork(self, lastBlock):
        lastProof = lastBlock['proof']
        lastHash = self.calculateHash(lastBlock)

        proof = 0
        while self.validProof(lastProof, proof, lastHash) is False:
            proof += 1

        return proof
    
    #validProof is used in part in the proofOfWork method for mining
    def validProof(self, lastProof, proof, lastHash):
        guess = f'{lastProof}{proof}{lastHash}'.encode()
        guessHash = hashlib.sha256(guess).hexdigest()
        return guessHash[:4] == "0000"

    #addPeer will add a node to the network
    def addPeer(self, address):
        url = urlparse(address)
        if url.netloc:
            self.nodes.add(url.netloc)
        elif url.path:
            self.nodes.add(url.path)
        else:
            raise ValueError('Invalid URL')
    
    #handleNode will check all nodes on the network and replace the current chain with any other chain on the network that is longer
    def handleNode(self):
        for node in self.nodes:
            if not 'http' in node:
                node = 'http://' + node
            response = requests.get(node + '/chain')

            if response.status_code == 200:
                length = response.json()['length']
                chain = response.json()['chain']

                if length > len(self.chain) and self.validChain(chain):
                    self.chain = chain
                    return True
        return False
