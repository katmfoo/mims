import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { UtilityService } from './utility.service';

enum Method { Get, Post, Put }

@Injectable()
export class ApiCallService {

  public apiUrl: string = "http://mims.cf:5000"

  constructor(private http: HttpClient, private utility: UtilityService) {}

  public get(endpoint: string, data: any) {
    return this.execute(Method.Get, endpoint, data);
  }

  public post(endpoint: string, data: any) {
    return this.execute(Method.Post, endpoint, data);
  }

  public put(endpoint: string, data: any) {
    return this.execute(Method.Put, endpoint, data);
  }

  private execute(method: Method, endpoint: string, data: any) {
    const promise = new Promise((resolve) => {
      let headers = new HttpHeaders();
      let access_token = localStorage.getItem('access-token');
      if(access_token !== null) {
        headers = headers.append('access-token', access_token);
      }
      headers = headers.append('Content-Type', 'application/json');

      let observable: Observable<any>;
      let endpointUrl = this.apiUrl + this.utility.addSurroundingSlashes(endpoint);
      const requestOptions: any = {headers: headers};

      switch (method) {
        case Method.Get:
          observable = this.http.get(endpointUrl + this.utility.bodyToQueryParams(data), requestOptions);
          break;
        case Method.Post:
          observable = this.http.post(endpointUrl, data, requestOptions);
          break;
        case Method.Put:
          observable = this.http.put(endpointUrl, data, requestOptions);
          break;
      }

      observable.subscribe((response: any) => {
        resolve(response);
      });
    });
    return promise;
  }
}
