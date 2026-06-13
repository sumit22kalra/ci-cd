export interface BuildHistoryModel {
  sno: number;
  buildNo: string;
  environment: string;
  buildDate: string;
  buildTime: string;
  statusCode: number;
  buildUrl: string;
  status: string;
  triggeredBy: string;
  duration: string;
}
export interface BuildSummary {

  totalBuilds: number;

  successfulBuilds: number;

  failedBuilds: number;

  runningBuilds: number;

  successRate: number;
}