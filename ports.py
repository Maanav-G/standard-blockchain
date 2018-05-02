#The purpose of this script is to initiate 10 different nodes on your localhost using python's subprocess library

import subprocess, sys

procs = []

#We will be initiating the blockchain server on the ports 5000, 5001, 5002, etc. with perspective unique identifiers ABCCorp, Corp 1, Corp 2, etc. by using the predefined nodes variable
nodes = [
    ('5000', 'ABCCorp'),
    ('5001', 'Corp 1'),
    ('5002', 'Corp 2'),
    ('5003', 'Corp 3'),
    ('5004', 'Corp 4'),
    ('5005', 'Corp 5'),
    ('5006', 'Corp 6'),
    ('5007', 'Corp 7'),
    ('5008', 'Corp 8'),
    ('5009', 'Corp 9')
    ]

#Loop through each port and initiate blockchain
for node in nodes:
    proc = subprocess.Popen(["python", "__init__.py", "-p", node[0], "-i", node[1]])
    procs.append(proc)

for proc in procs:
    proc.wait()