declare module 'facebook-nodejs-business-sdk' {
  export interface FacebookAdsApi {
    call: (path: string[], params?: any, options?: any) => Promise<any>;
  }

  export interface AdAccount {
    id: string;
    name: string;
    account_status: number;
    currency: string;
    timezone_name: string;
  }

  export interface User {
    id: string;
    name: string;
    email?: string;
  }

  export interface ApiResponse<T> {
    data: T;
    paging?: {
      cursors: {
        before: string;
        after: string;
      };
      next?: string;
    };
  }

  const bizSdk: {
    FacebookAdsApi: {
      init: (accessToken: string) => FacebookAdsApi;
    };
    AdAccount: new (id: string) => any;
    Campaign: new (id: string) => any;
    AdSet: new (id: string) => any;
    Ad: new (id: string) => any;
  };

  export default bizSdk;
} 