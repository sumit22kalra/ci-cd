import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';

import { BuildHistoryModel } from '../models/build-history.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JenkinsService {

  constructor(private http: HttpClient) {}

  getBuildHistory(): Observable<BuildHistoryModel[]> {

    const devUrl =
      `${environment.jenkinsUrl}/job/${environment.jobs.dev}/api/json?tree=builds[number,result,timestamp,duration]`;

    const testingUrl =
      `${environment.jenkinsUrl}/job/${environment.jobs.testing}/api/json?tree=builds[number,result,timestamp,duration]`;

    const prodUrl =
      `${environment.jenkinsUrl}/job/${environment.jobs.prod}/api/json?tree=builds[number,result,timestamp,duration]`;

    return forkJoin([
      this.http.get<any>(devUrl),
      this.http.get<any>(testingUrl),
      this.http.get<any>(prodUrl)
    ]).pipe(

      map(([dev, testing, prod]) => {

        let builds: BuildHistoryModel[] = [];

        builds.push(
          ...this.mapBuilds(dev?.builds || [], 'DEV', environment.jobs.dev)
        );

        builds.push(
          ...this.mapBuilds(testing?.builds || [], 'TESTING', environment.jobs.testing)
        );

        builds.push(
          ...this.mapBuilds(prod?.builds || [], 'PROD', environment.jobs.prod)
        );

        return builds.sort(
          (a, b) =>
            Number(b.buildNo.replace('#', '')) -
            Number(a.buildNo.replace('#', ''))
        );
      })
    );
  }

  promoteBuild(targetJob: string, sourceBuildNo: string): Observable<any> {
    // This triggers a Jenkins job with parameters to "move" the build
    const url = `${environment.jenkinsUrl}/job/${targetJob}/buildWithParameters`;
    const params = {
      SOURCE_BUILD_NUMBER: sourceBuildNo.replace('#', ''),
      PROMOTED_BY: 'CI-CD-Dashboard'
    };
    return this.http.post(url, null, { params });
  }

  private mapBuilds(
    builds: any[],
    environmentName: 'DEV' | 'TESTING' | 'PROD',
    jobName: string
  ): BuildHistoryModel[] {

    return builds.map((build, index) => {

      const buildDate = new Date(build.timestamp);

      return {

        sno: index + 1,

        buildNo: `#${build.number}`,

        environment: environmentName,

        buildDate:
          buildDate.toLocaleDateString(),

        buildTime:
          buildDate.toLocaleTimeString(),

        status:
          build.result || 'RUNNING',

        statusCode:
          build.result === 'SUCCESS'
            ? 200
            : build.result === 'FAILURE'
              ? 500
              : 102,

        triggeredBy: 'Jenkins',

        duration:
          Math.round(build.duration / 1000) + ' Sec',

        buildUrl:
          `${environment.jenkinsUrl}/job/${jobName}/${build.number}`
      };
    });
  }
}