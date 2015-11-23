/*global angular, jQuery, $*/
/*Some additions to ES*/
Object.inherit=inherit;
function inherit(Child, Parent) {
        var F = function() { }
        F.prototype = Parent.prototype
        Child.prototype = new F()
        Child.prototype.constructor = Child
        Child.superclass = Parent.prototype
}
function RESTResponseError(message,name,errors){
 this.message=message;
 this.name=name;
 this.errors=errors;
}
Object.inherit(RESTResponseError, Error);

function _requestFactoryGen($rootScope,$http){
  this._showDebug=true;
  this._handleResponse=function _handleResponse(title,response){
    if (response.data.result && response.data.result=='error'){
      var errorScope=null;

      if (angular.isArray(response.data.errors)){
        errorScope=response.data.errors.reduce(function(p,n){
          if (n.code){
            p[n.code]=n.message;
          }
          return p;
        },{})
      }else if(angular.isObject(response.data.errors)){
        errorScope=response.data.errors;
      }
      var err=new RESTResponseError(title?title:'RequestTo: '+response.config.url, "RESTResponseError", errorScope);
      if (this._showDebug){
        console.log(err.message);
        console.table(err);
      }
      throw err;
    }
    return response.data;
  }
  this._handleError=function _handleError(title,response){
    var errorScope={};
    if (response.data && response.data.length>0){
      var text=response.data.split(/<\/?body>/);
      var textDom=document.createElement('div');
      if (text.length>1){
        textDom.innerHTML=text[1];
      }else{
        textDom.innerHTML=text[0];
      }
      errorScope[response.statusCode]=textDom.innerText;
    }else if(response.statusText && response.statusText.length>0){
      errorScope[response.statusCode]=response.statusText;
    }else{
      errorScope[response.statusCode]="Server error";
    }

    var err=new RESTResponseError(title?title:'RequestTo: '+response.config.url,"RESTResponseError", errorScope);
    if (this._showDebug){
      console.log(err.message);
      console.table(err);
    }
    throw err;
  }

  function makeRequest(uri,data,title){
    return $http.post(uri,data).then(this._handleResponse.bind(this,title),this._handleError.bind(this,title));
  }
  this.makeRequest=makeRequest;
}

function _paginationControllerGen(){

  this.navigation={
      "rpp":10,
      "records":null,
      "offset":0
    };
  this.pagination=[];

  this._makePaginator=function _makePaginator(navigation){
    var pagination=[];
    var edge=1;//pages to show on edge of navigation block
    var edge_tol=2 //edges tolerance
    var center=5;

    var max=Math.ceil(navigation.records/navigation.rpp);
    pagination.active=((navigation.offset/navigation.rpp)|0)+1;
    if (max>(edge*3+edge_tol*2)){
      var half_center=center/2|0;
      var doLeftJoin=!((pagination.active-half_center)>(edge+edge_tol));
      var mid_start=Math.max(edge+1,pagination.active-half_center-(doLeftJoin?edge_tol:0));
      var mid_end=Math.min(max-edge,mid_start+center-1);
      if ((mid_end+edge_tol)>=(max-edge)){//doRightJoin
        mid_end=Math.min(max-edge,mid_start+center-1+edge_tol);
      }

      for (var i=1;i<=edge;i++){
        pagination.push({
          number:i
        });
      }
      if(mid_start>(edge+edge_tol)){
        pagination.push({
          number:null
        });
      }

      for (var i=mid_start;i<=mid_end;i++){
        pagination.push({
          number:i
        });
      }

      if(mid_end<max-edge-edge_tol){
        pagination.push({
          number:null
        });
      }

      for (var i=(max-edge+1);i<=max;i++){
        pagination.push({
          number:i
        });
      }

    }else{
      for (var i=0;i<max;i++){
        pagination.push({
          number:i+1
        });
      }
    }
    return pagination;
  }

  this.canDoNavPrev=function canDoNavPrev(){
    return (this.navigation.offset-this.navigation.rpp)>0;
  }
  this.canDoNavNext=function canDoNavNext(){
    return !((this.navigation.offset+this.navigation.rpp)>=this.navigation.records);
  }
  this.doNavTo=function doNavTo(page){
    var newOffset=((page-1)*this.navigation.rpp);
    if (
        newOffset>-1 && !(newOffset>this.navigation.records)
      ){
      this.navigation.offset=newOffset;
      this.pagination=this._makePaginator(this.navigation);
      return true;
    }
    return false;
  }
  this.doNavNext=function doNavNext(){
    return this.doNavTo(this.pagination.active+1);
  }
  this.doNavPrev=function doNavPrev(){
    return this.doNavTo(this.pagination.active-1);
  }



}
