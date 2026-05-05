/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export interface ErrorResponse {
  detail?: string;
}

export interface LoginRequest {
  username: string;
  /** @format password */
  password: string;
}

export interface LoginResponse {
  /** Bearer token for use in Authorization header */
  token?: string;
  user_id?: string;
  role?: "coordinator" | "admin";
}

export interface DiscountTier {
  /**
   * Discount tier number
   * @min 1
   */
  level: number;
  /**
   * Quantity threshold [kg]
   * @format float
   */
  quantity_kg: number;
  /**
   * Unit price [PLN/kg]
   * @format float
   */
  unit_price: number;
}

export interface DailyPrice {
  /**
   * Planning day
   * @min 1
   */
  day: number;
  /**
   * Base price [PLN/kg]
   * @format float
   */
  base_price: number;
  /**
   * Availability [kg]
   * @format float
   */
  availability_kg: number;
  discount_tiers?: DiscountTier[];
}

export interface DeliveryParams {
  /** Building ID */
  building_id: string;
  /**
   * Lead time [days]
   * @min 0
   */
  lead_time_days: number;
  /**
   * Fixed delivery cost [PLN]
   * @format float
   */
  fixed_cost_pln: number;
  /**
   * Correction cost [PLN/kg]
   * @format float
   * @default 0
   */
  correction_cost_per_kg?: number;
  /**
   * Maximum correction [kg]
   * @format float
   * @default 1000000
   */
  max_correction_kg?: number;
}

export interface DistributorCreateRequest {
  name: string;
  /** @format email */
  contact_email: string;
  contact_phone?: string | null;
  daily_prices: DailyPrice[];
  delivery_params: DeliveryParams[];
}

export interface DistributorUpdateRequest {
  name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  daily_prices?: DailyPrice[] | null;
  delivery_params?: DeliveryParams[] | null;
}

export type DistributorResponse = DistributorCreateRequest & {
  id?: string;
  /** @format date-time */
  created_at?: string;
  /** @format date-time */
  updated_at?: string;
};

export interface DailyDemand {
  /** @min 1 */
  day: number;
  /**
   * Daily demand [kg]
   * @format float
   * @min 0
   */
  demand_kg: number;
}

export interface BuildingCreateRequest {
  name: string;
  location?: string | null;
  /**
   * Storage capacity [kg]
   * @format float
   */
  max_capacity_kg: number;
  /**
   * Initial inventory level [kg]
   * @format float
   * @default 0
   */
  initial_inventory_kg?: number;
  daily_demand: DailyDemand[];
}

export type BuildingResponse = BuildingCreateRequest & {
  id?: string;
  /** @format date-time */
  created_at?: string;
  /** @format date-time */
  updated_at?: string;
};

export interface ScenarioCreateRequest {
  name: string;
  /**
   * Planning horizon [days]
   * @min 1
   * @max 30
   * @default 7
   */
  planning_horizon_days?: number;
  /** List of distributor IDs */
  distributor_ids: string[];
  /** List of building IDs */
  building_ids: string[];
  /** Discount tiers */
  discount_tiers: DiscountTier[];
  /**
   * Daily coffee decay rate
   * @format float
   * @min 0
   * @max 1
   * @default 0.05
   */
  decay_rate?: number;
  /** Historical orders in progress */
  historical_orders?: Record<string, number> | null;
}

export interface OrderItem {
  distributor_id?: string;
  building_id?: string;
  day?: number;
  /** 0 = no tier, >= 1 = discount tier number */
  threshold_level?: number;
  /** @format float */
  quantity_kg?: number;
}

export interface InventoryLevel {
  building_id?: string;
  day?: number;
  /** @format float */
  level_kg?: number;
}

export interface OptimizationResponse {
  scenario_id?: string;
  result_id?: string;
  /** AMPL solver status */
  status?: "Optimal" | "Infeasible" | "Unbounded" | "Not Solved";
  /**
   * Total cost of optimal solution [PLN]
   * @format float
   */
  total_cost_pln?: number;
  /** Order schedule */
  orders?: OrderItem[];
  /** Projected inventory levels */
  inventory_levels?: InventoryLevel[];
  cost_breakdown?: {
    purchase_base?: number;
    purchase_discount?: number;
    fixed_delivery?: number;
    total?: number;
  };
}

export interface OrderRecord {
  id?: string;
  result_id?: string;
  scenario_id?: string;
  orders?: OrderItem[];
  total_cost_pln?: number;
  confirmed_by?: string;
  status?: "confirmed" | "pending" | "cancelled";
  /** @format date-time */
  created_at?: string;
}

export interface InventoryStatus {
  building_id?: string;
  building_name?: string;
  /** @format float */
  current_inventory_kg?: number;
  /** @format float */
  max_capacity_kg?: number;
  /**
   * Warehouse fill level [%]
   * @format float
   */
  fill_percent?: number;
}

export interface ApiKeyCreateRequest {
  /** Descriptive key label */
  label: string;
}

export interface ApiKeyResponse {
  id?: string;
  /** API key (format: cof_...) */
  key?: string;
  label?: string;
  distributor_id?: string;
  active?: boolean;
  /** @format date-time */
  created_at?: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Coffee Supply Management System API
 * @version 1.0.0
 * @contact Team 67 - PZSP2 <coffee-system@pw.edu.pl>
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  auth = {
    /**
     * No description
     *
     * @tags Authentication
     * @name Login
     * @summary Log in as coordinator
     * @request POST:/auth/login
     */
    login: (data: LoginRequest, params: RequestParams = {}) =>
      this.request<LoginResponse, ErrorResponse>({
        path: `/auth/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Authentication
     * @name Register
     * @summary Register a new coordinator
     * @request POST:/auth/register
     */
    register: (data: LoginRequest, params: RequestParams = {}) =>
      this.request<LoginResponse, void>({
        path: `/auth/register`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  distributors = {
    /**
     * No description
     *
     * @tags Distributors
     * @name ListDistributors
     * @summary List distributors
     * @request GET:/distributors
     * @secure
     */
    listDistributors: (params: RequestParams = {}) =>
      this.request<DistributorResponse[], ErrorResponse>({
        path: `/distributors`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Distributors
     * @name CreateDistributor
     * @summary Add distributor
     * @request POST:/distributors
     * @secure
     */
    createDistributor: (
      data: DistributorCreateRequest,
      params: RequestParams = {},
    ) =>
      this.request<DistributorResponse, any>({
        path: `/distributors`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Distributors
     * @name GetDistributor
     * @summary Distributor details
     * @request GET:/distributors/{distributor_id}
     * @secure
     */
    getDistributor: (distributorId: string, params: RequestParams = {}) =>
      this.request<DistributorResponse, ErrorResponse>({
        path: `/distributors/${distributorId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Distributors
     * @name UpdateDistributor
     * @summary Update distributor
     * @request PUT:/distributors/{distributor_id}
     * @secure
     */
    updateDistributor: (
      distributorId: string,
      data: DistributorUpdateRequest,
      params: RequestParams = {},
    ) =>
      this.request<DistributorResponse, ErrorResponse>({
        path: `/distributors/${distributorId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Distributors
     * @name DeleteDistributor
     * @summary Delete distributor
     * @request DELETE:/distributors/{distributor_id}
     * @secure
     */
    deleteDistributor: (distributorId: string, params: RequestParams = {}) =>
      this.request<void, ErrorResponse>({
        path: `/distributors/${distributorId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Distributors - Self Service
     * @name UpdateOwnPrices
     * @summary Update own price list (distributor via API key)
     * @request PUT:/distributors/self/prices
     * @secure
     */
    updateOwnPrices: (
      data: DistributorUpdateRequest,
      params: RequestParams = {},
    ) =>
      this.request<DistributorResponse, ErrorResponse>({
        path: `/distributors/self/prices`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags API Keys
     * @name ListApiKeys
     * @summary List distributor API keys
     * @request GET:/distributors/{distributor_id}/api-keys
     * @secure
     */
    listApiKeys: (distributorId: string, params: RequestParams = {}) =>
      this.request<ApiKeyResponse[], any>({
        path: `/distributors/${distributorId}/api-keys`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags API Keys
     * @name CreateApiKey
     * @summary Generate API key for distributor
     * @request POST:/distributors/{distributor_id}/api-keys
     * @secure
     */
    createApiKey: (
      distributorId: string,
      data: ApiKeyCreateRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiKeyResponse, any>({
        path: `/distributors/${distributorId}/api-keys`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  apiKeys = {
    /**
     * No description
     *
     * @tags API Keys
     * @name RevokeApiKey
     * @summary Revoke API key
     * @request DELETE:/api-keys/{key_id}
     * @secure
     */
    revokeApiKey: (keyId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api-keys/${keyId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
  };
  buildings = {
    /**
     * No description
     *
     * @tags Buildings
     * @name ListBuildings
     * @summary List buildings
     * @request GET:/buildings
     * @secure
     */
    listBuildings: (params: RequestParams = {}) =>
      this.request<BuildingResponse[], any>({
        path: `/buildings`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Buildings
     * @name CreateBuilding
     * @summary Add building
     * @request POST:/buildings
     * @secure
     */
    createBuilding: (data: BuildingCreateRequest, params: RequestParams = {}) =>
      this.request<BuildingResponse, any>({
        path: `/buildings`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Buildings
     * @name GetBuilding
     * @summary Building details
     * @request GET:/buildings/{building_id}
     * @secure
     */
    getBuilding: (buildingId: string, params: RequestParams = {}) =>
      this.request<BuildingResponse, ErrorResponse>({
        path: `/buildings/${buildingId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Buildings
     * @name UpdateBuilding
     * @summary Update building
     * @request PUT:/buildings/{building_id}
     * @secure
     */
    updateBuilding: (
      buildingId: string,
      data: BuildingCreateRequest,
      params: RequestParams = {},
    ) =>
      this.request<BuildingResponse, any>({
        path: `/buildings/${buildingId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Buildings
     * @name DeleteBuilding
     * @summary Delete building
     * @request DELETE:/buildings/{building_id}
     * @secure
     */
    deleteBuilding: (buildingId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/buildings/${buildingId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
  };
  optimization = {
    /**
     * No description
     *
     * @tags Optimization
     * @name ListOptimizations
     * @summary Optimization history
     * @request GET:/optimization
     * @secure
     */
    listOptimizations: (params: RequestParams = {}) =>
      this.request<OptimizationResponse[], any>({
        path: `/optimization`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Optimization
     * @name RunOptimization
     * @summary Run optimization
     * @request POST:/optimization
     * @secure
     */
    runOptimization: (
      data: ScenarioCreateRequest,
      params: RequestParams = {},
    ) =>
      this.request<OptimizationResponse, any>({
        path: `/optimization`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  orders = {
    /**
     * No description
     *
     * @tags Orders
     * @name ListOrders
     * @summary Order history
     * @request GET:/orders
     * @secure
     */
    listOrders: (
      query?: {
        status?: "confirmed" | "pending" | "cancelled";
      },
      params: RequestParams = {},
    ) =>
      this.request<OrderRecord[], any>({
        path: `/orders`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Orders
     * @name ConfirmOrders
     * @summary Confirm order schedule
     * @request POST:/orders
     * @secure
     */
    confirmOrders: (
      query: {
        /** Optimization result ID to confirm */
        result_id: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<OrderRecord, any>({
        path: `/orders`,
        method: "POST",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  inventory = {
    /**
     * No description
     *
     * @tags Inventory
     * @name GetInventory
     * @summary Current inventory levels
     * @request GET:/inventory
     * @secure
     */
    getInventory: (params: RequestParams = {}) =>
      this.request<InventoryStatus[], any>({
        path: `/inventory`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Inventory
     * @name UpdateInventory
     * @summary Update building inventory
     * @request PUT:/inventory/{building_id}
     * @secure
     */
    updateInventory: (
      buildingId: string,
      query: {
        /**
         * @format float
         * @min 0
         */
        current_kg: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          building_id?: string;
          current_inventory_kg?: number;
        },
        any
      >({
        path: `/inventory/${buildingId}`,
        method: "PUT",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  health = {
    /**
     * No description
     *
     * @tags System
     * @name HealthCheck
     * @summary Health check
     * @request GET:/health
     */
    healthCheck: (params: RequestParams = {}) =>
      this.request<
        {
          /** @example "ok" */
          status?: string;
          /** @example "coffee-supply-api" */
          service?: string;
          /** @example "1.0.0" */
          version?: string;
        },
        any
      >({
        path: `/health`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
}
