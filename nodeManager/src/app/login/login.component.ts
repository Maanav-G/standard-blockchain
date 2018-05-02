import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { ServiceNode } from '../model/servicenode.model'
import { Router } from '@angular/router';
import { } from ''
declare var $: any;

@Component({
  selector: 'login',
  templateUrl: './login.component.html'
})

// this component corresponds to the home page '/'
export class LoginComponent {

  constructor(private router: Router, private appService: AppService) { }
  
  nodes: Array<ServiceNode> = [];
  selectedNode: ServiceNode;
  username: string;
  password: string;

  // when site is loaded, it will retrieve all nodes on the network for the 'Connection' drop down menu
  ngOnInit() {
    this.appService.getNodes().subscribe(response => {
      this.nodes = response;
      this.selectedNode = this.nodes[0];
    });
  }

  // when user clicks login, it will try an authenticate the user, if authenticated, app will store the JWT token in sessionStorage for later use
  onLogin() {
    this.appService.login(this.selectedNode.url, this.username, this.password).subscribe((response : any) => {
      sessionStorage.setItem('jwt', response.access_token);
      sessionStorage.setItem('connection', this.selectedNode.url);
      this.router.navigate(['/node-manager']);
    });
  }

  // update models when 'Connection' drop down menu value changes
  onNodeChange(newNode) {
    for (var i = 0; i < this.nodes.length; i++) {
      if(this.nodes[i].uniqueID === newNode){
        this.selectedNode = this.nodes[i];
      }
    }
  }
}
