export interface PaypalOauthTokenResponse {
    scope: string;
    access_token: string;
    token_type: string;
    app_id: string;
    expires_in: number;
    nonce: string;
}

export interface PaypalLinkDescription {
    href: string;
    rel: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'CONNECT' | 'OPTIONS' | 'PATCH';
}

export interface PaypalPaymentMethod {
    payer_selected: 'PAYPAL' | string;
    payee_preferred: 'UNRESTRICTED' | 'IMMEDIATE_PAYMENT_REQUIRED';
}

export interface PaypalApplicationContext {
    brand_name?: string;
    locale?: string;
    shipping_preference?: 'GET_FROM_FILE' | 'NO_SHIPPING' | 'SET_PROVIDED_ADDRESS';
    user_action?: 'CONTINUE' | 'SUBSCRIBE_NOW';
    payment_method?: PaypalPaymentMethod;
    return_url: string;
    cancel_url: string;
}

export type PaypalCurrencyCode =
    | 'AUD'
    | 'BRL'
    | 'CAD'
    | 'CZK'
    | 'DKK'
    | 'EUR'
    | 'HKD'
    | 'HUF'
    | 'INR'
    | 'ILS'
    | 'JPY'
    | 'MYR'
    | 'MXN'
    | 'TWD'
    | 'NZD'
    | 'NOK'
    | 'PHP'
    | 'PLN'
    | 'GBP'
    | 'RUB'
    | 'SGD'
    | 'SEK'
    | 'CHF'
    | 'THB'
    | 'USD';

export type PaypalCountryCode =
    | 'AL'
    | 'DZ'
    | 'AD'
    | 'AO'
    | 'AI'
    | 'AG'
    | 'AR'
    | 'AM'
    | 'AW'
    | 'AU'
    | 'AT'
    | 'AZ'
    | 'BS'
    | 'BH'
    | 'BB'
    | 'BY'
    | 'BE'
    | 'BZ'
    | 'BJ'
    | 'BM'
    | 'BT'
    | 'BO'
    | 'BA'
    | 'BW'
    | 'BR'
    | 'VG'
    | 'BN'
    | 'BG'
    | 'BF'
    | 'BI'
    | 'KH'
    | 'CM'
    | 'CA'
    | 'CV'
    | 'KY'
    | 'TD'
    | 'CL'
    | 'C2'
    | 'CO'
    | 'KM'
    | 'CG'
    | 'CD'
    | 'CK'
    | 'CR'
    | 'CI'
    | 'HR'
    | 'CY'
    | 'CZ'
    | 'DK'
    | 'DJ'
    | 'DM'
    | 'DO'
    | 'EC'
    | 'EG'
    | 'SV'
    | 'ER'
    | 'EE'
    | 'ET'
    | 'FK'
    | 'FO'
    | 'FJ'
    | 'FI'
    | 'FR'
    | 'GF'
    | 'PF'
    | 'GA'
    | 'GM'
    | 'GE'
    | 'DE'
    | 'GI'
    | 'GR'
    | 'GL'
    | 'GD'
    | 'GP'
    | 'GT'
    | 'GN'
    | 'GW'
    | 'GY'
    | 'HN'
    | 'HK'
    | 'HU'
    | 'IS'
    | 'IN'
    | 'ID'
    | 'IE'
    | 'IL'
    | 'IT'
    | 'JM'
    | 'JP'
    | 'JO'
    | 'KZ'
    | 'KE'
    | 'KI'
    | 'KW'
    | 'KG'
    | 'LA'
    | 'LV'
    | 'LS'
    | 'LI'
    | 'LT'
    | 'LU'
    | 'MK'
    | 'MG'
    | 'MW'
    | 'MY'
    | 'MV'
    | 'ML'
    | 'MT'
    | 'MH'
    | 'MQ'
    | 'MR'
    | 'MU'
    | 'YT'
    | 'MX'
    | 'FM'
    | 'MD'
    | 'MC'
    | 'MN'
    | 'ME'
    | 'MS'
    | 'MA'
    | 'MZ'
    | 'NA'
    | 'NR'
    | 'NP'
    | 'NL'
    | 'NC'
    | 'NZ'
    | 'NI'
    | 'NE'
    | 'NG'
    | 'NU'
    | 'NF'
    | 'NO'
    | 'OM'
    | 'PW'
    | 'PA'
    | 'PG'
    | 'PY'
    | 'PE'
    | 'PH'
    | 'PN'
    | 'PL'
    | 'PT'
    | 'QA'
    | 'RE'
    | 'RO'
    | 'RU'
    | 'RW'
    | 'WS'
    | 'SM'
    | 'ST'
    | 'SA'
    | 'SN'
    | 'RS'
    | 'SC'
    | 'SL'
    | 'SG'
    | 'SK'
    | 'SI'
    | 'SB'
    | 'SO'
    | 'ZA'
    | 'KR'
    | 'ES'
    | 'LK'
    | 'SH'
    | 'KN'
    | 'LC'
    | 'PM'
    | 'VC'
    | 'SR'
    | 'SJ'
    | 'SZ'
    | 'SE'
    | 'CH'
    | 'TW'
    | 'TJ'
    | 'TZ'
    | 'TH'
    | 'TG'
    | 'TO'
    | 'TT'
    | 'TN'
    | 'TM'
    | 'TC'
    | 'TV'
    | 'UG'
    | 'UA'
    | 'AE'
    | 'GB'
    | 'US'
    | 'UY'
    | 'VU'
    | 'VA'
    | 'VE'
    | 'VN'
    | 'WF'
    | 'YE'
    | 'ZM'
    | 'ZW';

export interface PaypalMoney {
    currency_code: PaypalCurrencyCode;

    value: string;
}

export interface PaypalName {
    prefix: string;
    given_name: string;
    surname: string;
    middle_name: string;
    suffix: string;
    full_name: string;
}

export interface PaypalAdressPortable {
    address_line_1: string;
    address_line_2: string;
    admin_area_2: string;
    admin_area_1: string;
    postal_code: string;
    country_code: PaypalCountryCode;
}

export interface PaypalShippingDetail {
    name: Pick<PaypalName, 'full_name'>;
    address: PaypalAdressPortable;
}

export interface PaypalSubscriber {
    name: Pick<PaypalName, 'given_name' | 'surname'>;
    email_address: string;
    payer_id: string;
    shipping_address: PaypalShippingDetail;
}

export interface PaypalCycleExecution {
    tenure_type: 'REGULAR' | 'TRIAL';
    sequence: number;
    cycles_completed: number;
    cycles_remaining?: number;
    current_pricing_scheme_version?: number;
    total_cycles?: number;
}

export interface PaypalLastPaymentDetails {
    amount: PaypalMoney;
    time: string;
}

export interface PaypalFailedPaymentDetails {
    amount: PaypalMoney;
    time: string;
    reason_code: 'PAYMENT_DENIED' | 'COMPLIANCE_VIOLATION' | 'PAYEE_ACCOUNT_LOCKED_OR_CLOSED';
    next_payment_retry_time: string;
}

export interface PaypalBillingInfo {
    outstanding_balance: PaypalMoney;
    cycle_executions?: PaypalCycleExecution[];
    last_payment?: PaypalLastPaymentDetails;
    next_billing_time?: string;
    final_payment_time?: string;
    failed_payments_count: number;
    last_failed_payment?: PaypalFailedPaymentDetails;
}

export interface PaypalSubscriptionDetails {
    status?: 'APPROVAL_PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';
    status_change_note?: string;
    status_update_time?: string;
    id?: string;
    plan_id?: string;
    start_time?: string;
    quantity?: string;
    shipping_amount?: PaypalMoney;
    subscriber?: PaypalSubscriber;
    billing_info?: PaypalBillingInfo;
    create_time?: string;
    update_time?: string;
    links?: PaypalLinkDescription[];
}

export interface PaypalSubscriptionCreate {
    plan_id: string;
    start_time?: string;
    quantity?: string;
    shipping_amount?: PaypalMoney;
    subscriber?: PaypalSubscriber;
    application_context?: PaypalApplicationContext;
}
