import { Injectable } from '@angular/core';

@Injectable()
export class UtilityService {
  public addSurroundingSlashes(string: string): string {
    if (string[0] !== '/') {
      string = '/' + string;
    }
    if (string[string.length - 1] !== '/') {
      string = string + '/';
    }
    return string;
  }

  public bodyToQueryParams(data: any): string {
    if (data === null) {
      return '';
    }
  
    let paramStrings = [];
    for (let param in data) {
      if (typeof data[param] == 'object') {
        data[param] = JSON.stringify(data[param]);
      }
      paramStrings.push(encodeURIComponent(param) + "=" + encodeURIComponent(data[param]));
    }

    return "?" + paramStrings.join("&");
  }
}