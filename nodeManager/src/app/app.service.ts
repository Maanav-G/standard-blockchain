import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Transaction } from './model/transaction.model'
import { ServiceNode } from './model/servicenode.model'
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
declare var $: any;

@Injectable()
export class AppService {

    constructor (private http: Http) {}

    // creates request to get the chain data from node
    getTable(url: string) : Observable<any> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Access-Control-Allow-Origin', '*');
        
        return this.http.get(url + "/chain", {headers: headers})
        .map((res: Response) => res.json())
        .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
    }

    // creates request to add transaction to pending transaction
    addTransaction(url: string, transaction: Transaction) : Observable<string> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Authorization', this.getToken());

        let debit = this.getDebitString(transaction);
        let credit = this.getCreditString(transaction);
        let body = {
            'id': transaction.id,
            'date': transaction.date,
            'description': transaction.description,
            'debit': debit,
            'credit': credit
        }

        let options = new RequestOptions({headers: headers});
        
        return this.http.post(url + "/newTransaction", body, options)
        .map((res: Response) => res.json())
        .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
    }

    // creates request to get pending transaction on the node
    getPendingTransactions(url: string) : Observable<Array<Transaction>> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Access-Control-Allow-Origin', '*');
        
        return this.http.get(url + "/getPendingTransactions", {headers: headers})
        .map((res: Response) => res.json())
        .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
    }

    // creates request to mine a block on the node
    mineBlock(url: string) : Observable<string> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Authorization', this.getToken());
        
        return this.http.get(url + "/mineBlock", {headers: headers})
        .map((res: Response) => res.json())
        .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
    }

    // creates request to get peers connected to the node
    getPeers(url: string) : Observable<string> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Access-Control-Allow-Origin', '*');
        
        return this.http.get(url + "/getPeers", {headers: headers})
        .map((res: Response) => res.json())
        .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
    }

    // creates request to handle the node, resolving any conflicts between nodes on the network
    handleNode(url: string) : Observable<string> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Authorization', this.getToken());
        
        return this.http.get(url + "/handleNode", {headers: headers})
        .map((res: Response) => res.json())
        .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
    }

    // creates request to get the unique identifier of the node
    getUniqueID(url: string) : Observable<string> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Access-Control-Allow-Origin', '*');
        
        return this.http.get(url + "/getUniqueID", {headers: headers})
        .map((res: Response) => res.json())
        .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
    }

    // creates request to get all nodeURL and unique identifiers on the network
    getNodes() : Observable<Array<ServiceNode>> {
        let nodeURLs = [
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
        ];

        let nodes: Array<ServiceNode> = [];

        for (var i = 0; i < nodeURLs.length; i ++) {
            let url = nodeURLs[i];
            let uniqueID = this.getUniqueID(url);
            nodes.push(new ServiceNode(url, uniqueID));
        }

        let response: BehaviorSubject<Array<ServiceNode>> = new BehaviorSubject<Array<ServiceNode>>(nodes);

        return response.asObservable();
    }

    // retrieves all currencies supported
    getCurrencies() {
        return [
            'USD',
            'CAD',
            'GBP',
            'BTC',
            'ETH'
        ];
    }

    // generates transcations based on the './assets/generatedTranscations.json' file
    generateTransactions() : Observable<Array<Transaction>> {
        return this.http.get("./assets/generatedTransactions.json")
        .map((res:any) => res.json())
        .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
    }

    // get string to use for debit param for transaction
    getDebitString(transaction: Transaction) {
        if (transaction.debitType != undefined && transaction.debitType != null)
            return transaction.debit != transaction ? '$' + transaction.debit + ' ' + transaction.debitType : '';
        else return transaction.debit;
    }

    // get string to use for credit param for transaction
    getCreditString(transaction: Transaction) {
        if (transaction.creditType != undefined && transaction.creditType != null)
            return transaction.credit != undefined ? '$' + transaction.credit + ' ' + transaction.creditType : '';
        else return transaction.credit;
    }

    // makes a request to retrieve a JWT token using username and password
    login(url: string, username: string, password:string) : Observable<string> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Access-Control-Allow-Origin', '*');

        let body = {
            "username": username,
            "password": password
        }

        let options = new RequestOptions({headers: headers});
        
        return this.http.post(url + "/auth", body, options)
        .map((res: Response) => res.json())
        .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
    }

    // get token from sessionStorage, if it exists
    getToken() : string {
        return 'JWT ' + sessionStorage.getItem('jwt');
    }
}