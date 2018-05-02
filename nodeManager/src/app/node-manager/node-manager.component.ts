import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { NgTableComponent, NgTableFilteringDirective, NgTablePagingDirective, NgTableSortingDirective } from 'ng2-table/ng2-table';
import { Transaction } from '../model/transaction.model'
import { ServiceNode } from '../model/servicenode.model'
import { CurrencyMaskModule } from "ng2-currency-mask";
declare var $: any;

@Component({
  selector: 'node-manager',
  templateUrl: './node-manager.component.html'
})

export class NodeManagerComponent implements OnInit {
  
  constructor(private appService: AppService) { }

  // variables for tables displayed on view
  public rows_table:Array<Transaction> = [];
  public rows_pending:Array<Transaction> = [];
  public rows_nodes:Array<Transaction> = [];
  public rows_generate: Array<Transaction> = [];
  public columns:Array<any> = [
    {title: 'ID', name: 'id'},
    {title: 'Date', name: 'date'},
    {title: 'Description', name: 'description'},
    {title: 'Debit', name: 'debit'},
    {title: 'Credit', name: 'credit'}
  ]

  public config:any = {
    paging: false,
    sorting: {columns: this.columns},
    filtering: {filterString: ''},
    className: ['table-striped', 'table-bordered']
  };

  currencies: Array<string> = [];
  nodes: Array<ServiceNode> = [];
  selectedNode: ServiceNode;
  newTransaction : Transaction = new Transaction();
  message: string = '';

  ngOnInit() {
    // call service to get a list of nodes on the network and populate transaction table with data from selected node
    this.appService.getNodes().subscribe((response: any) => {
      this.nodes = response;
      for (var i = 0; i < this.nodes.length; i++) {
        if(this.nodes[i].url === sessionStorage.getItem('connection')){
          this.selectedNode = this.nodes[i];
      
          this.appService.getTable(this.selectedNode.url).subscribe ((response: any) => {
            this.rows_table = [];
            let data : any = response.chain;
            let transactions : any = [];
            for (var i = 0; i < data.length; i++){
              if (data[i].creator_id === this.selectedNode.uniqueID)
                transactions.push(...data[i].transactions);
            }
            this.rows_table.push(...transactions);
          });
        }
      }
    });
    this.currencies = this.appService.getCurrencies();
    this.newTransaction.creditType = this.currencies[0];
    this.newTransaction.debitType = this.currencies[0];
  }

  // when node changes, it will populate transaction table with data from the new node
  onNodeChange(newNode) {
    for (let node of this.nodes){
      if (node.uniqueID == newNode){
        this.selectedNode = node;
    
        this.appService.getTable(this.selectedNode.url).subscribe ((response: any) => {
          this.rows_table = [];
          let data : any = response.chain;
          let transactions : any = [];
          for (var i = 0; i < data.length; i++){
            if (data[i].creator_id === this.selectedNode.uniqueID)
              transactions.push(...data[i].transactions);
          }
          this.rows_table.push(...transactions);
        });
        return ;
      }
    }    
  }

  // get a list of transactions from './assets/generatedTransactions.json' file and populate the modal table
  updateGeneratedTransactions() {
    this.appService.generateTransactions().subscribe((response: any) => {      
      this.rows_generate = [];
      let transactions : any = response;
      this.rows_generate.push(...transactions);
    });
  }

  // loop through the list of generated transactions and adds them to pending transactions on the chain
  addGeneratedTransactions() {
    if (this.rows_generate.length > 0) {
      for (var i = 0; i < this.rows_generate.length; i ++){
        this.appService.addTransaction(this.selectedNode.url, this.rows_generate[i]).subscribe((response: any) => {
          if (i == this.rows_generate.length) {
            this.rows_generate = [];
            $('#generateModal').modal('hide');
            this.message = i + " transactions were added to pending transactions";
            $('#dialog').modal('show');
          }
        });
      }
    }
  }

  // call service to create a new transaction and add it to pending transactions based on user iput on a form
  onNewTransaction() {
    this.appService.addTransaction(this.selectedNode.url, this.newTransaction).subscribe ((response: any) => {
      $('#transactionModal').modal('hide');
      this.message = response.message;
      $('#dialog').modal('show');
    });
    this.newTransaction = new Transaction();
    this.newTransaction.creditType = this.currencies[0];
    this.newTransaction.debitType = this.currencies[0];
  }

  // call service to get all pending transactions on the node and displays it in the mine block modal
  updatePendingTransactions() {
    this.appService.getPendingTransactions(this.selectedNode.url).subscribe ((response: any) => {
      this.rows_pending = [];
      let transactions : any = response.transactions;
      this.rows_pending.push(...transactions);
    });    
  }

  // call service to mine the block
  mineBlock() {
    this.appService.mineBlock(this.selectedNode.url).subscribe ((response: any) => {
      $('#mineBlockModal').modal('hide');
      this.message = response.message;
      $('#dialog').modal('show');
      this.onNodeChange(this.selectedNode.uniqueID);
    });
  }

  // call service to get all peers on the current node and displays it on sync modal
  updateNodes() {
    this.appService.getPeers(this.selectedNode.url).subscribe ((response: any) => {
      this.rows_nodes = [];
      let peers : any = response.peers;
      this.rows_nodes.push(...peers);
    });    
  }

  // call service to handle any conflicts on the network and updates the current node accordingly
  handleNode() {
    this.appService.handleNode(this.selectedNode.url).subscribe ((response: any) => {
      $('#syncModal').modal('hide');
      this.message = response.message;
      $('#dialog').modal('show');
      this.onNodeChange(this.selectedNode);
    });
  }
}
