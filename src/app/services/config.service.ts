import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';

declare var app_config: any;

@Injectable()
export class ConfigService {
constructor(private http:Http) {}

private result: Object;

getConfiguration(key) {
    return app_config[key]
}
}